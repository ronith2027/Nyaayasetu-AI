export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    content?: string; // For user messages or raw text
    botResponse?: BotResponse; // The structured response from backend
    timestamp: string;
}

export interface BotResponse {
    summary: string;
    legal_basis: string;
    steps: string[];
    documents_required: string[];
    government_authority: string;
    confidence_score: number;
}
