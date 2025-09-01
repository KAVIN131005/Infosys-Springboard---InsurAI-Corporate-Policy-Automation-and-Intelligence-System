const PolicyCard = ({ policy }) => (
  <div className="bg-white border rounded p-4 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-lg">{policy.fileName || policy.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{policy.summary || policy.analysisResult || 'No summary yet'}</p>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-blue-600">{policy.status || 'Unknown'}</div>
      </div>
    </div>
  </div>
);

export default PolicyCard;