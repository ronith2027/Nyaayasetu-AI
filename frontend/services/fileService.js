// File service for microservices backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Upload file
 * @param {object} fileData - File upload data
 * @returns {Promise} - Promise resolving to upload response
 */
export const uploadFile = async (fileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fileData.token}`,
      },
      body: JSON.stringify(fileData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        file: data.file
      };
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Create folder
 * @param {object} folderData - Folder creation data
 * @returns {Promise} - Promise resolving to folder creation response
 */
export const createFolder = async (folderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/folder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${folderData.token}`,
      },
      body: JSON.stringify(folderData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        folder: data.folder
      };
    } else {
      throw new Error(data.error || 'Folder creation failed');
    }
  } catch (error) {
    console.error('Folder creation error:', error);
    throw error;
  }
};

/**
 * Get user files and folders
 * @param {string} userId - User ID
 * @param {string} token - JWT token
 * @param {object} options - Query options
 * @returns {Promise} - Promise resolving to files and folders
 */
export const getUserFiles = async (userId, token, options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.folderId) {
      params.append('folderId', options.folderId);
    }
    if (options.search) {
      params.append('search', options.search);
    }

    const response = await fetch(
      `${API_BASE_URL}/files/user/${userId}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        data: data.data
      };
    } else {
      throw new Error(data.error || 'Failed to retrieve files');
    }
  } catch (error) {
    console.error('Get files error:', error);
    throw error;
  }
};

/**
 * Delete file or folder
 * @param {string} itemId - File or folder ID
 * @param {string} token - JWT token
 * @param {boolean} isFolder - Whether it's a folder
 * @returns {Promise} - Promise resolving to delete response
 */
export const deleteItem = async (itemId, token, isFolder = false) => {
  try {
    const fileId = isFolder ? `folder_${itemId}` : itemId;
    
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message
      };
    } else {
      throw new Error(data.error || 'Delete failed');
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

/**
 * Get download URL for file
 * @param {string} fileId - File ID
 * @param {string} token - JWT token
 * @returns {Promise} - Promise resolving to download URL
 */
export const getDownloadUrl = async (fileId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        download_url: data.download_url,
        file_name: data.file_name,
        expires_in: data.expires_in
      };
    } else {
      throw new Error(data.error || 'Failed to get download URL');
    }
  } catch (error) {
    console.error('Download URL error:', error);
    throw error;
  }
};

/**
 * Convert file to base64
 * @param {File} file - File object
 * @returns {Promise} - Promise resolving to base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data URL prefix to get only base64 content
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Get file icon based on file type
 * @param {string} fileName - File name
 * @param {string} fileType - File type
 * @returns {object} - Icon component and color
 */
export const getFileIcon = (fileName, fileType) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const iconMap = {
    // Documents
    'pdf': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H11V10H18V20H6Z"/>
        </svg>
      ),
      color: 'text-red-500'
    },
    'doc': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H11V10H18V20H6Z"/>
        </svg>
      ),
      color: 'text-blue-500'
    },
    'docx': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H11V10H18V20H6Z"/>
        </svg>
      ),
      color: 'text-blue-500'
    },
    // Images
    'jpg': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
        </svg>
      ),
      color: 'text-green-500'
    },
    'jpeg': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
        </svg>
      ),
      color: 'text-green-500'
    },
    'png': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
        </svg>
      ),
      color: 'text-green-500'
    },
    // Archives
    'zip': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,17H17V19H14V17M14,9H17V11H14V9M14,13H17V15H14V13M8,17H11V19H8V17M8,9H11V11H8V9M8,13H11V15H8V13M12,3L20,11V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H12M6,4V20H18V12.5L12.5,7H6V4Z"/>
        </svg>
      ),
      color: 'text-yellow-500'
    },
    'rar': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,17H17V19H14V17M14,9H17V11H14V9M14,13H17V15H14V13M8,17H11V19H8V17M8,9H11V11H8V9M8,13H11V15H8V13M12,3L20,11V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H12M6,4V20H18V12.5L12.5,7H6V4Z"/>
        </svg>
      ),
      color: 'text-yellow-500'
    },
    // Default
    'default': {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,17H17V19H14V17M14,9H17V11H14V9M14,13H17V15H14V13M8,17H11V19H8V17M8,9H11V11H8V9M8,13H11V15H8V13M12,3L20,11V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H12M6,4V20H18V12.5L12.5,7H6V4Z"/>
        </svg>
      ),
      color: 'text-gray-500'
    }
  };
  
  return iconMap[extension] || iconMap['default'];
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
