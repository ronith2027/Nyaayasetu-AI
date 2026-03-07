import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LocationResult } from '../../services/mapsService';

interface LocatorResultsProps {
    results: LocationResult[];
}

export const LocatorResults: React.FC<LocatorResultsProps> = ({ results }) => {
    const { t } = useLanguage();

    if (!results || results.length === 0) {
        return null; // or empty state
    }

    const openMaps = (googleMapsUrl: string) => {
        window.open(googleMapsUrl, '_blank');
    };

    const getTypeIcon = (type: 'police_station' | 'court') => {
        return type === 'police_station' ? '🚔' : '⚖️';
    };

    const getTypeLabel = (type: 'police_station' | 'court') => {
        return type === 'police_station' ? 'Police Station' : 'Court';
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {t('nearestCentersTitle')} ({results.length} found)
            </h3>
            <div className="grid gap-4">
                {results.map((location) => (
                    <Card 
                        key={location.id} 
                        className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{getTypeIcon(location.type)}</span>
                                <h4 className="font-bold text-lg text-blue-700 dark:text-blue-400">
                                    {location.name}
                                </h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <span className="font-medium">{t('locatorAddressLabel')}:</span> {location.address}
                            </p>
                            
                            <div className="flex items-center gap-4 mb-2">
                                <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                    {getTypeLabel(location.type)}
                                </span>
                                
                                {location.rating && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                        <span className="text-yellow-500">★</span>
                                        {location.rating.toFixed(1)}
                                        {location.totalRatings && (
                                            <span className="text-gray-400">({location.totalRatings})</span>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <Button
                            onClick={() => openMaps(location.googleMapsUrl)}
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors text-sm whitespace-nowrap"
                        >
                            {t('getDirectionsBtn')}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};
