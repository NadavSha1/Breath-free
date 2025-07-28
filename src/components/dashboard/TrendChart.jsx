
import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';

const TrendChart = memo(function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>Not enough data to display trends yet. Keep logging!</p>
      </div>
    );
  }

  // Custom tooltip component for better formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            fontSize={12}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          >
            <Label value="Day" offset={0} position="insideBottom" />
          </XAxis>
          <YAxis 
            stroke="#6b7280" 
            fontSize={12} 
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          >
            <Label 
              value="Cigarettes" 
              angle={-90} 
              position="insideLeft" 
              style={{ textAnchor: 'middle' }} 
            />
          </YAxis>
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="line"
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line 
            name="Smoked"
            type="monotone" 
            dataKey="count" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
            connectNulls={false}
          />
          <Line 
            name="Goal"
            type="monotone" 
            dataKey="goal" 
            stroke="#8884d8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: '#8884d8', strokeWidth: 2, stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default TrendChart;
