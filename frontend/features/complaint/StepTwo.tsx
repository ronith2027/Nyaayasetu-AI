
import React from 'react';
import { ComplaintData } from './types';
import { useLanguage } from '../../lib/LanguageContext';
import './Complaint.css';

interface StepTwoProps {
  data: ComplaintData;
  updateData: (data: Partial<ComplaintData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ data, updateData, onNext, onPrev }) => {
  const { t } = useLanguage();

  return (
    <div className="complaint-wizard">
      <div className="wizard-progress">
        <div className="step-indicator completed">&#10003;</div>
        <div className="step-indicator active">2</div>
        <div className="step-indicator">3</div>
      </div>

      <div className="complaint-card">
        <h2 className="complaint-title">{t('step2Title')}</h2>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">{t('oppositePartyNameLabel')}</label>
            <input
              type="text"
              className="form-input"
              value={data.oppositeParty.name || ''}
              onChange={(e: any) => updateData({ oppositeParty: { ...data.oppositeParty, name: e.target.value } })}
              placeholder={t('oppositePartyNamePlaceholder')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('oppositePartyAddressLabel')}</label>
            <input
              type="text"
              className="form-input"
              value={data.oppositeParty.address || ''}
              onChange={(e: any) => updateData({ oppositeParty: { ...data.oppositeParty, address: e.target.value } })}
              placeholder={t('oppositePartyAddressPlaceholder')}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">{t('factsLabel')}</label>
            <textarea
              className="form-textarea"
              value={data.facts || ''}
              onChange={(e: any) => updateData({ facts: e.target.value })}
              placeholder={t('factsPlaceholder')}
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={onPrev} className="btn btn-secondary">
            {t('backBtn')}
          </button>
          <button onClick={onNext} className="btn btn-primary">
            {t('nextStepBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
