"use client";

import React from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Language } from '../lib/translations';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <select
                value={language}
                onChange={handleLanguageChange}
                style={{
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    border: '1px solid currentColor',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '14px',
                }}
            >
                <option value="en" style={{ color: 'black' }}>English (EN)</option>
                <option value="kn" style={{ color: 'black' }}>ಕನ್ನಡ (KN)</option>
                <option value="hi" style={{ color: 'black' }}>हिन्दी (HI)</option>
            </select>
        </div>
    );
}
