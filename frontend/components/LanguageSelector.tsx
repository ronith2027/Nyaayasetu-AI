"use client";

import React from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Language } from '../lib/translations';

export default function LanguageSelector() {
    const { setLanguage, t } = useLanguage();

    const handleSelect = (lang: Language) => {
        setLanguage(lang);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transform transition-all">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Choose Language</h1>
                    <p className="text-gray-500 dark:text-gray-400">Select your preferred language to continue</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleSelect('kn')}
                        className="w-full flex items-center justify-between px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex-1 text-left">ಕನ್ನಡ</span>
                        </div>
                        <span className="text-sm font-medium text-gray-400 group-hover:text-blue-500">Kannada</span>
                    </button>

                    <button
                        onClick={() => handleSelect('hi')}
                        className="w-full flex items-center justify-between px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex-1 text-left">हिन्दी</span>
                        </div>
                        <span className="text-sm font-medium text-gray-400 group-hover:text-blue-500">Hindi</span>
                    </button>

                    <button
                        onClick={() => handleSelect('en')}
                        className="w-full flex items-center justify-between px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex-1 text-left">English</span>
                        </div>
                        <span className="text-sm font-medium text-gray-400 group-hover:text-blue-500">English</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
