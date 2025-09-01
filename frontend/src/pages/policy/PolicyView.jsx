import { useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import PolicyDetails from '../../components/policy/PolicyDetails';

const PolicyView = () => {
  const { id } = useParams();
  const { data: policy, loading } = useFetch(`/policies/${id}`);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <PolicyDetails policy={policy} />
    </div>
  );
};

export default PolicyView;