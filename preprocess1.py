import sys
sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import geopandas as gpd
import numpy as np
import fiona
import os
import warnings
from rasterstats import zonal_stats
warnings.filterwarnings('ignore')

BASE = "D:/SandboxAI/"

FLOOD_HAZARD = BASE + "Chennai Flood Hazard Zones Map.kml"
FLOOD_2015   = BASE + "Chennai Flooding Points in 2015.kml"
INUNDATION   = BASE + "Chennai Inundation Points with Depth of Inundation.kml"
FLOOD_100YR  = BASE + "Chennai Flows 100 Years Return Period.kml"
DRAINAGE     = BASE + "drainage.geojson"
ELEVATION    = BASE + "elevation.tif"
WARDS        = BASE + "chennai_wards.geojson"
DAILY        = BASE + "Chennai Daily Rainfall Data from 1991-2023.csv"

# ============================================
# STEP 1 - Load Ward Boundaries
# ============================================
print("=== STEP 1 : Loading Ward Boundaries ===")

wards = gpd.read_file(WARDS)
wards = wards.to_crs(epsg=4326)
wards['ward_index'] = range(len(wards))
print(f"Wards : {wards.shape}")

# ============================================
# STEP 2 - Load Flood Hazard Zones
# ============================================
print("\n=== STEP 2 : Loading Flood Hazard Zones ===")

fiona.drvsupport.supported_drivers['KML'] = 'rw'

flood_hazard = gpd.read_file(FLOOD_HAZARD, driver='KML')
flood_hazard = flood_hazard.to_crs(epsg=4326)

print(f"Flood hazard shape   : {flood_hazard.shape}")
print(f"Flood hazard columns : {flood_hazard.columns.tolist()}")
print(flood_hazard.head(5))
print(f"\nUnique descriptions  : {flood_hazard['Description'].unique()[:10]}")
print(f"Unique names         : {flood_hazard['Name'].unique()[:10]}")