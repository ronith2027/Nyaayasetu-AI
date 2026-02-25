
import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ComplaintDraft } from './types';
import './Complaint.css';

interface ComplaintPreviewProps {
  draft: ComplaintDraft;
}

const ComplaintPreview: React.FC<ComplaintPreviewProps> = ({ draft }) => {
  return (
    <Card className="p-6 space-y-6 bg-white border shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-serif font-bold text-center">LEGAL COMPLAINT DRAFT</h2>
        {draft?.sections_referenced?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {draft.sections_referenced.map((section, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {section}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800 p-4 border rounded bg-gray-50">
        {draft?.complaint_text || (draft as any)?.formattedDraft || "Draft content is being generated or is unavailable. Please check your inputs and try again."}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t mt-8">
        <Button 
          className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-lg"
          onClick={() => draft?.download_url && window.open(draft.download_url, '_blank')}
          disabled={!draft?.download_url}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </Button>
        <Button 
          className="btn btn-success w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-lg"
          onClick={() => {
            const complaintText = draft?.complaint_text || "";
            const text = encodeURIComponent(`Legal Complaint Draft:\n\n${complaintText.substring(0, 500)}...`);
            window.open(`https://wa.me/?text=${text}`, '_blank');
          }}
          disabled={!draft?.complaint_text}
        >
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Send via WhatsApp
        </Button>
      </div>
    </Card>
  );
};

export default ComplaintPreview;
