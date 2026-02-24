import React from 'react';
import { Scheme } from './types';
import SchemeCard from './SchemeCard';
import './Scheme.css';

interface SchemeResultsProps {
    schemes: Scheme[];
    hasSearched: boolean;
}

const SchemeResults: React.FC<SchemeResultsProps> = ({ schemes, hasSearched }) => {
    if (!hasSearched) return null;

    if (schemes.length === 0) {
        return (
            <div className="empty-state">
                <h3>No Schemes Found</h3>
                <p>We couldn't find any schemes matching your profile at this time.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="results-header">
                Matching Schemes <span className="results-count">{schemes.length}</span>
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
