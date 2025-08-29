const ClaimCard = ({ claim }) => (
  <div className="border p-4 rounded">
    <h3>Claim ID: {claim.id}</h3>
    <p>Status: {claim.status}</p>
    <p>Analysis: {claim.analysisResult}</p>
  </div>
);

export default ClaimCard;