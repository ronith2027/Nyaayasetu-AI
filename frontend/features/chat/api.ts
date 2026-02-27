export interface ChatResponse {
  summary: string;
  legal_basis: string;
  steps: string[];
  documents_required: string[];
  confidence_score: number;
}

import { api } from '../../lib/api';

export const sendChatMessage = async (formData: FormData): Promise<ChatResponse> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to send chat message:', error);
    // Return structured error as requested
    return {
      summary: "We are unable to process your query right now.",
      legal_basis: "Not available",
      steps: [],
      documents_required: [],
      confidence_score: 0.2
    };
  }
};
