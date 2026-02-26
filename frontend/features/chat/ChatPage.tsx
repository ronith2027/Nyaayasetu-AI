"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { sendChatMessage } from './api';
import './Chat.css';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  details?: {
    summary: string;
    legal_basis: string;
    steps: string[];
    documents_required: string[];
    confidence_score: number;
  };
}

const SUGGESTED_TOPICS = [
  "Consumer Complaint",
  "How to file FIR",
  "Land Dispute",
  "Women's Rights",
  "Govt Schemes"
];

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, streamingText]);

  const clearChat = () => {
    setMessages([]);
    setStreamingText('');
    setSelectedFile(null);
    if (synth) synth.cancel();
  };

  const speakText = (text: string) => {
    if (!synth) return;
    synth.cancel(); // Stop any currently playing audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage; // Set to user's preferred language
    utterance.rate = 1.0;
    synth.speak(utterance);
  };

  const simulateStreaming = (text: string, fullData: any) => {
    let currentText = '';
    const words = text.split(' ');
    let i = 0;

    // Speak the response while streaming
    speakText(text);

    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? '' : ' ') + words[i];
        setStreamingText(currentText);
        i++;
      } else {
        clearInterval(interval);
        setMessages(prev => [...prev, {
          role: 'bot',
          content: text,
          details: fullData
        }]);
        setStreamingText('');
      }
    }, 40);
  };

  const handleSend = async (text: string) => {
    const query = text || input;
    if (!query.trim() && !selectedFile || loading) return;

    let userMessageContent = query;
    if (selectedFile) {
      userMessageContent += `\n[Attached File: ${selectedFile.name}]`;
    }

    const userMessage: ChatMessage = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', query || 'Please analyze this document.');
      formData.append('language', selectedLanguage); // Pass explicitly to backend
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await sendChatMessage(formData);

      // Clear file after sending
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (response && response.summary) {
        simulateStreaming(response.summary, response);
      } else {
        setMessages(prev => [...prev, {
          role: 'bot',
          content: "I'm sorry, I couldn't process that request."
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "An error occurred while connecting to the legal assistant."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const toggleMic = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Speech Recognition. Try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      alert("Microphone access is required for voice input. Please click the lock icon in your URL bar to allow microphone permissions.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      alert(`Speech Recognition Error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-700">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-4">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
          AI-Powered Legal Guidance
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Legal Assistant</h1>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">Instant legal support in plain language. Ask about laws, procedures, or your rights.</p>
      </div>

      <div className="chat-container">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 17v-4"></path><path d="M12 9h.01"></path></svg>
            </div>
            <div>
              <h3 className="font-bold text-sm">NyayaSetu AI</h3>
              <p className="text-[10px] text-green-500 font-medium">Online • Legal Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 text-gray-700"
            >
              <option value="en-IN">English</option>
              <option value="hi-IN">Hindi</option>
              <option value="ta-IN">Tamil</option>
              <option value="te-IN">Telugu</option>
              <option value="kn-IN">Kannada</option>
              <option value="mr-IN">Marathi</option>
              <option value="bn-IN">Bengali</option>
            </select>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center animate-pulse">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
                  <path d="M12 17v-4"></path>
                  <path d="M12 9h.01"></path>
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">How can I help you today?</h3>
                <p className="text-gray-400 max-w-xs mx-auto text-sm">Ask me about your legal rights, procedures, or document requirements.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm pt-4">
                {SUGGESTED_TOPICS.map(topic => (
                  <button key={topic} onClick={() => handleSend(topic)} className="topic-chip text-center">
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 mb-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 17v-4"></path><path d="M12 9h.01"></path></svg>
                </div>
              )}
              <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.details && (
                  <div className="mt-4 space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="legal-detail-card border-blue-500 bg-blue-50/50">
                      <div className="flex items-center gap-2 mb-2 font-bold text-blue-800 uppercase text-[10px] tracking-widest">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        Legal Basis
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">{msg.details.legal_basis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 transition-all hover:shadow-md hover:shadow-emerald-500/10">
                        <div className="flex items-center gap-2 mb-2 font-bold text-emerald-700 text-[10px] uppercase tracking-widest">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                          Steps to Take
                        </div>
                        <ul className="space-y-1.5">
                          {msg.details.steps.map((step, i) => (
                            <li key={i} className="flex gap-2 text-[11px] text-gray-600 leading-normal">
                              <span className="text-emerald-500 font-bold">•</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 transition-all hover:shadow-md hover:shadow-amber-500/10">
                        <div className="flex items-center gap-2 mb-2 font-bold text-amber-700 text-[10px] uppercase tracking-widest">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                          Documents
                        </div>
                        <ul className="space-y-1.5">
                          {msg.details.documents_required.map((doc, i) => (
                            <li key={i} className="flex gap-2 text-[11px] text-gray-600 leading-normal">
                              <span className="text-amber-500 font-bold">•</span>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mb-1">
                  ME
                </div>
              )}
            </div>
          ))}

          {streamingText && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 17v-4"></path><path d="M12 9h.01"></path></svg>
              </div>
              <div className="message-bubble bot-bubble">
                <p className="whitespace-pre-wrap">{streamingText}</p>
                <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse align-middle"></span>
              </div>
            </div>
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="message-bubble bot-bubble flex items-center gap-2 px-6">
                <span className="thinking-dot"></span>
                <span className="thinking-dot"></span>
                <span className="thinking-dot"></span>
              </div>
            </div>
          )}
        </div>

        {/* Action input area */}
        <div className="chat-input-wrapper">
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 transition-colors rounded-xl ${selectedFile ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="Attach PDF Document"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
          </button>

          <input
            type="text"
            className="chat-input flex-1"
            placeholder={selectedFile ? `${selectedFile.name} attached. Ask a question...` : "Describe your legal issue here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend('')}
          />

          <button
            onClick={toggleMic}
            className={`p-3 transition-colors rounded-xl mx-1 ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="Voice Input"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          </button>

          <Button
            className="bg-primary hover:bg-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-lg active:scale-95"
            onClick={() => handleSend('')}
            disabled={loading || !!streamingText || (!input.trim() && !selectedFile)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </Button>
        </div>
        <p className="text-[10px] text-center text-gray-400 pb-2 px-4">
          Disclaimer: NyayaSetu AI provides general legal information and guidance. It is not a substitute for professional legal advice from a qualified advocate.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
