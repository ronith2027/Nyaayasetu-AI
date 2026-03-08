"use client";

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { formatDate } from '../../services/fileService';

const FolderCard = ({ folder, onClick, onDelete }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 group cursor-pointer">
      {/* Folder Icon */}
      <div className="flex justify-center mb-3">
        <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
        </svg>
      </div>

      {/* Folder Name */}
      <h3 className="text-sm font-medium text-gray-900 dark:text-white text-center mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {folder.folder_name}
      </h3>

      {/* Folder Info */}
      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>{folder.file_count || 0} {t('files')}</span>
          <span>{formatDate(folder.created_at)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(folder);
          }}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          title={t('open')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(folder);
          }}
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

export default FolderCard;
