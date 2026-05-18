import pandas as pd
import numpy as np

BASE = "D:/SandboxAI/"
df = pd.read_csv(BASE + "master_water_scarcity_dataset.csv")

# Keep only useful features
# Drop constant columns
ml_features = [
    'ward_index',
    'ward',
    'zone',
    'pop_total',
    'rank_population',
    'water_scarcity_level'
]

ml_df = df[ml_features].copy()

# Encode target
ml_df['water_scarcity_encoded'] = ml_df['water_scarcity_level'].map({
    'Low'    : 0,
    'Medium' : 1,
    'High'   : 2
})

print(f"ML Dataset shape : {ml_df.shape}")
print(f"Columns          : {ml_df.columns.tolist()}")
print(f"\nTarget distribution:")
print(ml_df['water_scarcity_level'].value_counts())
print(f"\nMissing values:")
print(ml_df.isnull().sum())

# Save
ml_df.to_csv(BASE + 'ml_water_scarcity_dataset.csv', index=False)
print("\nSAVED : ml_water_scarcity_dataset.csv")
print("WATER SCARCITY DATASET READY FOR ML!")