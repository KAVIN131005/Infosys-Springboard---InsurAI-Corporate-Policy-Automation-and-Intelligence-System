import { useState } from 'react';
import { submitClaim } from '../../api/claimService';
import Button from '../ui/Button';

const ClaimUploader = ({ policyId }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    if (!file) return setMessage('Select a file');
    setLoading(true);
    try {
      await submitClaim(file, policyId);
      setMessage('Claim submitted');
      setFile(null);
    } catch (err) {
      setMessage(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-md">
      <label className="block mb-2 text-sm font-medium">Upload claim evidence</label>
      <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
      <div className="mt-3 flex items-center space-x-2">
        <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit claim'}</Button>
        {file && <div className="text-sm text-gray-600">{file.name}</div>}
      </div>
      {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
    </div>
  );
};

export default ClaimUploader;