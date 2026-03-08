# File Drive Test UI

A standalone React application for testing the File Service microservice.

## Features

- 📁 **Folder Management**: Create, navigate, and delete folders
- 📄 **File Upload**: Drag & drop or select files to upload
- 🔍 **Search**: Search files and folders
- ⬇️ **Download**: Download files with presigned URLs
- 🗑️ **Delete**: Remove files and folders
- 📂 **Navigation**: Breadcrumb navigation and folder hierarchy

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Access Application**
   Open http://localhost:3000 in your browser

## API Integration

This test UI connects to the File Service microservice running on `http://localhost:5001`.

### Endpoints Used

- `POST /files/upload` - Upload files
- `POST /files/folder` - Create folders  
- `GET /files/user/:userId` - Get user files and folders
- `DELETE /files/:fileId` - Delete files/folders
- `GET /files/download/:fileId` - Get download URL

### Authentication

Uses simulated authentication with demo user ID: `demo-user`

## File Types Supported

- 📄 PDF documents
- 📝 Word documents (.doc, .docx)
- 🖼️ Images (.jpg, .jpeg, .png, .gif)
- 📦 Archives (.zip, .rar)
- 📄 Other documents

## UI Components

### FileToolbar
- Upload button
- New folder button
- Search input

### FileUploader
- Drag & drop zone
- File picker
- Progress indicators
- Multiple file support

### FolderCard
- Folder icon
- File count display
- Navigation and delete actions

### FileCard
- File type icons
- File metadata display
- Download and delete actions
- Preview for images/PDFs

### MyFiles Page
- Drive-style interface
- Breadcrumb navigation
- Grid layout
- Empty states
- Error handling

## Styling

- Dark theme with `#0A0F1C` background
- Card-based layout with `#111827` cards
- Gold accent colors (`#d69e2e`)
- Responsive design for mobile and desktop

## Testing Scenarios

1. **File Upload**
   - Drag and drop files
   - Select multiple files
   - Upload progress tracking
   - Error handling

2. **Folder Operations**
   - Create new folders
   - Navigate folder hierarchy
   - Delete folders with contents

3. **File Management**
   - Download files
   - Delete individual files
   - Search functionality
   - Preview images/PDFs

4. **Error Handling**
   - Network errors
   - File type validation
   - Size limitations
   - Permission errors

## Configuration

The application expects the File Service microservice to be running at:
```
http://localhost:5001
```

## Development Notes

- Uses React 18 with functional components
- Axios for HTTP requests
- React Router for navigation
- CSS Grid for responsive layout
- FormData for file uploads

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Purpose**: This is a testing frontend specifically designed to validate and demonstrate the File Service microservice functionality in isolation from the main NyayaSetu AI application.
