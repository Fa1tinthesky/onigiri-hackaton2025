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
def tempo_tiles(request):
    if request.method == "OPTIONS":
        return add_cors_headers(Response("", status=204))

    try:
        ee_init()

        # 🔹 Load TEMPO NO2
        collection = ee.ImageCollection("NASA/TEMPO/NO2_L3").sort("system:time_start", False)
        image = collection.first()
        if not image:
            return add_cors_headers(jsonify({"error": "No TEMPO images found"})), 404

        # 🔹 Load country shapes and filter for North America
        countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
        north_america = countries.filter(
            ee.Filter.inList("country_na", [
                "United States", "Canada", "Mexico",
                "Greenland", "Bermuda", "Bahamas"
            ])
        )

        # 🔹 Create mask of North America and apply
        mask = ee.Image(0).byte().paint(north_america, 1)
        masked_image = image.select("vertical_column_troposphere").updateMask(mask)

        # 🔹 Visualization
        visParams = {
            "min": 0,
            "max": 1.5e16,
            "palette": ["black", "blue", "purple", "cyan", "green", "yellow", "red"]
        }

        # 🔹 Generate MapID
        map_info = masked_image.getMapId(visParams)

        return add_cors_headers(jsonify({
            "mapid": map_info["mapid"],
            "token": map_info["token"],
            "urlTemplate": map_info["tile_fetcher"].url_format
        }))

    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500
