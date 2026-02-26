
import React from 'react';
import { Loader } from '../../components/Loader';
import { ComplaintData } from './types';
import './Complaint.css';
import { useLanguage } from '../../lib/LanguageContext';

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
        <h2 className="complaint-title">{t('step3LegalGroundsRelief')}</h2>

        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">{t('legalGroundsOptional')}</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px' }}
              placeholder={t('legalGroundsOptional')}
              value={data.legalGrounds || ''}
              onChange={(e: any) => updateData({ legalGrounds: e.target.value })}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">{t('reliefSought')}</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px' }}
              placeholder={t('reliefSought')}
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
            {t('back')}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !data.declaration}
            className="btn btn-success"
          >
            {loading ? <Loader /> : t('generateLegalComplaint')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
