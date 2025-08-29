import { useFetch } from '../../hooks/useFetch';
import PolicyCompare from '../../components/policy/PolicyCompare';

const PolicyComparePage = () => {
  const { data: policies, loading } = useFetch('/api/policies');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <PolicyCompare policies={policies} />
    </div>
  );
};

export default PolicyComparePage;