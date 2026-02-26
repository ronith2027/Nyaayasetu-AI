import React from 'react';
import { useScheme } from './useScheme';
import SchemeForm from './SchemeForm';
import SchemeResults from './SchemeResults';
import { useLanguage } from '../../lib/LanguageContext';

const SchemeFeature: React.FC = () => {
    const { t } = useLanguage();
    const {
        formData,
        schemes,
        loading,
        error,
        hasSearched,
        updateFormData,
        findSchemes
    } = useScheme();

    return (
        <div className="max-w-4xl mx-auto py-6 md:py-8 px-4">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-center">{t('governmentSchemeFinder')}</h1>
                <p className="text-sm md:text-base text-gray-600 text-center mt-2">{t('discoverWelfareSchemes')}</p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-center text-sm md:text-base">
                    {error}
                </div>
            )}

            <div className="space-y-8">
                <SchemeForm
                    data={formData}
                    updateData={updateFormData}
                    onSubmit={findSchemes}
                    loading={loading}
                />

                <SchemeResults
                    schemes={schemes}
                    hasSearched={hasSearched}
                />
            </div>
        </div>
    );
};

export default SchemeFeature;
