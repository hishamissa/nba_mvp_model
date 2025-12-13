import React, { useEffect, useState } from 'react';
import { BentoCard, BentoGrid } from './ui/bento-grid';
import { fetchLeaderboard } from '../services/api';
import { NumberTicker } from './ui/number-ticker';
import { cn } from '../lib/utils';

const StatsDashboard = ({ year = 2026 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchLeaderboard(year);
        setData(result);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [year]);

  if (loading || !data.length) {
    return null;
  }

  const topPlayer = data[0];
  const secondPlayer = data[1];
  const thirdPlayer = data[2];
  
  // Calculate tightest race (difference between top 2)
  const tightestRace = topPlayer && secondPlayer
    ? ((topPlayer.pred_award_share - secondPlayer.pred_award_share) * 100).toFixed(1)
    : '0.0';

  // Find dark horse (player with high stats but lower ranking)
  const darkHorse = data.find(p => 
    p.pred_award_share < 0.15 && 
    (p.PTS_per_g > 25 || p.PER > 25)
  ) || data[Math.floor(data.length / 2)];

  // Model confidence (based on top player's share, max 100%)
  const modelConfidence = topPlayer
    ? Math.min((topPlayer.pred_award_share * 100) / 0.8, 99).toFixed(0)
    : '0';

  const features = [
    {
      title: 'Current Leader',
      description: topPlayer ? `${topPlayer.Player} leads with ${(topPlayer.pred_award_share * 100).toFixed(1)}% share` : 'Loading...',
      header: topPlayer ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: 'var(--space-md)' }}>
            <NumberTicker value={topPlayer.pred_award_share * 100} />%
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>{topPlayer.Player}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{topPlayer.primary_team}</div>
        </div>
      ) : null,
      icon: null,
    },
    {
      title: 'Tightest Race',
      description: `Only ${tightestRace}% separates the top contenders`,
      header: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', height: '100%' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>{tightestRace}%</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Gap between #1 and #2</div>
          </div>
          {topPlayer && secondPlayer && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>{topPlayer.Player}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>vs</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{secondPlayer.Player}</div>
            </div>
          )}
        </div>
      ),
      icon: null,
    },
    {
      title: 'Dark Horse',
      description: darkHorse ? `${darkHorse.Player} could surprise with strong underlying stats` : 'No dark horse found',
      header: darkHorse ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', height: '100%' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>{darkHorse.Player}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{darkHorse.primary_team}</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>PTS</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{darkHorse.PTS_per_g?.toFixed(1)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>PER</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{darkHorse.PER?.toFixed(1)}</div>
            </div>
          </div>
        </div>
      ) : null,
      icon: null,
    },
    {
      title: 'Model Confidence',
      description: `Our ensemble model is ${modelConfidence}% confident in the top prediction`,
      header: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-success)', marginBottom: 'var(--space-md)' }}>
            <NumberTicker value={parseFloat(modelConfidence)} />%
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Confidence Score</div>
        </div>
      ),
      icon: null,
    },
  ];

  return (
    <section className="stats-dashboard" style={{ marginTop: '30px', marginBottom: '30px' }}>
      <h2 className="section-title" style={{ marginBottom: '20px', textAlign: 'center' }}>
        Quick Stats Dashboard
      </h2>
      <BentoGrid>
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
    </section>
  );
};

export default StatsDashboard;

