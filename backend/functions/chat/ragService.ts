// Simulated RAG Service for Legal Chat
// Retrieves top 5 relevant chunks from basic law sources.

// Mock data to simulate basic legal chunks
const mockLegalChunks = [
    {
        id: "chunk-ipc-506",
        source: "Indian Penal Code",
        content: "Section 506 IPC: Punishment for criminal intimidation. Whoever commits the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both."
    },
    {
        id: "chunk-consumer",
        source: "Consumer Protection Act",
        content: "A consumer can file a complaint in a Consumer Commission if there's a defect in goods or deficiency in services. The complaint can be filed in the District Commission if the value of goods/services is up to ₹50 Lakhs."
    },
    {
        id: "chunk-fir",
        source: "Procedural Law - CrPC",
        content: "First Information Report (FIR) under Section 154 CrPC can be filed by anyone who has information about a cognizable offence. Police are bound to register it. You can also file a Zero FIR at any police station regardless of jurisdiction."
    },
    {
        id: "chunk-women-dv",
        source: "Protection of Women from Domestic Violence Act",
        content: "A woman has the right to reside in a shared household. She can file a case under the Domestic Violence Act, 2005 for protection orders, residence orders, and monetary relief against physical, mental, verbal or economic abuse."
    },
    {
        id: "chunk-rti",
        source: "Right to Information Act",
        content: "Under the RTI Act, 2005, any Indian citizen can request information from a 'public authority'. The application must be responded to within 30 days."
    },
    {
        id: "chunk-cyber",
        source: "Information Technology Act",
        content: "Section 66E of the IT Act prescribes punishment for violation of privacy (publishing images of private areas). Cyber crimes can be reported at cybercrime.gov.in."
    }
];

export const retrieveRelevantChunks = async (query: string) => {
    // Simulate an async semantic search that takes a bit of time
    await new Promise(resolve => setTimeout(resolve, 300));

    // A basic keyword-based fallback to simulate relevance for the mock
    const userQuery = query.toLowerCase();

    let scoredChunks = mockLegalChunks.map(chunk => {
        let score = 0.5; // Base score

        // Simple mock relevance scoring
        if (userQuery.includes('consumer') || userQuery.includes('buy') || userQuery.includes('shop') || userQuery.includes('defective')) {
            if (chunk.id === 'chunk-consumer') score += 0.4;
        }
        if (userQuery.includes('police') || userQuery.includes('fir') || userQuery.includes('report') || userQuery.includes('crime')) {
            if (chunk.id === 'chunk-fir') score += 0.4;
        }
        if (userQuery.includes('threat') || userQuery.includes('intimidation') || userQuery.includes('scare')) {
            if (chunk.id === 'chunk-ipc-506') score += 0.4;
        }
        if (userQuery.includes('woman') || userQuery.includes('wife') || userQuery.includes('abuse') || userQuery.includes('violence')) {
            if (chunk.id === 'chunk-women-dv') score += 0.4;
        }
        if (userQuery.includes('information') || userQuery.includes('rti') || userQuery.includes('government')) {
            if (chunk.id === 'chunk-rti') score += 0.4;
        }

        return { ...chunk, score };
    });

    // Sort by score descending and take top 5
    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, 5);
};
