import { useState } from 'react';
import { ChatMessage, BotResponse } from './types';

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async (userQuery: string, legalChunks: string[] = []) => {
        if (!userQuery.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            content: userQuery,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_query: userQuery,
                    retrieved_legal_chunks: legalChunks,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data: BotResponse = await response.json();

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                botResponse: data,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return { messages, isLoading, error, sendMessage };
};
