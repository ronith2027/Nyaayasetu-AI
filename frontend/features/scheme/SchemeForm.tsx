import React from 'react';
import { EligibilityData } from './types';
import { Loader } from '../../components/Loader';
import './Scheme.css';

interface SchemeFormProps {
    data: EligibilityData;
    updateData: (data: Partial<EligibilityData>) => void;
    onSubmit: () => void;
    loading: boolean;
}

const SchemeForm: React.FC<SchemeFormProps> = ({ data, updateData, onSubmit, loading }) => {
    return (
        <div className="scheme-container">
            <div className="scheme-header">
                <h2 className="scheme-title">Check Eligibility</h2>
                <p className="scheme-subtitle">Fill in your details to discover government schemes.</p>
            </div>

            <div className="scheme-form-card">
                <div className="scheme-grid">
                    <div className="scheme-input-group">
                        <label className="scheme-label">Age</label>
                        <input
                            type="number"
                            className="scheme-input"
                            value={data.age || ''}
                            onChange={(e: any) => updateData({ age: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="scheme-input-group">
                        <label className="scheme-label">State</label>
                        <input
                            type="text"
                            className="scheme-input"
                            value={data.state || ''}
                            onChange={(e: any) => updateData({ state: e.target.value })}
                            placeholder="e.g. Maharashtra"
                        />
                    </div>

                    <div className="scheme-input-group">
                        <label className="scheme-label">Category</label>
                        <select
                            className="scheme-select"
                            value={data.category || ''}
                            onChange={(e: any) => updateData({ category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                        </select>
                    </div>

                    <div className="scheme-input-group">
                        <label className="scheme-label">Annual Income (₹)</label>
                        <input
                            type="number"
                            className="scheme-input"
                            value={data.annualIncome || ''}
                            onChange={(e: any) => updateData({ annualIncome: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="scheme-input-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="scheme-label">Occupation</label>
                        <input
                            type="text"
                            className="scheme-input"
                            value={data.occupation || ''}
                            onChange={(e: any) => updateData({ occupation: e.target.value })}
                            placeholder="e.g. Farmer, Student, Business"
                        />
                    </div>
                </div>

                <div className="scheme-submit-container">
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className="scheme-btn"
                    >
                        {loading ? <Loader /> : "Discover Schemes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SchemeForm;
