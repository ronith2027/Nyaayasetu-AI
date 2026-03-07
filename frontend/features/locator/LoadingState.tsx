import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';

export const LoadingState: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                    {t('searchingBtn')}...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Fetching police stations and courts from Google Maps...
                </p>
            </div>
        </div>
    );
};
