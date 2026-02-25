import { useState } from 'react';
import { api } from '../../lib/api';
import { EligibilityData, Scheme } from './types';

export const useScheme = () => {
    const [formData, setFormData] = useState<EligibilityData>({
        age: 0,
        state: '',
        category: '',
        annualIncome: 0,
        occupation: ''
    });
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const updateFormData = (data: Partial<EligibilityData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const findSchemes = async () => {
        setLoading(true);
        setError(null);
        setHasSearched(false);

        // We expect the payload structure required by the backend
        const result = await api.post<Scheme[]>('/schemes', formData);

        if (result.success && result.data) {
            setSchemes(result.data);
        } else {
            setError(result.error || "Failed to find schemes");
        }
        setLoading(false);
        setHasSearched(true);
    };

    return {
        formData,
        schemes,
        loading,
        error,
        hasSearched,
        updateFormData,
        findSchemes
    };
};
