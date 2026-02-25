import { retrieveRelevantChunks } from './ragService';
import { generateLegalResponse } from './bedrockService';
import { calculateConfidenceScore } from './confidenceService';
import { flagResponseIfNeeded } from './flaggingService';

interface ChatResponse {
    summary: string;
    legal_basis: string;
    steps: string[];
    documents_required: string[];
    confidence_score: number;
}

export const handler = async (event: any) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required and must be a string' })
            };
        }

        // 1. RAG Retrieval
        const contextChunks = await retrieveRelevantChunks(message);

        // 2. Bedrock Generation
        const llmResponse = await generateLegalResponse(message, contextChunks);

        // 3. Confidence Score Calculation
        const confidenceScore = calculateConfidenceScore(llmResponse, contextChunks);

        // 4. Flagging Logic
        // We execute this asynchronously so it doesn't slow down the response, but await it here to ensure it finishes during execution
        await flagResponseIfNeeded(message, llmResponse, confidenceScore);

        // 5. Structure final exact format
        const finalResponse: ChatResponse = {
            summary: llmResponse.summary || '',
            legal_basis: llmResponse.legal_basis || '',
            steps: Array.isArray(llmResponse.steps) ? llmResponse.steps : [],
            documents_required: Array.isArray(llmResponse.documents_required) ? llmResponse.documents_required : [],
            confidence_score: confidenceScore
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(finalResponse)
        };

    } catch (err: any) {
        console.error("[CHAT_ERROR]", err);
        const fallbackResponse: ChatResponse = {
            summary: "We are unable to process your query right now.",
            legal_basis: "Not available",
            steps: [],
            documents_required: [],
            confidence_score: 0.2
        };

        // Try flagging the error response
        await flagResponseIfNeeded(event?.body?.message || 'Unknown Query', fallbackResponse, 0.2).catch(() => { });

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(fallbackResponse)
        };
    }
};
