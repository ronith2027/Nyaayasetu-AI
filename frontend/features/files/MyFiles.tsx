"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { getStoredToken } from '../../services/authService';
import { getUserFiles, createFolder, deleteItem, getDownloadUrl } from '../../services/fileService';
import FileToolbar from './FileToolbar';
import FileCard from './FileCard';
import FolderCard from './FolderCard';
import FileUploader from './FileUploader';

const MyFiles = ({ user }) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');

  const token = getStoredToken();

  // Load files and folders
  const loadFilesAndFolders = async (folderId = 'root') => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getUserFiles(
        user.user_id,
        token,
        { folderId, search: searchQuery }
      );

      if (result.success) {
        setFiles(result.data.files || []);
        setFolders(result.data.folders || []);
        setCurrentFolder(result.data.current_folder);
        setBreadcrumb(result.data.breadcrumb || []);
      } else {
        setError(result.error || 'Failed to load files');
      }
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user && token) {
      loadFilesAndFolders();
    }
  }, [user, token]);

  // Handle search
  useEffect(() => {
    if (user && token) {
      const timer = setTimeout(() => {
        loadFilesAndFolders(currentFolder?.folder_id || 'root');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Handle folder navigation
  const navigateToFolder = (folder) => {
    loadFilesAndFolders(folder.folder_id);
  };

  // Handle breadcrumb navigation
  const navigateToBreadcrumb = (folderId, index) => {
    if (index === breadcrumb.length - 1) return; // Current folder
    const targetFolder = breadcrumb[index];
    loadFilesAndFolders(targetFolder.folder_id);
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    try {
      const result = await createFolder({
        user_id: user.user_id,
        folder_name: folderName.trim(),
        parent_folder_id: currentFolder?.folder_id || null,
        token
      });

      if (result.success) {
        setShowFolderModal(false);
        setFolderName('');
        loadFilesAndFolders(currentFolder?.folder_id || 'root');
      } else {
        setError(result.error || 'Failed to create folder');
      }
    } catch (err) {
      setError(err.message || 'Failed to create folder');
    }
  };

  // Handle file upload success
  const handleUploadSuccess = () => {
    setShowUploader(false);
    loadFilesAndFolders(currentFolder?.folder_id || 'root');
  };

  // Handle item deletion
  const handleDelete = async (item, isFolder = false) => {
    if (!confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`)) {
      return;
    }

    try {
      const result = await deleteItem(
        isFolder ? item.folder_id : item.file_id,
        token,
        isFolder
      );

      if (result.success) {
        loadFilesAndFolders(currentFolder?.folder_id || 'root');
      } else {
        setError(result.error || 'Failed to delete item');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    }
  };

  // Handle file download
  const handleDownload = async (file) => {
    try {
      const result = await getDownloadUrl(file.file_id, token);

      if (result.success) {
        // Open download URL in new tab
        window.open(result.download_url, '_blank');
      } else {
        setError(result.error || 'Failed to get download link');
      }
    } catch (err) {
      setError(err.message || 'Failed to download file');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <FileToolbar
        onUpload={() => setShowUploader(true)}
        onNewFolder={() => setShowFolderModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => loadFilesAndFolders('root')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t('myFiles')}
          </button>
          {breadcrumb.map((crumb, index) => (
            <React.Fragment key={crumb.folder_id}>
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <button
                onClick={() => navigateToBreadcrumb(crumb.folder_id, index)}
                className={`${
                  index === breadcrumb.length - 1
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                }`}
              >
                {crumb.folder_name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loading')}</span>
        </div>
      )}

      {/* Files and Folders Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Folders */}
          {folders.map((folder) => (
            <FolderCard
              key={folder.folder_id}
              folder={folder}
              onClick={() => navigateToFolder(folder)}
              onDelete={() => handleDelete(folder, true)}
            />
          ))}

          {/* Files */}
          {files.map((file) => (
            <FileCard
              key={file.file_id}
              file={file}
              onDownload={() => handleDownload(file)}
              onDelete={() => handleDelete(file, false)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && folders.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('noFilesFound')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('uploadFilesToGetStarted')}
          </p>
          <button
            onClick={() => setShowUploader(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {t('uploadFiles')}
          </button>
        </div>
      )}

      {/* File Uploader Modal */}
      {showUploader && (
        <FileUploader
          user={user}
          currentFolderId={currentFolder?.folder_id}
          onSuccess={handleUploadSuccess}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('createNewFolder')}
              </h2>
              <button
                onClick={() => setShowFolderModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('folderName')}
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('enterFolderName')}
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  {t('create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;
