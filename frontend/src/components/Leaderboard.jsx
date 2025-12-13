import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../services/api';
import PlayerCard from './PlayerCard';
import SeasonSelector from './SeasonSelector';
import { NumberTicker } from './ui/number-ticker';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [year, setYear] = useState(2026);
  const [showAll, setShowAll] = useState(false);
  
  const DISPLAY_LIMIT = 10;
  const displayedData = showAll ? data : data.slice(0, DISPLAY_LIMIT);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchLeaderboard(year);
        setData(result);
      } catch (err) {
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [year]);

  return (
    <>
      <div className="controls-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <SeasonSelector currentYear={year} onYearChange={setYear} />
      </div>

      {loading ? (
        <div className="loading">Loading MVP Predictions...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="glass-card">
          <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Award Share</th>
              <th>PTS</th>
              <th>REB</th>
              <th>AST</th>
              <th>PER</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((player, index) => (
              <tr key={index} onClick={() => setSelectedPlayer(player)}>
                <td className="rank-cell">#{index + 1}</td>
                <td className="player-cell">
                  <span className="player-name">{player.Player}</span>
                  <span className="player-team">{player.primary_team}</span>
                </td>
                <td className="share-cell">
                  <NumberTicker 
                    value={player.pred_award_share * 100} 
                    delay={index * 100}
                    className="text-inherit"
                  />%
                </td>
                <td className="stat-cell">
                  <NumberTicker 
                    value={player.PTS_per_g || 0} 
                    delay={index * 100 + 50}
                    className="text-inherit"
                  />
                </td>
                <td className="stat-cell">
                  <NumberTicker 
                    value={player.TRB_per_g || 0} 
                    delay={index * 100 + 75}
                    className="text-inherit"
                  />
                </td>
                <td className="stat-cell">
                  <NumberTicker 
                    value={player.AST_per_g || 0} 
                    delay={index * 100 + 100}
                    className="text-inherit"
                  />
                </td>
                <td className="stat-cell">
                  <NumberTicker 
                    value={player.PER || 0} 
                    delay={index * 100 + 125}
                    className="text-inherit"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > DISPLAY_LIMIT && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setShowAll(!showAll)}
              className="show-more-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '10px 24px',
                color: 'var(--text-color)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              {showAll ? `Show Less (Top ${DISPLAY_LIMIT})` : `Show All (${data.length} players)`}
            </button>
          </div>
        )}
      </div>
    )}
      
      <PlayerCard 
        player={selectedPlayer} 
        onClose={() => setSelectedPlayer(null)} 
      />
    </>
  );
};

export default Leaderboard;
