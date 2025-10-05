# %%
import os
import numpy as np
import pandas as pd

# %%
# Data to DF
Activities = pd.read_csv("../../raw data/cultural-spaces.csv", sep = ";").drop(["YEAR", "ACTIVE_SPACE","NUMBER_OF_SEATS","SQUARE_FEET"], axis=1)
Activities.columns = ["name", "website", "type", "use", "address", "area", "ownership", "Geom", "geo_point_2d"]
Activities

# %%
Activities[['latitude', 'longitude']] = Activities['geo_point_2d'].str.split(',', expand=True)
Activities['latitude'] = pd.to_numeric(Activities['latitude'])
Activities['longitude'] = pd.to_numeric(Activities['longitude'])
Activities

# %%
# Make sure the folder exists
os.makedirs("../../cleaned", exist_ok=True)

# Export the DataFrame to CSV
Activities.to_csv("../../cleaned/VancouverActivities.csv", index=False, encoding='utf-8')
print("exported Vancouver Restaurant data to cleaned/VancouverActivities.csv")


