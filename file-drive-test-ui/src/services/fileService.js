import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

// Simulated authentication - dummy user ID
const DEMO_USER_ID = 'demo-user';

// File service functions
export const uploadFile = async (file, folderId = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_id', folderId || '');
    formData.append('user_id', DEMO_USER_ID);

    const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const createFolder = async (folderName, parentFolderId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/files/folder`, {
      folder_name: folderName,
      parent_folder_id: parentFolderId,
      user_id: DEMO_USER_ID,
    });

    return response.data;
  } catch (error) {
    console.error('Create folder error:', error);
    throw error;
  }
};

export const getUserFiles = async (folderId = null) => {
  try {
    const params = new URLSearchParams();
    params.append('userId', DEMO_USER_ID);
    if (folderId) {
      params.append('folderId', folderId);
    }

    const response = await axios.get(`${API_BASE_URL}/files/user/${DEMO_USER_ID}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Get files error:', error);
    throw error;
  }
};

export const deleteFile = async (fileId, isFolder = false) => {
  try {
    const id = isFolder ? `folder_${fileId}` : fileId;
    const response = await axios.delete(`${API_BASE_URL}/files/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export const getDownloadUrl = async (fileId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/files/download/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Download URL error:', error);
    throw error;
  }
};

// Helper functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const iconMap = {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'zip': '📦',
    'rar': '📦',
    'default': '📄'
  };
  
  return iconMap[extension] || iconMap['default'];
};
