import ee
from flask import jsonify, Response, request
import functions_framework
import os

KEY_PATH = "key.json"  # path to your service account JSON

def ee_init():
    # Read credentials from environment variables set by .env.yaml
    SERVICE_ACCOUNT = os.environ.get("EE_SERVICE_ACCOUNT")
    PRIVATE_KEY = os.environ.get("EE_PRIVATE_KEY")

    if not SERVICE_ACCOUNT or not PRIVATE_KEY:
        raise ValueError("EE_SERVICE_ACCOUNT or EE_PRIVATE_KEY not set in environment variables")

    credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, key_data=PRIVATE_KEY)
    ee.Initialize(credentials)

def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@functions_framework.http
def tempo_value(request):
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return add_cors_headers(Response("", status=204))

    try:
        # Parse JSON body
        data = request.get_json()
        lon = data.get("lon")
        lat = data.get("lat")

        if lon is None or lat is None:
            return add_cors_headers(jsonify({"error": "Missing 'lon' or 'lat' in request"})), 400

        ee_init()

        # TEMPO NO2 dataset
        collection = ee.ImageCollection("NASA/TEMPO/NO2_L3").sort("system:time_start", False)
        image = collection.first()
        if not image:
            return add_cors_headers(jsonify({"error": "No TEMPO images found"})), 404

        # Create a point geometry
        point = ee.Geometry.Point([lon, lat])

        # Try exact point first
        sampled = image.sample(region=point, scale=1000).first()

        # If no data, sample a small buffer (1 km radius) and take the first available value
        if not sampled:
            buffer = point.buffer(1000)  # 1 km radius
            sampled = image.sample(region=buffer, scale=1000).first()

        if sampled:
            value = sampled.get("vertical_column_troposphere").getInfo()
        else:
            value = None

        return add_cors_headers(jsonify({
            "lon": lon,
            "lat": lat,
            "no2_vertical_column_troposphere": value,
            "message": "Value from nearby area" if value is not None else "No data available even nearby"
        }))
    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500
