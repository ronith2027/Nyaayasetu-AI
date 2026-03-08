"use client";

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { getFileIcon, formatFileSize, formatDate } from '../../services/fileService';

const FileCard = ({ file, onDownload, onDelete }) => {
  const { t } = useLanguage();
  const { icon, color } = getFileIcon(file.file_name, file.file_type);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 group">
      {/* File Icon */}
      <div className={`flex justify-center mb-3 ${color}`}>
        {icon}
      </div>

      {/* File Name */}
      <h3 className="text-sm font-medium text-gray-900 dark:text-white text-center mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {file.file_name}
      </h3>

      {/* File Info */}
      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>{formatFileSize(file.file_size)}</span>
          <span>{formatDate(file.created_at)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onDownload(file)}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          title={t('download')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <button
          onClick={() => onDelete(file)}
          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
          title={t('delete')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FileCard;
