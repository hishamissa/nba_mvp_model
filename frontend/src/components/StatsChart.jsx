import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const StatsChart = ({ player }) => {
  if (!player) return null;

  // Normalize data for the chart (approximate max values for scaling)
  // PTS: 35, TRB: 15, AST: 12, PER: 35, WS: 15, BPM: 12
  const data = [
    { subject: 'PTS', A: player.PTS_per_g, fullMark: 35 },
    { subject: 'REB', A: player.TRB_per_g, fullMark: 15 },
    { subject: 'AST', A: player.AST_per_g, fullMark: 12 },
    { subject: 'PER', A: player.PER, fullMark: 35 },
    { subject: 'WS', A: player.WS, fullMark: 15 },
    { subject: 'BPM', A: player.BPM, fullMark: 12 },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          background: 'rgba(15, 23, 42, 0.9)', 
          padding: '10px', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          <p className="label" style={{ margin: 0, color: '#e2e8f0' }}>{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
          <Radar
            name={player.Player}
            dataKey="A"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.4}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;
