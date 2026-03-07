"use client";

import React, { useState } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { LocatorForm } from './LocatorForm';
import { LocatorResults } from './LocatorResults';
import { LoadingState } from './LoadingState';
import { fetchAllLegalLocations, LocationResult } from '../../services/mapsService';

export const LocatorPage: React.FC = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<LocationResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (pincode: string, stateStr: string) => {
        setLoading(true);
        setError(null);
        
        // Use state if provided, otherwise show error
        if (!stateStr.trim()) {
            setError('Please select a state to search for locations');
            setResults([]);
            setLoading(false);
            return;
        }

        try {
            const locations = await fetchAllLegalLocations(stateStr);
            
            if (locations.length === 0) {
                setError(`No police stations or courts found in ${stateStr}. Please try a different state.`);
                setResults([]);
            } else {
                setResults(locations);
                setError(null);
            }
        } catch (err: any) {
            console.error('Locator error:', err);
            setError(err.message || 'Failed to fetch locations. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container mt-6">
            <div className="hero-section flex flex-col items-center text-center">
                <div className="hero-badge">{t('locator')}</div>
                <h1 className="hero-title mt-2">{t('legalAidLocatorTitle')}</h1>
                <p className="hero-subtitle mb-0">{t('legalAidLocatorSubtitle')}</p>
            </div>

            <div className="feature-container w-full">
                <div className="feature-wrapper">
                    <LocatorForm onSearch={handleSearch} loading={loading} />

                    {loading && <LoadingState />}

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800 max-w-md mx-auto">
                            {error}
                        </div>
                    )}

                    {results.length > 0 && !loading && (
                        <LocatorResults results={results} />
                    )}
                </div>
            </div>
        </div>
    );
};
