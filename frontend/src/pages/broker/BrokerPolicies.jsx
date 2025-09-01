import { useEffect, useState } from 'react';
import PolicyCard from '../../components/policy/PolicyCard';
import { getPolicies } from '../../api/policyService';
import Spinner from '../../components/ui/Spinner';

const BrokerPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPolicies().then((data) => setPolicies(data)).catch(() => setPolicies([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6"><Spinner /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Policies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </div>
    </div>
  );
};

export default BrokerPolicies;