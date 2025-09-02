import React, { useState, useRef } from 'react';
import { uploadPolicy } from '../../api/policyService';
import Button from '../ui/Button';

const PolicyUploader = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview for images or show file info
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) {
      onUploadError?.({ message: 'Please select a file first' });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadPolicy(file);
      onUploadSuccess?.(result);
      setFile(null);
      setPreview(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      onUploadError?.(err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : file 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!file ? (
          <>
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Upload Policy Document
            </h3>
            <p className="text-gray-500 mb-6">
              Drag and drop your file here, or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              📁 Choose File
            </Button>
            <p className="text-sm text-gray-400 mt-4">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl">✅</div>
            <h3 className="text-lg font-semibold text-green-700">
              File Selected
            </h3>
            
            {/* File Info */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {file.type.includes('pdf') ? '📋' : 
                     file.type.includes('doc') ? '📝' : 
                     file.type.includes('image') ? '🖼️' : '📄'}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                >
                  ❌
                </Button>
              </div>
              
              {/* Image Preview */}
              {preview && (
                <div className="mt-4">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-w-full max-h-48 mx-auto rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {/* Upload Button */}
      {file && (
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
                Uploading...
              </>
            ) : (
              <>
                <span className="mr-2">📤</span>
                Upload Policy
              </>
            )}
          </Button>
          
          <Button
            onClick={removeFile}
            className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Processing your policy document...
          </p>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Upload Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ensure document is clear and readable</li>
          <li>• File size should not exceed 10MB</li>
          <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
          <li>• Document will be processed using AI for analysis</li>
          <li>• All data is encrypted and secure</li>
        </ul>
      </div>
    </div>
  );
};

export default PolicyUploader;