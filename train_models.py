import sys
sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

BASE   = "D:/SandboxAI/"
MODELS = "D:/SandboxAI/models/"

# Create models folder
os.makedirs(MODELS, exist_ok=True)

# ============================================
# HELPER FUNCTIONS
# ============================================
def train_model(name, df, feature_cols, target_col):
    print(f"\n{'='*50}")
    print(f"Training : {name}")
    print(f"{'='*50}")

    X = df[feature_cols].values
    y = df[target_col].values

    print(f"Features : {feature_cols}")
    print(f"X shape  : {X.shape}")
    print(f"Classes  : {np.unique(y)}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train    : {X_train.shape}")
    print(f"Test     : {X_test.shape}")

    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\nTest Accuracy : {accuracy*100:.2f}%")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred))

    print(f"Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Cross validation
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"\nCross Validation (5-fold):")
    print(f"Scores : {cv_scores.round(3)}")
    print(f"Mean   : {cv_scores.mean()*100:.2f}%")
    print(f"Std    : {cv_scores.std()*100:.2f}%")

    # Feature importance
    if len(feature_cols) > 1:
        importance = pd.DataFrame({
            'Feature'   : feature_cols,
            'Importance': model.feature_importances_
        }).sort_values('Importance', ascending=False)
        print(f"\nFeature Importance:")
        print(importance.to_string(index=False))

    # Save model
    model_path = MODELS + f"{name.lower().replace(' ', '_')}_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"\nSAVED : {model_path}")

    return model, accuracy, cv_scores.mean()

# ============================================
# LOAD ALL DATASETS
# ============================================
print("=== Loading Datasets ===")

flood = pd.read_csv(BASE + "ml_flood_dataset.csv")
water = pd.read_csv(BASE + "ml_water_scarcity_dataset.csv")
vuln  = pd.read_csv(BASE + "ml_vulnerability_dataset.csv")
sust  = pd.read_csv(BASE + "ml_sustainability_dataset.csv")

print(f"Flood Risk      : {flood.shape}")
print(f"Water Scarcity  : {water.shape}")
print(f"Vulnerability   : {vuln.shape}")
print(f"Sustainability  : {sust.shape}")

# ============================================
# TRAIN MODEL 1 - FLOOD RISK
# ============================================
flood_features = [
    'norm_avg_hazard',
    'norm_max_hazard',
    'norm_high_zones',
    'norm_flood2015',
    'norm_inundation',
    'norm_elevation',
    'norm_drainage'
]

model1, acc1, cv1 = train_model(
    "Flood Risk",
    flood,
    flood_features,
    'flood_risk_encoded'
)

# ============================================
# TRAIN MODEL 2 - WATER SCARCITY
# ============================================
water_features = [
    'pop_total',
    'rank_population'
]

model2, acc2, cv2 = train_model(
    "Water Scarcity",
    water,
    water_features,
    'water_scarcity_encoded'
)

# ============================================
# TRAIN MODEL 3 - VULNERABILITY
# ============================================
vuln_features = [
    'norm_flood',
    'norm_water',
    'norm_population',
    'norm_slum',
    'norm_slum_area',
    'norm_hospital'
]

model3, acc3, cv3 = train_model(
    "Vulnerability",
    vuln,
    vuln_features,
    'vulnerability_encoded'
)

# ============================================
# TRAIN MODEL 4 - SUSTAINABILITY
# ============================================
sust_features = [
    'norm_drainage',
    'norm_flood'
]

model4, acc4, cv4 = train_model(
    "Sustainability",
    sust,
    sust_features,
    'sustainability_encoded'
)

# ============================================
# SAVE LABEL MAPPINGS
# ============================================
print("\n=== Saving Label Mappings ===")

label_maps = {
    'flood_risk'      : {0: 'Low', 1: 'Medium', 2: 'High'},
    'water_scarcity'  : {0: 'Low', 1: 'Medium', 2: 'High'},
    'vulnerability'   : {0: 'Low', 1: 'Medium', 2: 'High'},
    'sustainability'  : {0: 'Low', 1: 'Medium', 2: 'High'}
}

with open(MODELS + "label_maps.pkl", 'wb') as f:
    pickle.dump(label_maps, f)
print("SAVED : label_maps.pkl")

# ============================================
# SAVE FEATURE NAMES
# ============================================
feature_names = {
    'flood_risk'     : flood_features,
    'water_scarcity' : water_features,
    'vulnerability'  : vuln_features,
    'sustainability' : sust_features
}

with open(MODELS + "feature_names.pkl", 'wb') as f:
    pickle.dump(feature_names, f)
print("SAVED : feature_names.pkl")

# ============================================
# FINAL SUMMARY
# ============================================
print("\n" + "="*50)
print("=== FINAL MODEL SUMMARY ===")
print("="*50)

summary = pd.DataFrame({
    'Model'         : ['Flood Risk', 'Water Scarcity',
                       'Vulnerability', 'Sustainability'],
    'Features'      : [len(flood_features), len(water_features),
                       len(vuln_features), len(sust_features)],
    'Test Accuracy' : [f"{acc1*100:.1f}%", f"{acc2*100:.1f}%",
                       f"{acc3*100:.1f}%", f"{acc4*100:.1f}%"],
    'CV Mean'       : [f"{cv1*100:.1f}%", f"{cv2*100:.1f}%",
                       f"{cv3*100:.1f}%", f"{cv4*100:.1f}%"],
    'Status'        : ['SAVED', 'SAVED', 'SAVED', 'SAVED']
})

print(summary.to_string(index=False))

print("\nModels saved to D:/SandboxAI/models/")
print("flood_risk_model.pkl")
print("water_scarcity_model.pkl")
print("vulnerability_model.pkl")
print("sustainability_model.pkl")
print("label_maps.pkl")
print("feature_names.pkl")
print("\n=== ML TRAINING COMPLETE ===")