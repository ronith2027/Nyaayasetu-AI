
import React from 'react';
import { ComplaintData } from './types';
import './Complaint.css';

interface StepTwoProps {
  data: ComplaintData;
  updateData: (data: Partial<ComplaintData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ data, updateData, onNext, onPrev }) => {
  return (
    <div className="complaint-wizard">
      <div className="wizard-progress">
        <div className="step-indicator completed">&#10003;</div>
        <div className="step-indicator active">2</div>
        <div className="step-indicator">3</div>
      </div>

      <div className="complaint-card">
        <h2 className="complaint-title">Step 2: Complaint Details</h2>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Opposite Party Name</label>
            <input
              type="text"
              className="form-input"
              value={data.oppositeParty.name || ''}
              onChange={(e: any) => updateData({ oppositeParty: { ...data.oppositeParty, name: e.target.value } })}
              placeholder="Who are you complaining against?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Opposite Party Address</label>
            <input
              type="text"
              className="form-input"
              value={data.oppositeParty.address || ''}
              onChange={(e: any) => updateData({ oppositeParty: { ...data.oppositeParty, address: e.target.value } })}
              placeholder="Address of the opposite party"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Facts of Case</label>
            <textarea
              className="form-textarea"
              value={data.facts || ''}
              onChange={(e: any) => updateData({ facts: e.target.value })}
              placeholder="Describe what happened in detail..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={onPrev} className="btn btn-secondary">
            &larr; Back
          </button>
          <button onClick={onNext} className="btn btn-primary">
            Next Step &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
