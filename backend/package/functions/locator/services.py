from typing import Dict, Any, List

class LocatorService:
    def __init__(self):
        # Static JSON dataset of legal aid centers as per requirements
        self.centers_data = [
            { 'id': '1', 'name': 'Delhi State Legal Services Authority', 'address': 'Patiala House Courts Complex, New Delhi 110001', 'phone': '1516', 'pincode': '110001', 'state': 'Delhi', 'distanceStr': '2.4 km away' },
            { 'id': '2', 'name': 'Bangalore Mediation Centre', 'address': 'Nyaya Degula, H. Siddaiah Road, Bengaluru 560027', 'phone': '080-22114888', 'pincode': '560027', 'state': 'Karnataka', 'distanceStr': '1.2 km away' },
            { 'id': '3', 'name': 'Maharashtra State Legal Services Authority', 'address': 'High Court ADR Centre, Mumbai 400032', 'phone': '022-22691395', 'pincode': '400032', 'state': 'Maharashtra', 'distanceStr': '3.1 km away' },
            { 'id': '4', 'name': 'Rural Legal Care Center - Karnataka', 'address': 'Near Panchayat Office, Hubli 580020', 'phone': '0836-2334455', 'pincode': '580020', 'state': 'Karnataka', 'distanceStr': '5.6 km away' },
            { 'id': '5', 'name': 'North Delhi Legal Clinic', 'address': 'Rohini Courts, Delhi 110085', 'phone': '011-27552211', 'pincode': '110085', 'state': 'Delhi', 'distanceStr': '8.4 km away' }
        ]

    def locate_centers(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pincode = data.get("pincode")
        state = data.get("state")

        # Filter by matching pincode or state
        filtered = []
        for center in self.centers_data:
            match_pin = (center['pincode'] == pincode) if pincode else False
            match_state = (center['state'].lower() == state.lower()) if state else False
            
            if pincode:
                if match_pin:
                    filtered.append(center)
            elif match_state:
                filtered.append(center)

        # Return top 3 results
        top3 = filtered[:3]

        # If no direct matches, just return the first 3 to mock geographical proximity for demo purposes
        results = top3 if len(top3) > 0 else self.centers_data[:3]

        return {
            "success": True,
            "data": results,
            "error": None
        }

locator_service = LocatorService()
