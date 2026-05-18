import sys
sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Point
import warnings
warnings.filterwarnings('ignore')

BASE = "D:/SandboxAI/"

WARDS    = BASE + "chennai_wards.geojson"
DRAINAGE = BASE + "drainage.geojson"
AQ2023   = BASE + "Chennai Air Quality 2023.csv"
AQ2024   = BASE + "Chennai Air Quality 2024.csv"
FLOOD    = BASE + "master_flood_dataset.csv"

# ============================================
# STEP 1 - Load Ward Boundaries
# ============================================
print("=== STEP 1 : Loading Ward Boundaries ===")
wards = gpd.read_file(WARDS)
wards = wards.to_crs(epsg=4326)
wards['ward_index'] = range(len(wards))
print(f"Wards : {wards.shape}")

# ============================================
# STEP 2 - Load Air Quality Data
# ============================================
print("\n=== STEP 2 : Loading Air Quality Data ===")
aq2023 = pd.read_csv(AQ2023)
aq2024 = pd.read_csv(AQ2024)

# Combine both years
aq_all = pd.concat([aq2023, aq2024], ignore_index=True)

# Convert all numeric columns
for col in ['AQI Value', 'SO2', 'NO2', 'CO', 'PM2.5', 'PM10']:
    aq_all[col] = pd.to_numeric(aq_all[col], errors='coerce')

print(f"Combined AQ shape : {aq_all.shape}")
print(f"Stations          : {aq_all['Station'].unique()}")

# Average AQI per station
aq_avg = aq_all.groupby('Station').agg({
    'AQI Value' : 'mean',
    'PM2.5'     : 'mean',
    'PM10'      : 'mean'
}).reset_index()

aq_avg.columns = ['Station', 'avg_aqi', 'avg_pm25', 'avg_pm10']
aq_avg = aq_avg.dropna(subset=['avg_aqi'])

print(f"\nAir quality stations : {aq_avg.shape}")
print(aq_avg)

city_avg_aqi  = aq_avg['avg_aqi'].mean()
city_avg_pm25 = aq_avg['avg_pm25'].mean()
city_avg_pm10 = aq_avg['avg_pm10'].mean()

print(f"\nCity avg AQI  : {city_avg_aqi:.2f}")
print(f"City avg PM25 : {city_avg_pm25:.2f}")
print(f"City avg PM10 : {city_avg_pm10:.2f}")

# ============================================
# STEP 3 - Map AQI Stations to GPS
# ============================================
print("\n=== STEP 3 : Mapping AQI Stations to GPS ===")

station_coords = {
    'Kodungaiyur' : (13.1300, 80.2600),
    'Koyambedu'   : (13.0694, 80.1948),
    'Perungudi'   : (12.9350, 80.2450),
    'Royapuram'   : (13.1200, 80.2950),
    'Manali'      : (13.1650, 80.2650),
}

station_df = pd.DataFrame([
    {'Station': name, 'lat': lat, 'lon': lon}
    for name, (lat, lon) in station_coords.items()
])

station_gdf = gpd.GeoDataFrame(
    station_df,
    geometry=[Point(lon, lat) for lat, lon in
              zip(station_df['lat'], station_df['lon'])],
    crs='EPSG:4326'
)

# Merge AQI values
station_gdf = station_gdf.merge(aq_avg, on='Station', how='left')
print(f"Stations with coords : {station_gdf.shape}")
print(station_gdf[['Station', 'avg_aqi', 'avg_pm25', 'avg_pm10']])

# ============================================
# STEP 4 - Join AQI to Wards
# ============================================
print("\n=== STEP 4 : Joining AQI to Wards ===")
aqi_join = gpd.sjoin(
    station_gdf, wards, how='left', predicate='within'
)
aqi_per_ward = aqi_join.groupby('ward_index').agg({
    'avg_aqi'  : 'mean',
    'avg_pm25' : 'mean',
    'avg_pm10' : 'mean'
}).reset_index()

print(f"Wards with AQI : {aqi_per_ward.shape}")

# ============================================
# STEP 5 - Load Drainage Per Ward
# ============================================
print("\n=== STEP 5 : Loading Drainage ===")
drainage = gpd.read_file(DRAINAGE)
drainage = drainage.to_crs(epsg=4326)

drain_join = gpd.sjoin(
    drainage, wards, how='left', predicate='within'
)
drain_per_ward = drain_join.groupby('ward_index').size().reset_index()
drain_per_ward.columns = ['ward_index', 'drainage_count']
print(f"Drainage per ward : {drain_per_ward.shape}")

# ============================================
# STEP 6 - Load Flood Risk
# ============================================
print("\n=== STEP 6 : Loading Flood Risk ===")
flood = pd.read_csv(FLOOD)
flood_sel = flood[['ward_index', 'flood_risk_score']]
print(f"Flood shape : {flood_sel.shape}")

# ============================================
# STEP 7 - Build Master Dataset
# ============================================
print("\n=== STEP 7 : Building Master Dataset ===")
master = wards[['ward_index', 'ward', 'zone', 'geometry']].copy()

master = master.merge(aqi_per_ward,   on='ward_index', how='left')
master = master.merge(drain_per_ward, on='ward_index', how='left')
master = master.merge(flood_sel,      on='ward_index', how='left')

# Fill missing with city averages
master['avg_aqi']          = master['avg_aqi'].fillna(city_avg_aqi)
master['avg_pm25']         = master['avg_pm25'].fillna(city_avg_pm25)
master['avg_pm10']         = master['avg_pm10'].fillna(city_avg_pm10)
master['drainage_count']   = master['drainage_count'].fillna(0)
master['flood_risk_score'] = master['flood_risk_score'].fillna(0)

print(f"Master shape   : {master.shape}")
print(f"Master columns : {master.columns.tolist()}")

# ============================================
# STEP 8 - Calculate Sustainability Score
# ============================================
print("\n=== STEP 8 : Calculating Sustainability Score ===")

def normalize(series):
    if series.max() == series.min():
        return pd.Series([0.5] * len(series), index=series.index)
    return (series - series.min()) / (series.max() - series.min())

# Lower AQI = better = more sustainable (inverted)
master['norm_aqi']      = 1 - normalize(master['avg_aqi'])
master['norm_pm25']     = 1 - normalize(master['avg_pm25'])
master['norm_pm10']     = 1 - normalize(master['avg_pm10'])

# More drainage = more sustainable
master['norm_drainage'] = normalize(master['drainage_count'])

# Lower flood risk = more sustainable (inverted)
master['norm_flood']    = 1 - normalize(master['flood_risk_score'])

# Weighted sustainability score
master['sustainability_score'] = (
    master['norm_aqi']      * 0.35 +
    master['norm_pm25']     * 0.15 +
    master['norm_pm10']     * 0.10 +
    master['norm_drainage'] * 0.20 +
    master['norm_flood']    * 0.20
)

# Percentile thresholds
p65 = master['sustainability_score'].quantile(0.65)
p30 = master['sustainability_score'].quantile(0.30)

def sust_label(score):
    if score >= p65:   return 'High'
    elif score >= p30: return 'Medium'
    else:              return 'Low'

master['sustainability_level'] = master[
    'sustainability_score'].apply(sust_label)

print(f"\nScore range : {master['sustainability_score'].min():.3f} "
      f"to {master['sustainability_score'].max():.3f}")
print(f"\nSustainability Distribution:")
print(master['sustainability_level'].value_counts())
print(f"\nTop 10 Most Sustainable Wards:")
print(master[['ward', 'zone', 'avg_aqi',
              'drainage_count', 'sustainability_score',
              'sustainability_level']]
      .sort_values('sustainability_score', ascending=False).head(10))
print(f"\nBottom 10 Least Sustainable Wards:")
print(master[['ward', 'zone', 'avg_aqi',
              'drainage_count', 'sustainability_score',
              'sustainability_level']]
      .sort_values('sustainability_score', ascending=True).head(10))

# ============================================
# STEP 9 - Save Files
# ============================================
print("\n=== STEP 9 : Saving Files ===")
master_csv = master.drop(columns=['geometry'])
master_csv.to_csv(BASE + 'master_sustainability_dataset.csv', index=False)
master.to_file(BASE + 'master_sustainability_dataset.geojson',
               driver='GeoJSON')

print("SAVED : master_sustainability_dataset.csv")
print("SAVED : master_sustainability_dataset.geojson")
print("\n=== SUSTAINABILITY PREPROCESSING COMPLETE ===")
print(f"Total wards    : {master.shape[0]}")
print(f"Total features : {master_csv.shape[1]}")
print(f"\nFinal Distribution:")
print(master['sustainability_level'].value_counts())