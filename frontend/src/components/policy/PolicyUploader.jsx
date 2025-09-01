import { useState } from 'react';
import { uploadPolicy } from '../../api/policyService';
import Button from '../ui/Button';

const PolicyUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleUpload = async () => {
    if (!file) return setMessage('Please select a file');
    setUploading(true);
    try {
      await uploadPolicy(file);
      setMessage('Uploaded successfully');
      setFile(null);
    } catch (err) {
      setMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-md">
      <label className="block mb-2 text-sm font-medium">Choose policy file (PDF)</label>
      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
      <div className="mt-3 flex items-center space-x-2">
        <Button onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
        {file && <div className="text-sm text-gray-600">{file.name}</div>}
      </div>
      {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
    </div>
  );
};

export default PolicyUploader;