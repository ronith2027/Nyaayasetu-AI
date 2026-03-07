"use client";

import React from 'react';
import AuthGuard from '../../components/AuthGuard';
import ChatPage from '../../features/chat/ChatPage';

export default function MyLawyerPage() {
    return (
        <AuthGuard>
            <ChatPage />
        </AuthGuard>
    );
}
