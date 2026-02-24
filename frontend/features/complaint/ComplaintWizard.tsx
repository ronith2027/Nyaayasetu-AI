
import React from 'react';
import { useComplaint } from './useComplaint';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import ComplaintPreview from './ComplaintPreview';

const ComplaintWizard: React.FC = () => {
  const { 
    step, 
    formData, 
    loading, 
    error, 
    draft, 
    updateFormData, 
    nextStep, 
    prevStep, 
    submitComplaint 
  } = useComplaint();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center">Legal Complaint Generator</h1>
        <p className="text-gray-600 text-center mt-2">Generate a professional draft for your legal issues</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      {step === 1 && (
        <StepOne 
          data={formData.complainant} 
          updateData={updateFormData} 
          onNext={nextStep} 
        />
      )}

      {step === 2 && (
        <StepTwo 
          data={formData} 
          updateData={updateFormData} 
          onNext={nextStep} 
          onPrev={prevStep} 
        />
      )}

      {step === 3 && (
        <StepThree 
          data={formData} 
          updateData={updateFormData} 
          onSubmit={submitComplaint} 
          onPrev={prevStep}
          loading={loading}
        />
      )}

      {step === 4 && draft && (
        <ComplaintPreview draft={draft} />
      )}
    </div>
  );
};

export default ComplaintWizard;
