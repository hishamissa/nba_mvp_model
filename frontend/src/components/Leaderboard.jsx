import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../services/api';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Hardcoded to 2026 for now as per requirements
        const result = await fetchLeaderboard(2026);
        setData(result);
      } catch (err) {
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="loading">Loading MVP Predictions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
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
          {data.map((player, index) => (
            <tr key={index}>
              <td className="rank-cell">#{index + 1}</td>
              <td className="player-cell">
                <span className="player-name">{player.Player}</span>
                <span className="player-team">{player.primary_team}</span>
              </td>
              <td className="share-cell">
                {(player.pred_award_share * 100).toFixed(1)}%
              </td>
              <td className="stat-cell">{player.PTS_per_g?.toFixed(1)}</td>
              <td className="stat-cell">{player.TRB_per_g?.toFixed(1)}</td>
              <td className="stat-cell">{player.AST_per_g?.toFixed(1)}</td>
              <td className="stat-cell">{player.PER?.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
