import React from 'react';
import { EligibilityData } from './types';
import { Loader } from '../../components/Loader';
import { useLanguage } from '../../lib/LanguageContext';
import './Scheme.css';

interface SchemeFormProps {
    data: EligibilityData;
    updateData: (data: Partial<EligibilityData>) => void;
    onSubmit: () => void;
    loading: boolean;
}

const SchemeForm: React.FC<SchemeFormProps> = ({ data, updateData, onSubmit, loading }) => {
    const { t } = useLanguage();

    return (
        <div className="scheme-container">
            <div className="scheme-header">
                <h2 className="scheme-title">{t('checkEligibilityTitle')}</h2>
                <p className="scheme-subtitle">{t('checkEligibilitySubtitle')}</p>
            </div>

            <div className="scheme-form-card">
                <div className="scheme-grid">
                    <div className="scheme-input-group">
                        <label className="scheme-label">{t('ageLabel')}</label>
                        <input
                            type="number"
                            className="scheme-input"
                            value={data.age || ''}
                            onChange={(e: any) => updateData({ age: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="scheme-input-group">
                        <label className="scheme-label">{t('stateLabel')}</label>
                        <input
                            type="text"
                            className="scheme-input"
                            value={data.state || ''}
                            onChange={(e: any) => updateData({ state: e.target.value })}
                            placeholder={t('statePlaceholder')}
                        />
                    </div>

                    <div className="scheme-input-group">
                        <label className="scheme-label">{t('categoryLabel')}</label>
                        <select
                            className="scheme-select"
                            value={data.category || ''}
                            onChange={(e: any) => updateData({ category: e.target.value })}
                        >
                            <option value="">{t('categoryPlaceholder')}</option>
                            <option value="General">{t('categoryGeneral')}</option>
                            <option value="OBC">{t('categoryOBC')}</option>
                            <option value="SC">{t('categorySC')}</option>
                            <option value="ST">{t('categoryST')}</option>
                        </select>
                    </div>

                    <div className="scheme-input-group">
                        <label className="scheme-label">{t('incomeLabel')}</label>
                        <input
                            type="number"
                            className="scheme-input"
                            value={data.annualIncome || ''}
                            onChange={(e: any) => updateData({ annualIncome: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="scheme-input-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="scheme-label">{t('occupationLabel')}</label>
                        <input
                            type="text"
                            className="scheme-input"
                            value={data.occupation || ''}
                            onChange={(e: any) => updateData({ occupation: e.target.value })}
                            placeholder={t('occupationPlaceholder')}
                        />
                    </div>
                </div>

                <div className="scheme-submit-container">
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className="scheme-btn"
                    >
                        {loading ? <Loader /> : t('discoverSchemesBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SchemeForm;
