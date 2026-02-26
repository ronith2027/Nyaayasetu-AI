
import React from 'react';
import { ComplaintData } from './types';
import './Complaint.css';
import { useLanguage } from '../../lib/LanguageContext';

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
        <h2 className="complaint-title">{t('step2ComplaintDetails')}</h2>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">{t('oppositePartyName')}</label>
            <input
              type="text"
              className="form-input"
              value={data.oppositeParty.name || ''}
              onChange={(e: any) => updateData({ oppositeParty: { ...data.oppositeParty, name: e.target.value } })}
              placeholder={t('oppositePartyName')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('oppositePartyAddress')}</label>
            <input
              type="text"
              className="form-input"
              value={data.oppositeParty.address || ''}
              onChange={(e: any) => updateData({ oppositeParty: { ...data.oppositeParty, address: e.target.value } })}
              placeholder={t('oppositePartyAddress')}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">{t('factsOfCase')}</label>
            <textarea
              className="form-textarea"
              value={data.facts || ''}
              onChange={(e: any) => updateData({ facts: e.target.value })}
              placeholder={t('factsOfCase')}
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={onPrev} className="btn btn-secondary">
            {t('back')}
          </button>
          <button onClick={onNext} className="btn btn-primary">
            {t('nextStep')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
