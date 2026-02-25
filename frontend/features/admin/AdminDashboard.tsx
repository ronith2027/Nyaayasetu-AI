"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { FlaggedList } from './FlaggedList';
import { ReviewModal } from './ReviewModal';
import { api } from '../../lib/api';
import { Loader } from '../../components/Loader';
import '../../app/Dashboard.css';

interface FlaggedItem {
    id: string;
    query: string;
    response: string;
    confidenceScore: number;
    timestamp: string;
    status: 'pending' | 'reviewed';
}

export const AdminDashboard: React.FC = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [items, setItems] = useState<FlaggedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null);

    const fetchFlaggedItems = async () => {
        setLoading(true);
        try {
            // Using post because our minimal API mock only has post defined originally, 
            // but effectively acting as a GET.
            const res = await api.post<FlaggedItem[]>('/admin/flagged', {});
            if (res.success && res.data) {
                setItems(res.data);
            } else {
                setError(res.error || 'Failed to fetch items');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlaggedItems();
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'mark_incorrect' | 'escalate') => {
        setActionLoading(true);
        try {
            const res = await api.post('/admin/review', { id, action });
            if (res.success) {
                // Update local list
                setItems(items.filter(item => item.id !== id));
                setSelectedItem(null);
            } else {
                alert(`Error: ${res.error}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="dashboard-container mt-6">
            <div className="hero-section flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <div className="hero-badge !mb-4">{t('admin')}</div>
                    <h1 className="hero-title !text-3xl md:!text-4xl !mb-2">{t('adminDashboardTitle')}</h1>
                    <p className="hero-subtitle !mb-0">{t('adminDashboardSubtitle')}</p>
                </div>
                <button
                    onClick={fetchFlaggedItems}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
                >
                    <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('refreshBtn')}
                </button>
            </div>

            <div className="feature-container w-full">
                <div className="feature-wrapper !p-4 md:!p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader />
                        </div>
                    ) : (
                        <FlaggedList items={items} onReviewClick={setSelectedItem} />
                    )}
                </div>
            </div>

            {selectedItem && (
                <ReviewModal
                    item={selectedItem}
                    onClose={() => !actionLoading && setSelectedItem(null)}
                    onAction={handleAction}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};
