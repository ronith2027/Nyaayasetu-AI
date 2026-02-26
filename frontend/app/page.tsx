"use client";

import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import ComplaintFeature from '../features/complaint';
import SchemeFeature from '../features/scheme';
import ChatFeature from '../features/chat';
import './Dashboard.css';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'complaint' | 'scheme' | 'chat'>('complaint');
    const { t } = useLanguage();

    return (
        <div className="dashboard-container">
            {/* Dynamic Hero Section */}
            <div className="hero-section flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="hero-content-left lg:w-3/5">
                    <div className="hero-badge">
                        {t('citizenDashboardBadge')}
                    </div>
                    <h1 className="hero-title">
                        {t('heroTitle')}
                    </h1>
                    <p className="hero-subtitle">
                        {t('heroSubtitle')}
                    </p>
                </div>
                
                <div className="hero-image-right hidden lg:flex lg:w-2/5 justify-end items-center">
                    <div className="image-grid relative w-full max-w-[400px] h-[450px]">
                        <div className="img-container main-img">
                            <img 
                                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop" 
                                alt="Legal" 
                                className="hero-img"
                            />
                        </div>
                        <div className="img-container second-img">
                            <img 
                                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop" 
                                alt="AI Technology" 
                                className="hero-img"
                            />
                        </div>
                        {/* Decorative background element */}
                        <div className="hero-blob"></div>
                    </div>
                </div>
            </div>

            {/* Interactive Tab Navigation */}
            <div className="tab-navigation-container">
                <div className="tab-navigation">
                    <button
                        onClick={() => setActiveTab('complaint')}
                        className={`tab-button ${activeTab === 'complaint' ? 'active-complaint' : 'inactive'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('fileComplaint')}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('scheme')}
                        className={`tab-button ${activeTab === 'scheme' ? 'active-scheme' : 'inactive'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {t('findSchemes')}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`tab-button ${activeTab === 'chat' ? 'active-complaint' : 'inactive'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {t('legalAIAssistant')}
                        </div>
                    </button>
                </div>
            </div>

            {/* Render Active Feature */}
            <div className="feature-container">
                {activeTab === 'complaint' && (
                    <div className="feature-wrapper">
                        <ComplaintFeature />
                    </div>
                )}

                {activeTab === 'scheme' && (
                    <div className="feature-wrapper">
                        <SchemeFeature />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="feature-wrapper">
                        <ChatFeature />
                    </div>
                )}
            </div>
        </div>
    );
}
