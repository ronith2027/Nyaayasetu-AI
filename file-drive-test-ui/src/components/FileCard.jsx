import React, { useState } from 'react';
import { getFileIcon, formatFileSize, formatDate, getDownloadUrl } from '../services/fileService.js';

const FileCard = ({ file, onDelete }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDownload = async () => {
    try {
      const result = await getDownloadUrl(file.file_id);
      if (result.success) {
        window.open(result.download_url, '_blank');
      } else {
        alert('Failed to get download link');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  };

  const handlePreview = () => {
    // For images and PDFs, show preview
    if (file.file_type.startsWith('image/') || file.file_type === 'application/pdf') {
      setPreviewUrl(file.file_url);
    }
  };

  const isImage = file.file_type.startsWith('image/');
  const isPDF = file.file_type === 'application/pdf';

  return (
    <div className="card file-card">
      <div className="card-content">
        <div className="card-icon" onClick={isImage || isPDF ? handlePreview : undefined}>
          {getFileIcon(file.file_name)}
          {(isImage || isPDF) && (
            <span className="preview-hint">👁️</span>
          )}
        </div>
        
        <div className="card-info">
          <h3 className="card-title">{file.file_name}</h3>
          <div className="card-meta">
            <span className="file-size">{formatFileSize(file.file_size)}</span>
            <span className="created-date">{formatDate(file.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button
          onClick={handleDownload}
          className="action-btn download-btn"
          title="Download file"
        >
          ⬇️
        </button>
        
        <button
          onClick={() => {
            if (confirm(`Delete file "${file.file_name}"?`)) {
              onDelete(file);
            }
          }}
          className="action-btn delete-btn"
          title="Delete file"
        >
          🗑️
        </button>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="modal-overlay" onClick={() => setPreviewUrl(null)}>
          <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{file.file_name}</h3>
              <button onClick={() => setPreviewUrl(null)} className="close-btn">✕</button>
            </div>
            
            <div className="modal-body">
              {isImage ? (
                <img src={previewUrl} alt={file.file_name} className="preview-image" />
              ) : isPDF ? (
                <iframe src={previewUrl} className="preview-pdf" title={file.file_name} />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileCard;
