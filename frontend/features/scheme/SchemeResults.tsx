import React from 'react';
import { Scheme } from './types';
import SchemeCard from './SchemeCard';
import './Scheme.css';
import { useLanguage } from '../../lib/LanguageContext';

interface SchemeResultsProps {
    schemes: Scheme[];
    hasSearched: boolean;
}

const SchemeResults: React.FC<SchemeResultsProps> = ({ schemes, hasSearched }) => {
    const { t } = useLanguage();
    if (!hasSearched) return null;

    if (schemes.length === 0) {
        return (
            <div className="empty-state">
                <h3>{t('noSchemesFound')}</h3>
                <p>{t('noSchemesFoundSubtitle')}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="results-header">
                {t('matchingSchemes')} <span className="results-count">{schemes.length}</span>
            </div>
            <div className="results-list">
                {schemes.map(scheme => (
                    <SchemeCard key={scheme.id} scheme={scheme} />
                ))}
            </div>
        </div>
    );
};

export default SchemeResults;
