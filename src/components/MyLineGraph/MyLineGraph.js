import React from 'react';

// Recharts
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  ResponsiveContainer,
} from 'recharts';

function MyLineGraph(props) {
  return (
    <ResponsiveContainer width="90%" height={350}>
      <LineChart
        data={props.data}
        margin={{ top: 5, right: 20, bottom: 5, left: 25 }}
      >
        <Line type="monotone" dataKey="annualTotal" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="year">
          <Label value="Year" offset={-3} position="insideBottom" />
        </XAxis>
        <YAxis
          tickFormatter={(tick) => {
            return '$' + tick.toLocaleString();
          }}
        />
        <Tooltip
          formatter={(value) => [
            '$' +
              parseFloat(value).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            'Annual Total',
          ]}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MyLineGraph;
