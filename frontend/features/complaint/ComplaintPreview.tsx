
import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ComplaintDraft } from './types';

interface ComplaintPreviewProps {
  draft: ComplaintDraft;
}

const ComplaintPreview: React.FC<ComplaintPreviewProps> = ({ draft }) => {
  return (
    <Card className="p-6 space-y-6 bg-white border shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-serif font-bold text-center">LEGAL COMPLAINT DRAFT</h2>
        <p className="text-sm text-center text-gray-500 mt-1">Ref ID: {draft.draftId}</p>
      </div>
      
      <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800 p-4 border rounded bg-gray-50">
        {draft.formattedDraft}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
        <Button className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold">
          Download PDF
        </Button>
        <Button className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-bold">
          Send via WhatsApp
        </Button>
      </div>
    </Card>
  );
};

export default ComplaintPreview;
