import React, { useState, useRef } from 'react';
import Button from '../ui/Button';

const ClaimUploader = ({ onUploadSuccess, onUploadError }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null
    }));

    // Create previews for images
    newFiles.forEach(fileObj => {
      if (fileObj.file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileObj.preview = e.target.result;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(fileObj.file);
      }
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onUploadError?.({ message: 'Please select at least one file' });
      return;
    }

    setUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const uploadedFiles = files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString()
      }));

      onUploadSuccess?.(uploadedFiles);
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      onUploadError?.(error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📋';
    if (type.includes('document') || type.includes('word')) return '📝';
    return '📄';
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : files.length > 0
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-5xl mb-4">📎</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Upload Claim Documents
        </h3>
        <p className="text-gray-500 mb-6">
          Drag and drop your files here, or click to browse
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mb-4"
        >
          📁 Choose Files
        </Button>
        <p className="text-sm text-gray-400">
          Supported: JPG, PNG, PDF, DOC, DOCX (Max 5MB each)
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-3">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">
                      {getFileIcon(fileObj.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {fileObj.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(fileObj.size)} • {fileObj.type || 'Unknown type'}
                      </div>
                      {fileObj.preview && (
                        <div className="mt-2">
                          <img 
                            src={fileObj.preview} 
                            alt="Preview" 
                            className="max-w-32 max-h-32 rounded-lg shadow"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFile(fileObj.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded ml-2"
                  >
                    ❌
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="mt-6 flex justify-center space-x-4">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className={`px-8 py-3 rounded-lg font-medium ${
                uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {uploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Uploading {files.length} file(s)...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  Upload {files.length} file(s)
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setFiles([])}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Clear All
            </Button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Processing your documents...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload Tips */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">💡 Upload Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Take clear, well-lit photos of damage</li>
          <li>• Include multiple angles if applicable</li>
          <li>• Ensure documents are readable and complete</li>
          <li>• File size limit: 5MB per file</li>
          <li>• Accepted formats: JPG, PNG, PDF, DOC, DOCX</li>
        </ul>
      </div>
    </div>
  );
};

export default ClaimUploader;