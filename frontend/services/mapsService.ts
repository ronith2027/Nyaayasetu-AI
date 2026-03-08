// Google Maps Places API service for fetching legal locations

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key not found in environment variables');
}

interface GoogleMapsPlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

interface GoogleMapsResponse {
  results: GoogleMapsPlace[];
  status: string;
  error_message?: string;
}

export interface LocationResult {
  id: string;
  name: string;
  address: string;
  rating?: number;
  totalRatings?: number;
  googleMapsUrl: string;
  type: 'police_station' | 'court';
}

const createGoogleMapsUrl = (place: GoogleMapsPlace): string => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
};
const fetchPlacesByText = async (query: string, resultType: 'police_station' | 'court'): Promise<LocationResult[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: GoogleMapsResponse = await response.json();

  if (data.status !== 'OK') {
    throw new Error(
      `Google Maps API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`
    );
  }

  return data.results.map((place): LocationResult => ({
    id: place.place_id,
    name: place.name,
    address: place.formatted_address || place.vicinity || '',
    rating: place.rating,
    totalRatings: place.user_ratings_total,
    googleMapsUrl: createGoogleMapsUrl(place),
    type: resultType
  }));
};

const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  options: { type?: string; keyword?: string },
  resultType: 'police_station' | 'court'
): Promise<LocationResult[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    key: GOOGLE_MAPS_API_KEY,
    rankby: 'distance'
  });

  if (options.type) {
    params.append('type', options.type);
  }
  if (options.keyword) {
    params.append('keyword', options.keyword);
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: GoogleMapsResponse = await response.json();

  if (data.status !== 'OK') {
    throw new Error(
      `Google Maps Nearby API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`
    );
  }

  return data.results.map((place): LocationResult => ({
    id: place.place_id,
    name: place.name,
    address: place.vicinity || place.formatted_address || '',
    rating: place.rating,
    totalRatings: place.user_ratings_total,
    googleMapsUrl: createGoogleMapsUrl(place),
    type: resultType
  }));
};

const geocodePincode = async (pincode: string, state: string): Promise<{ lat: number; lng: number } | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  const query = `${pincode}, ${state}, India`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    query
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    console.warn('Geocoding failed for pincode, falling back to state-level search:', data.status);
    return null;
  }

  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
};

export const fetchPoliceStations = async (state: string): Promise<LocationResult[]> => {
  const query = `police station in ${state}, India`;
  return fetchPlacesByText(query, 'police_station');
};

export const fetchCourts = async (state: string): Promise<LocationResult[]> => {
  const query = `court in ${state}, India`;
  return fetchPlacesByText(query, 'court');
};

export const fetchAllLegalLocations = async (pincode: string, state: string): Promise<LocationResult[]> => {
  try {
    let latLng: { lat: number; lng: number } | null = null;

    if (pincode && pincode.trim().length >= 4) {
      try {
        latLng = await geocodePincode(pincode.trim(), state);
      } catch (geoError) {
        console.warn('Error geocoding pincode, falling back to state search:', geoError);
      }
    }

    let policeStations: LocationResult[] = [];
    let courts: LocationResult[] = [];

    if (latLng) {
      // Nearest by pincode (geocoded lat/lng)
      [policeStations, courts] = await Promise.all([
        fetchNearbyPlaces(latLng.lat, latLng.lng, { type: 'police', keyword: 'police station' }, 'police_station'),
        fetchNearbyPlaces(latLng.lat, latLng.lng, { type: 'courthouse', keyword: 'court' }, 'court')
      ]);
    } else {
      // Fallback: state-level text search
      [policeStations, courts] = await Promise.all([fetchPoliceStations(state), fetchCourts(state)]);
    }

    const allLocations = [...policeStations, ...courts];

    // Sort by rating (highest first) or by name if no rating
    return allLocations.sort((a, b) => {
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      if (a.rating) return -1;
      if (b.rating) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error fetching legal locations:', error);
    throw error;
  }
};
