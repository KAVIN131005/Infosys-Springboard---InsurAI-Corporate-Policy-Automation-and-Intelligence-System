
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Policy 1', risk: 400 },
  { name: 'Policy 2', risk: 300 },
  { name: 'Policy 3', risk: 200 },
  { name: 'Policy 4', risk: 278 },
  { name: 'Policy 5', risk: 189 },
];

const AnalyticsDashboard = () => (
  <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md mt-8">
    <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Analytics Dashboard</h1>
    <div className="flex justify-center">
      <BarChart width={600} height={300} data={data} className="bg-gray-50 rounded-lg p-4">
        <XAxis dataKey="name" stroke="#4B5563" />
        <YAxis stroke="#4B5563" />
        <Tooltip wrapperClassName="bg-white shadow-md rounded p-2" />
        <Legend />
        <Bar dataKey="risk" fill="#3B82F6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </div>
  </div>
);

export default AnalyticsDashboard;