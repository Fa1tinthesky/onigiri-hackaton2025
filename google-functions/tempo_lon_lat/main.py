import ee
from flask import jsonify, Response, request
import functions_framework
import os
import math

def ee_init():
    """Initialize Earth Engine with credentials from environment variables."""
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

def no2_to_aqi(no2_ppb):
    """Convert NO2 concentration in ppb to US AQI for NO2 (1-hour)."""
    # US EPA 1-hour breakpoints
    breakpoints = [
        (0, 53, 0, 50),
        (54, 100, 51, 100),
        (101, 360, 101, 150),
        (361, 649, 151, 200),
        (650, 1249, 201, 300),
        (1250, 1649, 301, 400),
        (1650, 2049, 401, 500),
    ]
    for Clow, Chigh, Ilow, Ihigh in breakpoints:
        if Clow <= no2_ppb <= Chigh:
            aqi = ((Ihigh - Ilow) / (Chigh - Clow)) * (no2_ppb - Clow) + Ilow
            return round(aqi)
    return None

@functions_framework.http
def tempo_value(request):
    if request.method == "OPTIONS":
        return add_cors_headers(Response("", status=204))

    try:
        data = request.get_json()
        lon = data.get("lon")
        lat = data.get("lat")

        if lon is None or lat is None:
            return add_cors_headers(jsonify({"error": "Missing 'lon' or 'lat'"})), 400

        ee_init()

        # TEMPO NO2 dataset
        collection = ee.ImageCollection("NASA/TEMPO/NO2_L3").sort("system:time_start", False)
        image = collection.first()
        if not image:
            return add_cors_headers(jsonify({"error": "No TEMPO images found"})), 404

        point = ee.Geometry.Point([lon, lat])

        # Try exact point first
        sampled = image.sample(region=point, scale=1000).first()

        # If no data, expand search to 1km buffer
        if not sampled:
            buffer = point.buffer(1000)
            sampled = image.sample(region=buffer, scale=1000).first()

        value = None
        if sampled:
            # TEMPO returns molecules/m²; convert to 10¹⁵ molecules/cm²
            raw_value = sampled.get("vertical_column_troposphere").getInfo()
            if isinstance(raw_value, float) and not math.isnan(raw_value):
                value = raw_value / 1e16  # human-readable unit

        # Optional: convert to AQI (approximate)
        aqi_value = None
        if value is not None:
            # Convert 10^15 molecules/cm² to ppb roughly using column to surface approximation
            # This is a rough estimation; for precise AQI, local meteorology needed
            no2_ppb = value * 20  # rough scaling factor
            aqi_value = no2_to_aqi(no2_ppb)

        return add_cors_headers(jsonify({
            "lon": lon,
            "lat": lat,
            "no2_vertical_column_10e15_mol_cm2": value,
            "no2_aqi_estimate": aqi_value,
            "message": "Value from nearby area" if value is not None else "No data available even nearby"
        }))

    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500
