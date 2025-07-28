import React from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TrendChart({ data, showGoal = false }) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>Not enough data to display trends yet. Keep logging!</p>
      </Card>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line 
            name="Cigarettes Smoked"
            type="monotone" 
            dataKey="count" 
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          {showGoal && data.some(d => d.goal > 0) && (
            <Line 
              name="Daily Goal"
              type="monotone" 
              dataKey="goal" 
              stroke="#8b5cf6" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}