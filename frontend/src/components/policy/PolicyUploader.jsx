import { useState } from 'react';
import { uploadPolicy } from '../../api/policyService';

const PolicyUploader = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (file) {
      await uploadPolicy(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default PolicyUploader;