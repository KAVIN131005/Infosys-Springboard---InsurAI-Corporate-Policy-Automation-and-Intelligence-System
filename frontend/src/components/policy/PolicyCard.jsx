const PolicyCard = ({ policy }) => (
  <div className="border p-4 rounded">
    <h3>{policy.fileName}</h3>
    <p>Analysis: {policy.analysisResult}</p>
  </div>
);

export default PolicyCard;