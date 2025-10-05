import os
import functions_framework
import requests
from flask import jsonify, request, make_response
from datetime import datetime, timedelta

OPENAQ_API = "https://api.openaq.org/v3"
OPENAQ_TOKEN = os.environ.get("OPENAQ_API_TOKEN")
HEADERS = {"X-API-Key": OPENAQ_TOKEN}

def get_nearest_stations(lat, lon, delta_deg=0.5, max_stations=10):
    # define a bounding box around the point
    min_lat = lat - delta_deg
    max_lat = lat + delta_deg
    min_lon = lon - delta_deg
    max_lon = lon + delta_deg

    url = f"{OPENAQ_API}/locations"
    params = {
        "bbox": f"{min_lon},{min_lat},{max_lon},{max_lat}",
        "limit": max_stations,
        "sort": "distance",
    }
    resp = requests.get(url, params=params, headers=HEADERS)
    resp.raise_for_status()
    return resp.json().get("results", [])[:max_stations]



def get_measurements(location_id, target_time=None, window_hours=720, limit=100):
    """
    Fetch measurements for a location, within a +/- window_hours time range (default 30 days).
    """
    url = f"{OPENAQ_API}/measurements"
    params = {"location_id": location_id, "limit": limit, "sort": "desc", "order_by": "datetime"}

    dt_now = datetime.utcnow()
    if target_time:
        dt = datetime.fromisoformat(target_time.replace("Z", "+00:00"))
    else:
        dt = dt_now

    dt_from = (dt - timedelta(hours=window_hours)).isoformat()
    dt_to = (dt + timedelta(hours=window_hours)).isoformat()
    params["date_from"] = dt_from
    params["date_to"] = dt_to

    try:
        resp = requests.get(url, params=params, headers=HEADERS)
        resp.raise_for_status()
        return resp.json().get("results", [])
    except requests.exceptions.RequestException:
        return []

@functions_framework.http
def get_air_quality(request):
    try:
        if request.method == "OPTIONS":
            response = make_response("")
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
            return response

        req_json = request.get_json(silent=True)
        lat = req_json.get("lat")
        lon = req_json.get("lon")
        target_time = req_json.get("time")  # optional ISO string

        if lat is None or lon is None:
            return jsonify({"error": "lat and lon are required"}), 400

        stations = get_nearest_stations(lat, lon)
        if not stations:
            return jsonify({"error": "No nearby station found"}), 404

        nearest_station = None
        best_measurement = None
        best_time_diff = None

        for station in stations:
            measurements = get_measurements(station["id"], target_time=target_time)
            for m in measurements:
                m_time = datetime.fromisoformat(m["datetime"]["utc"].replace("Z", "+00:00"))
                if target_time:
                    target_dt = datetime.fromisoformat(target_time.replace("Z", "+00:00"))
                    time_diff = abs((m_time - target_dt).total_seconds())
                else:
                    time_diff = 0

                if best_time_diff is None or time_diff < best_time_diff:
                    best_time_diff = time_diff
                    best_measurement = m
                    nearest_station = station

        if not best_measurement:
            nearest_station = stations[0]
            measurements_data = []
        else:
            measurements_data = [{
                "parameter": best_measurement["parameter"]["displayName"],
                "value": best_measurement["value"],
                "unit": best_measurement["parameter"]["units"],
                "datetime": best_measurement["datetime"]["utc"]
            }]

        response_data = {
            "station": {
                "id": nearest_station["id"],
                "name": nearest_station["name"],
                "country": nearest_station["country"]["name"],
                "timezone": nearest_station["timezone"],
                "coordinates": nearest_station["coordinates"],
                "distance_m": nearest_station.get("distance", None),
            },
            "measurements": measurements_data
        }

        response = make_response(jsonify(response_data))
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

    except Exception as e:
        response = make_response(jsonify({"error": str(e)}), 500)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response
