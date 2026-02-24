import React, { useState } from 'react';
import { useChat } from './useChat';
import './Chat.css';

export const ChatInterface: React.FC = () => {
    const { messages, isLoading, error, sendMessage } = useChat();
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>NyayaSetu Legal Assistant</h2>
                <p>Your AI Guide to Indian Legal Rights</p>
            </div>

            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-message ${msg.sender}`}>
                        {msg.sender === 'user' ? (
                            <div className="message-content user-message">{msg.content}</div>
                        ) : (
                            <div className="message-content bot-message">
                                {msg.botResponse?.summary && (
                                    <div className="bot-section summary-section">
                                        <p>{msg.botResponse.summary}</p>
                                    </div>
                                )}

                                {msg.botResponse?.legal_basis && (
                                    <div className="bot-section">
                                        <strong>Legal Basis:</strong>
                                        <p>{msg.botResponse.legal_basis}</p>
                                    </div>
                                )}

                                {msg.botResponse?.steps && msg.botResponse.steps.length > 0 && (
                                    <div className="bot-section">
                                        <strong>Steps to Take:</strong>
                                        <ol>
                                            {msg.botResponse.steps.map((step, idx) => (
                                                <li key={idx}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {msg.botResponse?.documents_required && msg.botResponse.documents_required.length > 0 && (
                                    <div className="bot-section">
                                        <strong>Documents Required:</strong>
                                        <ul>
                                            {msg.botResponse.documents_required.map((doc, idx) => (
                                                <li key={idx}>{doc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {msg.botResponse?.government_authority && (
                                    <div className="bot-section authority-section">
                                        <strong>Contact Authority:</strong>
                                        <span>{msg.botResponse.government_authority}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="chat-message bot">
                        <div className="message-content loader">NyayaSetu is typing...</div>
                    </div>
                )}

                {error && (
                    <div className="chat-error">
                        <p>Error: {error}</p>
                    </div>
                )}
            </div>

            <div className="chat-input-area">
                <input
                    type="text"
                    placeholder="Ask a legal question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
};
