import { useEffect, useState } from 'react';
import ClaimUploader from '../../components/claim/ClaimUploader';
import { getPolicies } from '../../api/policyService';
import Spinner from '../../components/ui/Spinner';

const SubmitClaim = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policyId, setPolicyId] = useState(null);

  useEffect(() => {
    getPolicies().then((data) => {
      setPolicies(data);
      if (data && data.length) setPolicyId(data[0].id);
    }).catch(() => setPolicies([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6"><Spinner /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Submit Claim</h1>
      <div className="max-w-md">
        <label className="text-sm">Select Policy</label>
        <select className="border p-2 rounded w-full mb-4" value={policyId || ''} onChange={(e) => setPolicyId(e.target.value)}>
          {policies.map(p => <option key={p.id} value={p.id}>{p.fileName || p.name}</option>)}
        </select>
        {policyId && <ClaimUploader policyId={policyId} />}
      </div>
    </div>
  );
};

export default SubmitClaim;