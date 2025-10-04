import ee
from flask import jsonify, Response
import functions_framework
import os

def ee_init():
    SERVICE_ACCOUNT = os.environ.get("EE_SERVICE_ACCOUNT")
    PRIVATE_KEY = os.environ.get("EE_PRIVATE_KEY")
    credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, key_data=PRIVATE_KEY)
    ee.Initialize(credentials)

def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@functions_framework.http
def s5p_no2_tiles(request):
    if request.method == "OPTIONS":
        return add_cors_headers(Response("", status=204))

    try:
        ee_init()

        # Load NO2 data
        collection = (
            ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_NO2")
            .select("NO2_column_number_density")
            .filterDate("2019-06-01", "2019-06-06")
        )
        image = collection.mean()

        # Load Tajikistan
        countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
        tajikistan = countries.filter(ee.Filter.eq("country_na", "Tajikistan"))

        # Mask: only keep pixels inside Tajikistan
        mask = ee.Image(0).byte().paint(tajikistan, 1)
        masked_image = image.updateMask(mask)

        visParams = {
            "min": 0,
            "max": 0.0002,
            "palette": ["black", "blue", "purple", "cyan", "green", "yellow", "red"]
        }

        map_info = masked_image.getMapId(visParams)

        return add_cors_headers(jsonify({
            "mapid": map_info["mapid"],
            "token": map_info["token"],
            "urlTemplate": map_info["tile_fetcher"].url_format
        }))

    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500
