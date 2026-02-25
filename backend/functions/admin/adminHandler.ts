export const adminFlaggedHandler = async () => {
    try {
        // Mock data representing flagged_responses from DynamoDB
        const mockFlagged = [
            {
                id: 'R-' + Math.floor(Math.random() * 10000).toString(),
                query: 'My landlord is evicting me without notice. What can I do?',
                response: 'You should immediately seek an injunction from the local civil court. Wait for the eviction date before proceeding.',
                confidenceScore: 0.45,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                status: 'pending'
            },
            {
                id: 'R-' + Math.floor(Math.random() * 10000).toString(),
                query: 'How to apply for widow pension in Karnataka?',
                response: 'To apply for the destitute widow pension in Karnataka, the applicant must provide a death certificate of the husband and an income certificate showing income below ₹12,000 per annum.',
                confidenceScore: 0.58,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                status: 'pending'
            },
            {
                id: 'R-' + Math.floor(Math.random() * 10000).toString(),
                query: 'My employer did not pay me my minimum wages for 3 months',
                response: 'Report this to the local police station immediately and they will arrest the employer.',
                confidenceScore: 0.22,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
                status: 'pending'
            }
        ];

        return {
            success: true,
            data: mockFlagged,
            error: null
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            error: error.message || 'Error fetching flagged responses'
        };
    }
};

export const adminReviewHandler = async (body: any) => {
    try {
        const { id, action } = body;

        // Mock updating the status in DynamoDB
        console.log(`Admin took action: ${action} on item ${id}`);

        return {
            success: true,
            data: { id, status: action },
            error: null
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            error: error.message || 'Error updating review'
        };
    }
};
