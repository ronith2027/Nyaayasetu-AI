import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';

interface FlaggedItem {
    id: string;
    query: string;
    response: string;
    confidenceScore: number;
    timestamp: string;
    status: 'pending' | 'reviewed';
}

interface ReviewModalProps {
    item: FlaggedItem;
    onClose: () => void;
    onAction: (id: string, action: 'approve' | 'mark_incorrect' | 'escalate') => void;
    loading: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ item, onClose, onAction, loading }) => {
    const { t } = useLanguage();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col pointer-events-auto border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t('reviewItemTitle')} <span className="text-sm font-normal text-gray-500">({item.id})</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('userQueryLabel')}</h4>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
                            {item.query}
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('aiResponseLabel')}</h4>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.confidenceScore < 0.6 ? 'bg-red-100 text-red-800 dark:bg-red-900/30' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30'}`}>
                                {t('confidenceTh')}: {(item.confidenceScore * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-blue-100 dark:border-blue-800/50">
                            {item.response}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <Button
                        onClick={() => onAction(item.id, 'escalate')}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    >
                        {t('escalateBtn')}
                    </Button>
                    <Button
                        onClick={() => onAction(item.id, 'mark_incorrect')}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    >
                        {t('markIncorrectBtn')}
                    </Button>
                    <Button
                        onClick={() => onAction(item.id, 'approve')}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    >
                        {t('approveBtn')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
