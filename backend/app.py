from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({"message": "Hello from Flask backend"})

# TODO: add your endpoints below

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import math

app = Flask(__name__)
CORS(app)


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@app.route('/')
def index():
    return jsonify({"message": "Hello from Flask backend"})


@app.route('/locate', methods=['POST'])
def locate():
    data = request.get_json() or {}
    pincode = data.get('pincode')
    state = data.get('state') or ''

    if not pincode:
        return jsonify({'success': False, 'data': None, 'error': 'pincode is required'}), 400

    api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
    if not api_key:
        return jsonify({'success': False, 'data': None, 'error': 'Missing Google Maps API key (set GOOGLE_MAPS_API_KEY)'}), 500

    address = f"{pincode}, {state}" if state else str(pincode)

    # Geocode the pincode to get lat/lng
    geocode_url = 'https://maps.googleapis.com/maps/api/geocode/json'
    try:
        gresp = requests.get(geocode_url, params={'address': address, 'key': api_key}, timeout=10)
        gresp.raise_for_status()
        gdata = gresp.json()
    except Exception as e:
        return jsonify({'success': False, 'data': None, 'error': f'Geocode request failed: {str(e)}'}), 502

    if not gdata.get('results'):
        return jsonify({'success': False, 'data': None, 'error': 'No geocode results for provided pincode'}), 404

    loc = gdata['results'][0]['geometry']['location']
    lat = loc['lat']
    lng = loc['lng']

    # Nearby search for legal aid centers
    places_url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    try:
        presp = requests.get(places_url, params={
            'location': f"{lat},{lng}",
            'radius': 20000,  # 20 km radius
            'keyword': 'legal aid',
            'key': api_key
        }, timeout=10)
        presp.raise_for_status()
        pdata = presp.json()
    except Exception as e:
        return jsonify({'success': False, 'data': None, 'error': f'Places request failed: {str(e)}'}), 502

    results = []
    items = pdata.get('results', [])[:8]

    details_url = 'https://maps.googleapis.com/maps/api/place/details/json'
    for item in items:
        place_id = item.get('place_id')
        name = item.get('name')
        addr = item.get('vicinity') or item.get('formatted_address') or ''
        plat = item['geometry']['location']['lat']
        plng = item['geometry']['location']['lng']
        dist_km = haversine_km(lat, lng, plat, plng)

        phone = ''
        # fetch phone number via Place Details
        try:
            dresp = requests.get(details_url, params={'place_id': place_id, 'fields': 'formatted_phone_number', 'key': api_key}, timeout=8)
            dresp.raise_for_status()
            ddata = dresp.json()
            phone = ddata.get('result', {}).get('formatted_phone_number', '')
        except Exception:
            phone = ''

        results.append({
            'id': place_id,
            'name': name,
            'address': addr,
            'phone': phone,
            'distance': dist_km,
            'distanceStr': f"{dist_km:.1f} km",
        })

    # sort by distance
    results.sort(key=lambda r: r['distance'])

    return jsonify({'success': True, 'data': results, 'error': None})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
