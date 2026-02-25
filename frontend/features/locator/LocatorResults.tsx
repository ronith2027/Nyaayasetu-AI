import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

interface Center {
    id: string;
    name: string;
    address: string;
    phone: string;
    distanceStr: string;
}

interface LocatorResultsProps {
    results: Center[];
}

export const LocatorResults: React.FC<LocatorResultsProps> = ({ results }) => {
    const { t } = useLanguage();

    if (!results || results.length === 0) {
        return null; // or empty state
    }

    const openMaps = (address: string) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t('nearestCentersTitle')}</h3>
            <div className="grid gap-4">
                {results.map((center) => (
                    <Card key={center.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-blue-700 dark:text-blue-400 mb-1">{center.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                <span className="font-medium">{t('locatorAddressLabel')}:</span> {center.address}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <span className="font-medium">{t('locatorPhoneLabel')}:</span> {center.phone}
                            </p>
                            <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                {center.distanceStr}
                            </span>
                        </div>
                        <Button
                            onClick={() => openMaps(center.address)}
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
