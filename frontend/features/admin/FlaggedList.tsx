import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Button } from '../../components/Button';

interface FlaggedItem {
    id: string;
    query: string;
    response: string;
    confidenceScore: number;
    timestamp: string;
    status: 'pending' | 'reviewed';
}

interface FlaggedListProps {
    items: FlaggedItem[];
    onReviewClick: (item: FlaggedItem) => void;
}

export const FlaggedList: React.FC<FlaggedListProps> = ({ items, onReviewClick }) => {
    const { t } = useLanguage();

    if (!items || items.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {t('noFlaggedItems')}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('queryTh')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('responseTh')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('confidenceTh')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('timestampTh')}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('actionTh')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 align-top max-w-xs truncate">
                                {item.query}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 align-top max-w-sm truncate">
                                {item.response}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 align-top">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.confidenceScore < 0.6 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {(item.confidenceScore * 100).toFixed(0)}%
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 align-top whitespace-nowrap">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium align-top whitespace-nowrap">
                                <Button
                                    onClick={() => onReviewClick(item)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                                >
                                    {t('reviewBtn')}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
