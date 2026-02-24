
import React from 'react';
import { ComplainantDetails, ComplaintData } from './types';
import './Complaint.css';

interface StepOneProps {
  data: ComplainantDetails;
  updateData: (data: Partial<ComplaintData>) => void;
  onNext: () => void;
}

const StepOne: React.FC<StepOneProps> = ({ data, updateData, onNext }) => {
  return (
    <div className="complaint-wizard">
      <div className="wizard-progress">
        <div className="step-indicator active">1</div>
        <div className="step-indicator">2</div>
        <div className="step-indicator">3</div>
      </div>

      <div className="complaint-card">
        <h2 className="complaint-title">Step 1: Your Details</h2>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={data.name || ''}
              onChange={(e: any) => updateData({ complainant: { ...data, name: e.target.value } })}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={data.phone || ''}
              onChange={(e: any) => updateData({ complainant: { ...data, phone: e.target.value } })}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px' }}
              value={data.address || ''}
              onChange={(e: any) => updateData({ complainant: { ...data, address: e.target.value } })}
              placeholder="Enter your complete address"
            />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-input"
              value={data.city || ''}
              onChange={(e: any) => updateData({ complainant: { ...data, city: e.target.value } })}
              placeholder="Enter your city"
            />
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onNext} className="btn btn-primary">
            Next Step &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
