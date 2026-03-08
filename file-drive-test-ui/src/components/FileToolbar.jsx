import React from 'react';

const FileToolbar = ({ onUpload, onNewFolder, searchQuery, onSearchChange }) => {
  return (
    <div className="file-toolbar">
      <div className="toolbar-left">
        <button className="btn btn-primary" onClick={onUpload}>
          📤 Upload File
        </button>
        
        <button className="btn btn-secondary" onClick={onNewFolder}>
          📁 New Folder
        </button>
      </div>

      <div className="toolbar-right">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
    </div>
  );
};

export default FileToolbar;
