import ee
from flask import jsonify, Response, request
import functions_framework
import os

KEY_PATH = "key.json"

def ee_init():
    SERVICE_ACCOUNT = os.environ.get("EE_SERVICE_ACCOUNT")
    PRIVATE_KEY = os.environ.get("EE_PRIVATE_KEY")

    if not SERVICE_ACCOUNT or not PRIVATE_KEY:
        raise ValueError("EE_SERVICE_ACCOUNT or EE_PRIVATE_KEY not set in environment variables")

    # Initialize Earth Engine with credentials from environment
    credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, key_data=PRIVATE_KEY)
    ee.Initialize(credentials)

def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@functions_framework.http
def tempo_tiles(request):
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return add_cors_headers(Response("", status=204))

    try:
        ee_init()

        collection = ee.ImageCollection("NASA/TEMPO/NO2_L3").sort("system:time_start", False)
        image = collection.first()
        if not image:
            return add_cors_headers(jsonify({"error": "No TEMPO images found"})), 404

        visParams = {
            "min": 0,
            "max": 1.5e16,
            "bands": ["vertical_column_troposphere"],
            "palette": [
                "ff0000",  # red
                "ff4000",  # reddish-orange
                "ff8000",  # orange
                "ffff00",  # yellow
                "80ff00",  # yellow-green
                "00ff00"   # green
            ]
        }


        map_info = image.getMapId(visParams)

        return add_cors_headers(jsonify({
            "mapid": map_info['mapid'],
            "token": map_info['token'],
            "urlTemplate": map_info['tile_fetcher'].url_format
        }))

    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500
