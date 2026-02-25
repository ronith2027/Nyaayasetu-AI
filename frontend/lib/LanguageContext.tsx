"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Look up saved language initially, default to 'en'
    const [language, setLanguageState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('nyayasetu-lang') as Language;
        if (stored && ['en', 'kn', 'hi'].includes(stored)) {
            setLanguageState(stored);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('nyayasetu-lang', lang);
    };

    const t = (key: string): string => {
        const langDict = translations[language] || translations.en;
        return langDict[key] || translations.en[key] || key;
    };

    // Avoid hydration mismatch by waiting for mount
    // Avoid hydration mismatch by waiting for mount
    if (!mounted) {
        // Return a provider with default en translation while waiting for mount
        return (
            <LanguageContext.Provider value={{ language: 'en', setLanguage, t }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
