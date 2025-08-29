const PolicyDetails = ({ policy }) => (
  <div>
    <h2>Policy Details</h2>
    <p>ID: {policy.id}</p>
    <p>Name: {policy.fileName}</p>
    <p>Analysis: {policy.analysisResult}</p>
  </div>
);

export default PolicyDetails;