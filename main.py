import sys
sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import os

# ============================================
# INITIALIZE APP
# ============================================
app = FastAPI(
    title       = "Mini Sandbox AI API",
    description = "Chennai Ward-Level Climate Risk Prediction",
    version     = "1.0.0"
)

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"]
)

# ============================================
# LOAD MODELS
# ============================================
MODELS = "D:/SandboxAI/models/"
BASE   = "D:/SandboxAI/"

print("Loading models...")

with open(MODELS + "flood_risk_model.pkl", 'rb') as f:
    flood_model = pickle.load(f)

with open(MODELS + "water_scarcity_model.pkl", 'rb') as f:
    water_model = pickle.load(f)

with open(MODELS + "vulnerability_model.pkl", 'rb') as f:
    vuln_model = pickle.load(f)

with open(MODELS + "sustainability_model.pkl", 'rb') as f:
    sust_model = pickle.load(f)

with open(MODELS + "label_maps.pkl", 'rb') as f:
    label_maps = pickle.load(f)

print("All models loaded!")

# ============================================
# LOAD WARD DATA
# ============================================
flood_df = pd.read_csv(BASE + "ml_flood_dataset.csv")
water_df = pd.read_csv(BASE + "ml_water_scarcity_dataset.csv")
vuln_df  = pd.read_csv(BASE + "ml_vulnerability_dataset.csv")
sust_df  = pd.read_csv(BASE + "ml_sustainability_dataset.csv")

print("All datasets loaded!")

# ============================================
# INPUT SCHEMAS
# ============================================
class WardInput(BaseModel):
    ward_number: int

class InterventionInput(BaseModel):
    ward_number     : int
    add_drainage    : int = 0
    plant_trees     : int = 0
    improve_hospital: int = 0

# ============================================
# HELPER FUNCTIONS
# ============================================
def get_flood_features(ward_row):
    return [[
        ward_row['norm_avg_hazard'].values[0],
        ward_row['norm_max_hazard'].values[0],
        ward_row['norm_high_zones'].values[0],
        ward_row['norm_flood2015'].values[0],
        ward_row['norm_inundation'].values[0],
        ward_row['norm_elevation'].values[0],
        ward_row['norm_drainage'].values[0]
    ]]

def get_water_features(ward_row):
    return [[
        ward_row['pop_total'].values[0],
        ward_row['rank_population'].values[0]
    ]]

def get_vuln_features(ward_row):
    return [[
        ward_row['norm_flood'].values[0],
        ward_row['norm_water'].values[0],
        ward_row['norm_population'].values[0],
        ward_row['norm_slum'].values[0],
        ward_row['norm_slum_area'].values[0],
        ward_row['norm_hospital'].values[0]
    ]]

def get_sust_features(ward_row):
    return [[
        ward_row['norm_drainage'].values[0],
        ward_row['norm_flood'].values[0]
    ]]

def decode_label(prediction, model_type):
    return label_maps[model_type][int(prediction[0])]

# ============================================
# ROUTES
# ============================================

# Root
@app.get("/")
def root():
    return {
        "message" : "Mini Sandbox AI API Running!",
        "version" : "1.0.0",
        "models"  : [
            "flood_risk",
            "water_scarcity",
            "vulnerability",
            "sustainability"
        ]
    }

# Health check
@app.get("/health")
def health():
    return {"status": "healthy"}

# Get all wards list
@app.get("/wards")
def get_wards():
    wards = flood_df[['ward', 'zone']].drop_duplicates()
    return {
        "total_wards" : len(wards),
        "wards"       : wards.to_dict(orient='records')
    }

# Predict all risks for a ward
@app.post("/predict/ward")
def predict_ward(input: WardInput):
    ward_num = input.ward_number

    # Find ward in datasets
    flood_row = flood_df[flood_df['ward'] == ward_num]
    water_row = water_df[water_df['ward'] == ward_num]
    vuln_row  = vuln_df[vuln_df['ward'] == ward_num]
    sust_row  = sust_df[sust_df['ward'] == ward_num]

    if flood_row.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Ward {ward_num} not found"
        )

    # Get zone
    zone = flood_row['zone'].values[0]

    # Predict all 4 risks
    flood_pred = flood_model.predict(get_flood_features(flood_row))
    water_pred = water_model.predict(get_water_features(water_row))
    vuln_pred  = vuln_model.predict(get_vuln_features(vuln_row))
    sust_pred  = sust_model.predict(get_sust_features(sust_row))

    # Get probabilities
    flood_prob = flood_model.predict_proba(get_flood_features(flood_row))[0]
    water_prob = water_model.predict_proba(get_water_features(water_row))[0]
    vuln_prob  = vuln_model.predict_proba(get_vuln_features(vuln_row))[0]
    sust_prob  = sust_model.predict_proba(get_sust_features(sust_row))[0]

    return {
        "ward"   : ward_num,
        "zone"   : zone,
        "risks"  : {
            "flood_risk" : {
                "level"       : decode_label(flood_pred, 'flood_risk'),
                "probability" : {
                    "Low"    : round(float(flood_prob[0]), 3),
                    "Medium" : round(float(flood_prob[1]), 3),
                    "High"   : round(float(flood_prob[2]), 3)
                }
            },
            "water_scarcity" : {
                "level"       : decode_label(water_pred, 'water_scarcity'),
                "probability" : {
                    "Low"    : round(float(water_prob[0]), 3),
                    "Medium" : round(float(water_prob[1]), 3),
                    "High"   : round(float(water_prob[2]), 3)
                }
            },
            "vulnerability" : {
                "level"       : decode_label(vuln_pred, 'vulnerability'),
                "probability" : {
                    "Low"    : round(float(vuln_prob[0]), 3),
                    "Medium" : round(float(vuln_prob[1]), 3),
                    "High"   : round(float(vuln_prob[2]), 3)
                }
            },
            "sustainability" : {
                "level"       : decode_label(sust_pred, 'sustainability'),
                "probability" : {
                    "Low"    : round(float(sust_prob[0]), 3),
                    "Medium" : round(float(sust_prob[1]), 3),
                    "High"   : round(float(sust_prob[2]), 3)
                }
            }
        }
    }

# Predict with intervention
@app.post("/predict/intervention")
def predict_intervention(input: InterventionInput):
    ward_num = input.ward_number

    flood_row = flood_df[flood_df['ward'] == ward_num].copy()
    water_row = water_df[water_df['ward'] == ward_num].copy()
    vuln_row  = vuln_df[vuln_df['ward'] == ward_num].copy()
    sust_row  = sust_df[sust_df['ward'] == ward_num].copy()

    if flood_row.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Ward {ward_num} not found"
        )

    # Get BEFORE predictions
    before_flood = decode_label(
        flood_model.predict(get_flood_features(flood_row)),
        'flood_risk'
    )
    before_vuln = decode_label(
        vuln_model.predict(get_vuln_features(vuln_row)),
        'vulnerability'
    )
    before_sust = decode_label(
        sust_model.predict(get_sust_features(sust_row)),
        'sustainability'
    )

    # Apply interventions
    if input.add_drainage > 0:
        # More drainage -> lower flood risk
        flood_row['norm_drainage'] = min(
            1.0, flood_row['norm_drainage'].values[0] +
            (input.add_drainage * 0.1)
        )
        sust_row['norm_drainage'] = min(
            1.0, sust_row['norm_drainage'].values[0] +
            (input.add_drainage * 0.1)
        )

    if input.plant_trees > 0:
        # More trees -> lower flood risk, higher sustainability
        flood_row['norm_elevation'] = min(
            1.0, flood_row['norm_elevation'].values[0] -
            (input.plant_trees * 0.05)
        )

    if input.improve_hospital > 0:
        # More hospitals -> lower vulnerability
        vuln_row['norm_hospital'] = max(
            0.0, vuln_row['norm_hospital'].values[0] -
            (input.improve_hospital * 0.1)
        )

    # Get AFTER predictions
    after_flood = decode_label(
        flood_model.predict(get_flood_features(flood_row)),
        'flood_risk'
    )
    after_vuln = decode_label(
        vuln_model.predict(get_vuln_features(vuln_row)),
        'vulnerability'
    )
    after_sust = decode_label(
        sust_model.predict(get_sust_features(sust_row)),
        'sustainability'
    )

    return {
        "ward"          : ward_num,
        "interventions" : {
            "add_drainage"     : input.add_drainage,
            "plant_trees"      : input.plant_trees,
            "improve_hospital" : input.improve_hospital
        },
        "before" : {
            "flood_risk"     : before_flood,
            "vulnerability"  : before_vuln,
            "sustainability" : before_sust
        },
        "after"  : {
            "flood_risk"     : after_flood,
            "vulnerability"  : after_vuln,
            "sustainability" : after_sust
        },
        "changed" : {
            "flood_risk"     : before_flood != after_flood,
            "vulnerability"  : before_vuln != after_vuln,
            "sustainability" : before_sust != after_sust
        }
    }

# Get all ward predictions
@app.get("/predict/all")
def predict_all():
    results = []
    for ward_num in flood_df['ward'].unique():
        try:
            flood_row = flood_df[flood_df['ward'] == ward_num]
            water_row = water_df[water_df['ward'] == ward_num]
            vuln_row  = vuln_df[vuln_df['ward'] == ward_num]
            sust_row  = sust_df[sust_df['ward'] == ward_num]

            flood_pred = decode_label(
                flood_model.predict(get_flood_features(flood_row)),
                'flood_risk'
            )
            water_pred = decode_label(
                water_model.predict(get_water_features(water_row)),
                'water_scarcity'
            )
            vuln_pred = decode_label(
                vuln_model.predict(get_vuln_features(vuln_row)),
                'vulnerability'
            )
            sust_pred = decode_label(
                sust_model.predict(get_sust_features(sust_row)),
                'sustainability'
            )

            results.append({
                "ward"           : int(ward_num),
                "zone"           : flood_row['zone'].values[0],
                "flood_risk"     : flood_pred,
                "water_scarcity" : water_pred,
                "vulnerability"  : vuln_pred,
                "sustainability" : sust_pred
            })
        except:
            continue

    return {
        "total_wards" : len(results),
        "wards"       : results
    }

# ============================================
# RUN SERVER
# ============================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)