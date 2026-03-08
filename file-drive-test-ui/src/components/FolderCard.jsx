import React from 'react';
import { formatDate } from '../services/fileService.js';

const FolderCard = ({ folder, onClick, onDelete }) => {
  return (
    <div className="card folder-card" onClick={() => onClick(folder)}>
      <div className="card-content">
        <div className="card-icon">
          📁
        </div>
        
        <div className="card-info">
          <h3 className="card-title">{folder.folder_name}</h3>
          <div className="card-meta">
            <span className="file-count">{folder.file_count || 0} files</span>
            <span className="created-date">{formatDate(folder.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(folder);
          }}
          className="action-btn open-btn"
          title="Open folder"
        >
          📂
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete folder "${folder.folder_name}" and all its contents?`)) {
              onDelete(folder);
            }
          }}
          className="action-btn delete-btn"
          title="Delete folder"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default FolderCard;
