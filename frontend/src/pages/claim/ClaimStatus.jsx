import { useFetch } from '../../hooks/useFetch';
import ClaimCard from '../../components/claim/ClaimCard';

const ClaimStatus = () => {
  const { data: claims, loading } = useFetch('/api/claims');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Claim Status</h1>
      {claims.map((claim) => (
        <ClaimCard key={claim.id} claim={claim} />
      ))}
    </div>
  );
};

export default ClaimStatus;