
import React from 'react';
import { ComplainantDetails, ComplaintData } from './types';
import { useLanguage } from '../../lib/LanguageContext';
import './Complaint.css';

interface StepOneProps {
  data: ComplainantDetails;
  updateData: (data: Partial<ComplaintData>) => void;
  onNext: () => void;
}

const StepOne: React.FC<StepOneProps> = ({ data, updateData, onNext }) => {
  const { t } = useLanguage();

  return (
    <div className="complaint-wizard">
      <div className="wizard-progress">
        <div className="step-indicator active">1</div>
        <div className="step-indicator">2</div>
        <div className="step-indicator">3</div>
      </div>

      <div className="complaint-card">
        <h2 className="complaint-title">{t('step1Title')}</h2>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">{t('fullNameLabel')}</label>
            <input
              type="text"
              className="form-input"
              value={data.name || ''}
              onChange={(e: any) => updateData({ complainant: { ...data, name: e.target.value } })}
              placeholder={t('fullNamePlaceholder')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('phoneLabel')}</label>
            <input
              type="tel"
              className="form-input"
              value={data.phone || ''}
              onChange={(e: any) => updateData({ complainant: { ...data, phone: e.target.value } })}
              placeholder={t('phonePlaceholder')}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">{t('addressLabel')}</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px' }}
              value={data.address || ''}
              onChange={(e: any) => updateData({ complainant: { ...data, address: e.target.value } })}
              placeholder={t('addressPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('cityLabel')}</label>
            <input
              type="text"
              className="form-input"
              value={data.city || ''}
              onChange={(e: any) => updateData({ complainant: { ...data, city: e.target.value } })}
              placeholder={t('cityPlaceholder')}
            />
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onNext} className="btn btn-primary">
            {t('nextStepBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
