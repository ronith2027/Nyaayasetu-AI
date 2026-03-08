import React, { useState, useEffect } from 'react';
import FileToolbar from '../components/FileToolbar.jsx';
import FileUploader from '../components/FileUploader.jsx';
import FolderCard from '../components/FolderCard.jsx';
import FileCard from '../components/FileCard.jsx';
import { getUserFiles, createFolder, deleteFile } from '../services/fileService.js';

const MyFiles = () => {
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

  // Load files and folders
  const loadFilesAndFolders = async (folderId = null) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getUserFiles(folderId);
      
      if (result.success) {
        setFiles(result.data.files || []);
        setFolders(result.data.folders || []);
        setCurrentFolder(result.data.current_folder);
        setBreadcrumb(result.data.breadcrumb || []);
      } else {
        setError(result.error || 'Failed to load files');
      }
    } catch (error) {
      setError(error.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadFilesAndFolders();
  }, []);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFilesAndFolders(currentFolder?.folder_id);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle folder navigation
  const navigateToFolder = (folder) => {
    loadFilesAndFolders(folder.folder_id);
  };

  // Handle breadcrumb navigation
  const navigateToBreadcrumb = (folderId, index) => {
    if (index === breadcrumb.length - 1) return; // Current folder
    
    if (index === -1) {
      // Root folder
      loadFilesAndFolders(null);
    } else {
      const targetFolder = breadcrumb[index];
      loadFilesAndFolders(targetFolder.folder_id);
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    try {
      const result = await createFolder(
        folderName.trim(),
        currentFolder?.folder_id
      );

      if (result.success) {
        setShowFolderModal(false);
        setFolderName('');
        loadFilesAndFolders(currentFolder?.folder_id);
      } else {
        setError(result.error || 'Failed to create folder');
      }
    } catch (error) {
      setError(error.message || 'Failed to create folder');
    }
  };

  // Handle item deletion
  const handleDelete = async (item, isFolder = false) => {
    try {
      const result = await deleteFile(
        isFolder ? item.folder_id : item.file_id,
        isFolder
      );

      if (result.success) {
        loadFilesAndFolders(currentFolder?.folder_id);
      } else {
        setError(result.error || 'Failed to delete item');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete item');
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="app-header">
        <h1>📁 My Files</h1>
        <p>Test your File Service microservice</p>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="breadcrumb">
          <button
            onClick={() => navigateToBreadcrumb(null, -1)}
            className="breadcrumb-item"
          >
            🏠 Home
          </button>
          
          {breadcrumb.map((crumb, index) => (
            <React.Fragment key={crumb.folder_id}>
              <span className="breadcrumb-separator">/</span>
              <button
                onClick={() => navigateToBreadcrumb(crumb.folder_id, index)}
                className={`breadcrumb-item ${index === breadcrumb.length - 1 ? 'active' : ''}`}
              >
                {crumb.folder_name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <FileToolbar
        onUpload={() => setShowUploader(true)}
        onNewFolder={() => setShowFolderModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="error-close">✕</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading files...</p>
        </div>
      )}

      {/* Files and Folders Grid */}
      {!loading && (
        <div className="content-grid">
          {/* Folders */}
          {folders.map((folder) => (
            <FolderCard
              key={folder.folder_id}
              folder={folder}
              onClick={navigateToFolder}
              onDelete={() => handleDelete(folder, true)}
            />
          ))}

          {/* Files */}
          {files.map((file) => (
            <FileCard
              key={file.file_id}
              file={file}
              onDelete={() => handleDelete(file, false)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && folders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No files found</h3>
          <p>Upload some files to get started</p>
          <button
            onClick={() => setShowUploader(true)}
            className="btn btn-primary"
          >
            📤 Upload Files
          </button>
        </div>
      )}

      {/* File Uploader Modal */}
      {showUploader && (
        <FileUploader
          currentFolderId={currentFolder?.folder_id}
          onSuccess={() => loadFilesAndFolders(currentFolder?.folder_id)}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Folder</h2>
              <button onClick={() => setShowFolderModal(false)} className="close-btn">✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Folder Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="form-input"
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowFolderModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="btn btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;
