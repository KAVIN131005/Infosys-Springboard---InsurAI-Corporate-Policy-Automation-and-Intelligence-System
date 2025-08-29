const PolicyCompare = ({ policies }) => (
  <div>
    <h2>Compare Policies</h2>
    {policies.map((policy, index) => (
      <div key={index}>
        <h3>Policy {index + 1}</h3>
        <p>{policy.analysisResult}</p>
      </div>
    ))}
  </div>
);

export default PolicyCompare;