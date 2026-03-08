"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { getStoredToken } from '../../services/authService';
import { uploadFile, fileToBase64 } from '../../services/fileService';

const FileUploader = ({ user, currentFolderId, onSuccess, onClose }) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const dragAreaRef = useRef(null);

  const token = getStoredToken();

  // Handle file selection
  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
    }
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, []);

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Upload all files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (fileItem) => {
        try {
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 0
          }));

          // Convert file to base64
          const base64Content = await fileToBase64(fileItem.file);
          
          // Upload file
          const result = await uploadFile({
            user_id: user.user_id,
            file_name: fileItem.file.name,
            file_content: base64Content,
            file_type: fileItem.file.type,
            file_size: fileItem.file.size,
            folder_id: currentFolderId,
            token
          });

          if (result.success) {
            setUploadProgress(prev => ({
              ...prev,
              [fileItem.id]: 100
            }));
            
            return { success: true, fileId: fileItem.id };
          } else {
            throw new Error(result.error || 'Upload failed');
          }
        } catch (error) {
          console.error(`Upload failed for ${fileItem.file.name}:`, error);
          return { success: false, fileId: fileItem.id, error: error.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      // Check if any uploads failed
      const failedUploads = results.filter(r => !r.success);
      
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} ${t('filesFailedToUpload')}`);
      } else {
        onSuccess();
      }
      
    } catch (error) {
      setError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('uploadFiles')}
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            ref={dragAreaRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors duration-200"
          >
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dragAndDropFiles')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              {t('or')}
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {t('selectFiles')}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('filesToUpload')} ({files.length})
              </h3>
              
              <div className="space-y-2">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadProgress[fileItem.id] !== undefined && (
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileItem.id]}%` }}
                          />
                        </div>
                      )}
                      
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        disabled={uploading}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {files.length > 0 && (
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200"
              >
                {uploading ? t('uploading') : t('upload')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
