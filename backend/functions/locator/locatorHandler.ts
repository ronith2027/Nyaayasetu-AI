export const locatorHandler = async (body: any) => {
    try {
        const { pincode, state } = body;

        // Static JSON dataset of legal aid centers as per requirements
        const centersData = [
            { id: '1', name: 'Delhi State Legal Services Authority', address: 'Patiala House Courts Complex, New Delhi 110001', phone: '1516', pincode: '110001', state: 'Delhi', distanceStr: '2.4 km away' },
            { id: '2', name: 'Bangalore Mediation Centre', address: 'Nyaya Degula, H. Siddaiah Road, Bengaluru 560027', phone: '080-22114888', pincode: '560027', state: 'Karnataka', distanceStr: '1.2 km away' },
            { id: '3', name: 'Maharashtra State Legal Services Authority', address: 'High Court ADR Centre, Mumbai 400032', phone: '022-22691395', pincode: '400032', state: 'Maharashtra', distanceStr: '3.1 km away' },
            { id: '4', name: 'Rural Legal Care Center - Karnataka', address: 'Near Panchayat Office, Hubli 580020', phone: '0836-2334455', pincode: '580020', state: 'Karnataka', distanceStr: '5.6 km away' },
            { id: '5', name: 'North Delhi Legal Clinic', address: 'Rohini Courts, Delhi 110085', phone: '011-27552211', pincode: '110085', state: 'Delhi', distanceStr: '8.4 km away' }
        ];

        // Filter by matching pincode or state
        const filtered = centersData.filter(center => {
            const matchPin = pincode ? center.pincode === pincode : false;
            const matchState = state ? center.state.toLowerCase() === state.toLowerCase() : false;
            // If pincode is provided, match by pincode, otherwise fallback to state
            return pincode ? matchPin : matchState;
        });

        // Return top 3 results
        const top3 = filtered.slice(0, 3);

        // If no direct matches, just return the first 3 to mock geographical proximity for demo purposes
        const results = top3.length > 0 ? top3 : centersData.slice(0, 3);

        return {
            success: true,
            data: results,
            error: null
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            error: error.message || 'An error occurred during location search'
        };
    }
};
