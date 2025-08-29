import { useFetch } from '../../hooks/useFetch';
import PolicyCard from '../../components/policy/PolicyCard';

const BrokerPolicies = () => {
  const { data: policies, loading } = useFetch('/api/broker/policies');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Policies</h1>
      {policies.map((policy) => (
        <PolicyCard key={policy.id} policy={policy} />
      ))}
    </div>
  );
};

export default BrokerPolicies;