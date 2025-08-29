import { useFetch } from '../../hooks/useFetch';
import PolicyCard from '../../components/policy/PolicyCard';

const UserDashboard = () => {
  const { data: policies, loading } = useFetch('/api/policies');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Dashboard</h1>
      {policies.map((policy) => (
        <PolicyCard key={policy.id} policy={policy} />
      ))}
    </div>
  );
};

export default UserDashboard;