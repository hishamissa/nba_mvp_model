import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { ShimmerButton } from './ui/shimmer-button';

const OracleSimulator = () => {
  const [stats, setStats] = useState({
    ppg: 25,
    rpg: 8,
    apg: 6,
    teamWins: 45,
    per: 24
  });

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setStats(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Prepare data for radar chart
  // Normalize values for display (using approximate max values)
  const chartData = [
    { subject: 'PTS', value: Math.min(stats.ppg, 40), fullMark: 40 },
    { subject: 'RE', value: Math.min(stats.rpg, 15), fullMark: 15 },
    { subject: 'AS', value: Math.min(stats.apg, 12), fullMark: 12 },
    { subject: 'IS', value: Math.min(stats.per, 35), fullMark: 35 }, // Impact Score (PER)
    { subject: 'M', value: Math.min(stats.teamWins, 70), fullMark: 70 }, // Team Wins
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          background: 'rgba(15, 23, 42, 0.9)', 
          padding: '10px', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          <p className="label" style={{ margin: 0, color: '#e2e8f0' }}>
            {`${label}: ${payload[0].value.toFixed(1)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="oracle-section">
      <div className="glass-card" style={{ marginTop: '40px' }}>
        <div className="oracle-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="oracle-icon">🔮</span>
            <h2 className="oracle-title">The Oracle Simulator</h2>
          </div>
          <p className="oracle-subtitle">
            Enter hypothetical stats to see if you could win MVP.
          </p>
        </div>

        <div className="oracle-content">
          <div className="oracle-inputs">
            <div className="input-group">
              <label htmlFor="ppg">PPG</label>
              <input
                id="ppg"
                type="number"
                value={stats.ppg}
                onChange={(e) => handleInputChange('ppg', e.target.value)}
                min="0"
                max="50"
                step="0.1"
              />
            </div>

            <div className="input-group">
              <label htmlFor="rpg">RPG</label>
              <input
                id="rpg"
                type="number"
                value={stats.rpg}
                onChange={(e) => handleInputChange('rpg', e.target.value)}
                min="0"
                max="20"
                step="0.1"
              />
            </div>

            <div className="input-group">
              <label htmlFor="apg">APG</label>
              <input
                id="apg"
                type="number"
                value={stats.apg}
                onChange={(e) => handleInputChange('apg', e.target.value)}
                min="0"
                max="15"
                step="0.1"
              />
            </div>

            <div className="input-group">
              <label htmlFor="teamWins">Team Wins</label>
              <input
                id="teamWins"
                type="number"
                value={stats.teamWins}
                onChange={(e) => handleInputChange('teamWins', e.target.value)}
                min="0"
                max="82"
                step="1"
              />
            </div>

            <div className="input-group">
              <label htmlFor="per">PER (Est.)</label>
              <input
                id="per"
                type="number"
                value={stats.per}
                onChange={(e) => handleInputChange('per', e.target.value)}
                min="0"
                max="40"
                step="0.1"
              />
            </div>
          </div>

          <div className="oracle-chart">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 'auto']} 
                  tick={false} 
                  axisLine={false} 
                />
                <Radar
                  name="Hypothetical Player"
                  dataKey="value"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="#ec4899"
                  fillOpacity={0.4}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="oracle-button" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
            <ShimmerButton onClick={() => {
              // TODO: Implement MVP odds calculation
              alert('MVP Odds calculation coming soon!');
            }}>
              <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-base">
                Calculate MVP Odds
              </span>
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleSimulator;

