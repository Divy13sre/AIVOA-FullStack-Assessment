import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Charts({ data }) {
  // If data is empty, return early
  if (!data || data.length === 0) return <div>No data to display</div>;

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3>Complaint Severity Distribution</h3>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          {/* Using 'complaint_category' as the label on X-axis */}
          <XAxis dataKey="complaint_category" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* Using 'severity' or count - here we count occurrences */}
          <Bar dataKey="severity" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}