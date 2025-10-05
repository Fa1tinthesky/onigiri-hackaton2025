# main.py
import functions_framework
from flask import request, jsonify
from datetime import datetime, timezone, timedelta
import openmeteo_requests
import requests_cache
import math
from retry_requests import retry

# ---------- CONFIG ----------
CACHE_PATH = "/tmp/openmeteo_cache"
CACHE_EXPIRE_SECONDS = 900  # 15 minutes
MAX_HOURS = 24

AQ_VARS = ["pm10", "pm2_5", "us_aqi_pm2_5", "us_aqi_pm10", "us_aqi_nitrogen_dioxide"]
WEATHER_VARS = ["temperature_2m", "windspeed_10m", "relative_humidity_2m", "precipitation"]

# Setup client
cache_session = requests_cache.CachedSession(CACHE_PATH, expire_after=CACHE_EXPIRE_SECONDS)
retry_session = retry(cache_session, retries=4, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# ---------- Helpers ----------
def sanitize_array(arr):
    """Convert NaN to None for JSON-safe serialization"""
    return [None if (v is None or (isinstance(v, float) and math.isnan(v))) else v for v in arr]

def is_in_na_or_tj(lat, lon):
    # North America
    if 7 <= lat <= 83 and -168 <= lon <= -52:
        return True
    # Tajikistan
    if 36 <= lat <= 41.5 and 67 <= lon <= 75.5:
        return True
    return False


def parse_iso_time(s):
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)
    except Exception:
        raise ValueError("time must be ISO8601 (e.g. 2025-10-01T15:00:00Z)")

def extract_hourly(response, var_list):
    hourly = response.Hourly()
    start = datetime.utcfromtimestamp(hourly.Time()).replace(tzinfo=timezone.utc)
    end = datetime.utcfromtimestamp(hourly.TimeEnd()).replace(tzinfo=timezone.utc)
    step = timedelta(seconds=hourly.Interval())

    times = []
    t = start
    while t < end:
        times.append(t.isoformat() + "Z")
        t += step

    out = {}
    for idx, var in enumerate(var_list):
        try:
            values = hourly.Variables(idx).ValuesAsNumpy().tolist()
            out[var] = sanitize_array(values)  # <-- sanitize here
        except Exception:
            out[var] = None

    return times, out


# ---------- Cloud Function ----------
@functions_framework.http
def get_point_data(request):
    def make_cors_response(payload, status=200):
        response = jsonify(payload)
        response.status_code = status

        # CORS headers
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        response.headers["Access-Control-Max-Age"] = "3600"
        response.headers["Access-Control-Expose-Headers"] = "Content-Type"

        return response

    # Handle CORS preflight
    if request.method == "OPTIONS":
        return make_cors_response({}, 204)

    try:
        payload = request.get_json(force=True)
        print("💬 Received payload:", payload)

        lat = float(payload.get("lat"))
        lon = float(payload.get("lon"))

        # Swap if values look inverted (Cesium sometimes sends lon,lat)
        if abs(lat) > 90 and abs(lon) <= 90:
            lat, lon = lon, lat
            print("🔀 Swapped coordinates to lat, lon:", lat, lon)

        # Optional: keep your NA/TJ check but slightly relaxed
        if not is_in_na_or_tj(lat, lon):
            print(f"🚫 Rejected coordinates outside NA/TJ: lat={lat}, lon={lon}")
            return make_cors_response({
                "error": "Coordinates outside allowed regions (North America or Tajikistan)",
                "coords": {"lat": lat, "lon": lon}
            }, 403)

        time_str = payload.get("time")
        hours = max(1, min(int(payload.get("hours", 1)), MAX_HOURS))

        dt = parse_iso_time(time_str) if time_str else datetime.utcnow().replace(tzinfo=timezone.utc)
        start = dt.strftime("%Y-%m-%dT%H:%M")
        end = (dt + timedelta(hours=hours)).strftime("%Y-%m-%dT%H:%M")

        # Air quality
        aq_resp = openmeteo.weather_api(
            "https://air-quality-api.open-meteo.com/v1/air-quality",
            params={"latitude": lat, "longitude": lon, "hourly": AQ_VARS, "start": start, "end": end, "timezone": "UTC"}
        )[0]

        # Weather
        weather_resp = openmeteo.weather_api(
            "https://api.open-meteo.com/v1/forecast",
            params={"latitude": lat, "longitude": lon, "hourly": WEATHER_VARS, "start": start, "end": end, "timezone": "UTC"}
        )[0]

        times_aq, aq_data = extract_hourly(aq_resp, AQ_VARS)
        times_w, weather_data = extract_hourly(weather_resp, WEATHER_VARS)
        times = times_w or times_aq

        return make_cors_response({
            "status": "ok",
            "lat": lat,
            "lon": lon,
            "requested_start": start + "Z",
            "requested_end": end + "Z",
            "times": times,
            "pollution": aq_data,
            "weather": weather_data
        })

    except ValueError as ve:
        return make_cors_response({"error": str(ve)}, 400)
    except Exception as e:
        return make_cors_response({"error": "internal_error", "details": str(e)}, 500)
