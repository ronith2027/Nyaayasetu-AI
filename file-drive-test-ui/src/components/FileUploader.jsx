import React, { useState, useRef } from 'react';
import { uploadFile } from '../services/fileService.js';

const FileUploader = ({ currentFolderId, onSuccess, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const dragAreaRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.remove('drag-over');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.remove('drag-over');
    }
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (fileItem) => {
        try {
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 0
          }));

          await uploadFile(fileItem.file, currentFolderId);
          
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 100
          }));

          return { success: true, fileId: fileItem.id };
        } catch (error) {
          console.error(`Upload failed for ${fileItem.file.name}:`, error);
          return { success: false, fileId: fileItem.id, error };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      const failedUploads = results.filter(r => !r.success);
      
      if (failedUploads.length === 0) {
        onSuccess();
        onClose();
      } else {
        alert(`${failedUploads.length} files failed to upload`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Upload Files</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-body">
          <div
            ref={dragAreaRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="drop-area"
          >
            <div className="drop-area-content">
              <div className="upload-icon">📤</div>
              <p>Drag and drop files here</p>
              <p>or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline"
              >
                Select Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="file-input"
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              <h3>Files to Upload ({files.length})</h3>
              {files.map((fileItem) => (
                <div key={fileItem.id} className="file-item">
                  <div className="file-info">
                    <span className="file-name">📄 {fileItem.file.name}</span>
                    <span className="file-size">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  
                  <div className="file-actions">
                    {uploadProgress[fileItem.id] !== undefined && (
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${uploadProgress[fileItem.id]}%` }}
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="remove-btn"
                      disabled={uploading}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline" disabled={uploading}>
            Cancel
          </button>
          
          <button
            onClick={handleUpload}
            className="btn btn-primary"
            disabled={uploading || files.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
