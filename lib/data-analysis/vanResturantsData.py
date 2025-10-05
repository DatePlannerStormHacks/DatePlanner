# %%
import os
import numpy as np
import pandas as pd

# %%
# clean City of vancouver data to merge into doordash data
cityOfVancouver = pd.read_csv("../../raw data/business-licences.csv", sep=';')
cofV = pd.DataFrame(cityOfVancouver)
cofV = cofV[["BusinessName","BusinessTradeName", "PostalCode" , "Geom","geo_point_2d"]].rename(columns={
    'BusinessName': 'parent_company',
    'BusinessTradeName': 'name',
    'PostalCode': 'postal_code',
    'Geom': 'Geom',
    'geo_point_2d': 'geo_point_2d'
})
cofV


# %%
# Merge with yelp data for vancouver
yelpVan = pd.read_csv("../../raw data/vancouver_yelp_food.csv")
yelpVan = yelpVan[yelpVan["state"] == "BC"]
yelpVan = yelpVan.drop(["city","state","business_id","is_open", "BYOBCorkage", "Open24Hours"],axis=1)
yelpVan

# %%
# Join the dataset
mergedVanEats = pd.merge(cofV, yelpVan, on='name', how='inner')
mergedVanEats = mergedVanEats[mergedVanEats["postal_code_x"] == mergedVanEats["postal_code_y"]]
mergedVanEats = mergedVanEats[["parent_company","name","postal_code_x","address","latitude","longitude","stars_fair","stars","review_count","categories","RestaurantsReservations","RestaurantsPriceRange2","NoiseLevel","OutdoorSeating","ByAppointmentOnly","DietaryRestrictions","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]]
mergedVanEats.columns = ["parent_company","name","postal_code","address","latitude","longitude","stars_fair","stars","review_count","categories","RestaurantsReservations","RestaurantsPriceRange2","NoiseLevel","OutdoorSeating","ByAppointmentOnly","DietaryRestrictions","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
mergedVanEats

# %%
# Make sure the folder exists
os.makedirs("../../cleaned/", exist_ok=True)

# Export the DataFrame to CSV
mergedVanEats.to_csv("../../cleaned/VancouverRestaurants.csv", index=False, encoding='utf-8')
print("exported Vancouver Restaurant data to cleaned/VancouverRestaurants.csv")


