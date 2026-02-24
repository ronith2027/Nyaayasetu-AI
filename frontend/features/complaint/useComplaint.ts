
import { useState } from 'react';
import { api } from '../../lib/api';
import { ComplaintData, ComplaintDraft } from './types';

export const useComplaint = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ComplaintDraft | null>(null);
  const [formData, setFormData] = useState<ComplaintData>({
    complainant: { name: '', address: '', city: '', phone: '' },
    oppositeParty: { name: '', address: '' },
    facts: '',
    legalGrounds: '',
    relief: '',
    declaration: false
  });

  const updateFormData = (data: Partial<ComplaintData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const submitComplaint = async () => {
    setLoading(true);
    setError(null);
    const result = await api.post<ComplaintDraft>('/complaint', formData);
    
    if (result.success && result.data) {
      setDraft(result.data);
      nextStep();
    } else {
      setError(result.error || "Failed to generate complaint draft");
    }
    setLoading(false);
  };

  return {
    step,
    formData,
    loading,
    error,
    draft,
    updateFormData,
    nextStep,
    prevStep,
    submitComplaint
  };
};
