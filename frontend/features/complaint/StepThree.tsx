
import React from 'react';
import { Loader } from '../../components/Loader';
import { ComplaintData } from './types';
import './Complaint.css';

interface StepThreeProps {
  data: ComplaintData;
  updateData: (data: Partial<ComplaintData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  loading: boolean;
}

const StepThree: React.FC<StepThreeProps> = ({ data, updateData, onSubmit, onPrev, loading }) => {
  return (
    <div className="complaint-wizard">
      <div className="wizard-progress">
        <div className="step-indicator completed">&#10003;</div>
        <div className="step-indicator completed">&#10003;</div>
        <div className="step-indicator active">3</div>
      </div>

      <div className="complaint-card">
        <h2 className="complaint-title">Step 3: Legal Grounds & Relief</h2>

        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Legal Grounds (Optional)</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px' }}
              placeholder="Any specific laws or rules violated?"
              value={data.legalGrounds || ''}
              onChange={(e: any) => updateData({ legalGrounds: e.target.value })}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Relief Sought</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px' }}
              placeholder="What do you want the authority to do? (e.g. Please refund my money)"
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
            I hereby declare that the facts stated above are true to the best of my knowledge and belief.
          </label>
        </div>

        <div className="form-actions">
          <button onClick={onPrev} className="btn btn-secondary">
            &larr; Back
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !data.declaration}
            className="btn btn-success"
          >
            {loading ? <Loader /> : "Generate Legal Valid Complaint"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
