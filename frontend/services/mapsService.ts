// Google Maps Places API service for fetching legal locations

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key not found in environment variables');
}

interface GoogleMapsPlace {
  place_id: string;
  name: string;
  formatted_address: string;
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

const fetchPlaces = async (query: string): Promise<LocationResult[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GoogleMapsResponse = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
    }

    return data.results.map((place): LocationResult => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      totalRatings: place.user_ratings_total,
      googleMapsUrl: createGoogleMapsUrl(place),
      type: query.toLowerCase().includes('police') ? 'police_station' : 'court'
    }));
  } catch (error) {
    console.error('Error fetching places from Google Maps:', error);
    throw error;
  }
};

export const fetchPoliceStations = async (state: string): Promise<LocationResult[]> => {
  const query = `police station in ${state}, India`;
  return fetchPlaces(query);
};

export const fetchCourts = async (state: string): Promise<LocationResult[]> => {
  const query = `court in ${state}, India`;
  return fetchPlaces(query);
};

export const fetchAllLegalLocations = async (state: string): Promise<LocationResult[]> => {
  try {
    const [policeStations, courts] = await Promise.all([
      fetchPoliceStations(state),
      fetchCourts(state)
    ]);

    // Combine and sort by rating (highest first) or by name if no rating
    const allLocations = [...policeStations, ...courts];
    
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
