
import React from 'react';
import { Loader } from '../../components/Loader';
import { ComplaintData } from './types';
import { useLanguage } from '../../lib/LanguageContext';
import './Complaint.css';

interface StepThreeProps {
  data: ComplaintData;
  updateData: (data: Partial<ComplaintData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  loading: boolean;
}

const StepThree: React.FC<StepThreeProps> = ({ data, updateData, onSubmit, onPrev, loading }) => {
  const { t } = useLanguage();

  return (
    <div className="complaint-wizard">
      <div className="wizard-progress">
        <div className="step-indicator completed">&#10003;</div>
        <div className="step-indicator completed">&#10003;</div>
        <div className="step-indicator active">3</div>
      </div>

      <div className="complaint-card">
        <h2 className="complaint-title">{t('step3Title')}</h2>

        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">{t('legalGroundsLabel')}</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px' }}
              placeholder={t('legalGroundsPlaceholder')}
              value={data.legalGrounds || ''}
              onChange={(e: any) => updateData({ legalGrounds: e.target.value })}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">{t('reliefLabel')}</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px' }}
              placeholder={t('reliefPlaceholder')}
              value={data.relief || ''}
              onChange={(e: any) => updateData({ relief: e.target.value })}
            />
          </div>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="declaration"
            className="checkbox-input"
            checked={data.declaration || false}
            onChange={(e: any) => updateData({ declaration: e.target.checked })}
          />
          <label htmlFor="declaration" className="checkbox-label">
            {t('declarationText')}
          </label>
        </div>

        <div className="form-actions">
          <button onClick={onPrev} className="btn btn-secondary">
            {t('backBtn')}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !data.declaration}
            className="btn btn-success"
          >
            {loading ? <Loader /> : t('generateComplaintBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
