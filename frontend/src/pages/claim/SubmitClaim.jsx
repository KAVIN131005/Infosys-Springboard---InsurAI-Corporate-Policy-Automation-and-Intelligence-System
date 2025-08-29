import ClaimUploader from '../../components/claim/ClaimUploader';

const SubmitClaim = () => {
  // Assume policyId from props or state
  const policyId = 1;

  return (
    <div>
      <h1>Submit Claim</h1>
      <ClaimUploader policyId={policyId} />
    </div>
  );
};

export default SubmitClaim;