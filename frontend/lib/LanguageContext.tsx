"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, TranslationKey } from './translations';

interface LanguageContextType {
    language: Language;
    hasSelectedLanguage: boolean;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load language preference from local storage on initial mount
        const storedLang = localStorage.getItem('app-language') as Language;
        if (storedLang && ['en', 'hi', 'kn'].includes(storedLang)) {
            setLanguageState(storedLang);
            setHasSelectedLanguage(true);
        }
        setIsLoaded(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setHasSelectedLanguage(true);
        localStorage.setItem('app-language', lang);

        // Update document dir based on language if needed (though none of these are RTL, it's good practice)
        document.documentElement.lang = lang;
    };

    const t = (key: TranslationKey): string => {
        return translations[language]?.[key] || translations['en'][key] || key;
    };

    // Prevent hydration mismatch by not rendering until we've checked localStorage
    if (!isLoaded) {
        return <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}></div>; // Or a nice splash screen / loader
    }

    return (
        <LanguageContext.Provider value={{ language, hasSelectedLanguage, setLanguage, t }}>
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
