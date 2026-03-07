from typing import Dict, Any, List

class LocatorService:
    def __init__(self):
        # This service is deprecated - frontend now uses Google Maps API directly
        pass

    def locate_centers(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Return empty results as frontend now handles this with Google Maps API
        return {
            "success": True,
            "data": [],
            "error": None
        }

locator_service = LocatorService()
