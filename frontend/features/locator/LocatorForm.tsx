import React, { useState } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Button } from '../../components/Button';

interface LocatorFormProps {
    onSearch: (pincode: string, state: string) => void;
    loading: boolean;
}

export const LocatorForm: React.FC<LocatorFormProps> = ({ onSearch, loading }) => {
    const { t } = useLanguage();
    const [pincode, setPincode] = useState('');
    const [stateStr, setStateStr] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(pincode, stateStr);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 w-full max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t('locatorFormTitle')}</h3>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pincodeLabel')}</label>
                <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder={t('pincodePlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('stateOptionalLabel')}</label>
                <select
                    value={stateStr}
                    onChange={(e) => setStateStr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                    <option value="">{t('selectStatePlaceholder')}</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                </select>
            </div>
            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
                {loading ? t('searchingBtn') : t('findCentersBtn')}
            </Button>
        </form>
    );
};
