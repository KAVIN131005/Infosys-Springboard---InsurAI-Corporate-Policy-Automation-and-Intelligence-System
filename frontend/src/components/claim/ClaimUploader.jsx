import { useState } from 'react';
import { submitClaim } from '../../api/claimService';

const ClaimUploader = ({ policyId }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    if (file) {
      await submitClaim(file, policyId);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleSubmit}>Submit Claim</button>
    </div>
  );
};

export default ClaimUploader;