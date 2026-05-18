import pandas as pd
import numpy as np

BASE = "D:/SandboxAI/"
df = pd.read_csv(BASE + "master_flood_dataset.csv")

# Fix wrong elevation values
df['elevation_mean'] = df['elevation_mean'].apply(
    lambda x: np.nan if x < -10 else x
)
df['elevation_mean'] = df['elevation_mean'].fillna(
    df['elevation_mean'].mean()
)

# Recalculate norm_elevation
df['norm_elevation'] = 1 - (
    (df['elevation_mean'] - df['elevation_mean'].min()) /
    (df['elevation_mean'].max() - df['elevation_mean'].min())
)

# Select ML features
ml_df = df[[
    'ward_index',
    'ward',
    'zone',
    'norm_avg_hazard',
    'norm_max_hazard',
    'norm_high_zones',
    'norm_flood2015',
    'norm_inundation',
    'norm_elevation',
    'norm_drainage',
    'flood_risk_level'
]].copy()

# Encode target
ml_df['flood_risk_encoded'] = ml_df['flood_risk_level'].map({
    'Low'    : 0,
    'Medium' : 1,
    'High'   : 2
})

print(f"Shape   : {ml_df.shape}")
print(f"Missing : {ml_df.isnull().sum().sum()}")
print(f"Distribution:")
print(ml_df['flood_risk_level'].value_counts())

ml_df.to_csv(BASE + 'ml_flood_dataset.csv', index=False)
print("\nSAVED : ml_flood_dataset.csv")