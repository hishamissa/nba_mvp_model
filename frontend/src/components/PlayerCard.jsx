import StatsChart from './StatsChart';
import { NumberTicker } from './ui/number-ticker';

const PlayerCard = ({ player, onClose }) => {
  if (!player) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="player-card glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="card-header">
          <div className="player-avatar-placeholder">
            {player.Player.charAt(0)}
          </div>
          <div className="player-info">
            <h2>{player.Player}</h2>
            <p className="team-badge">{player.primary_team}</p>
          </div>
          <div className="award-share-badge">
            <span className="label">MVP Share</span>
            <span className="value">
              <NumberTicker value={player.pred_award_share * 100} />%
            </span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">PTS</span>
            <span className="stat-value">
              <NumberTicker value={player.PTS_per_g || 0} delay={100} />
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">REB</span>
            <span className="stat-value">
              <NumberTicker value={player.TRB_per_g || 0} delay={150} />
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">AST</span>
            <span className="stat-value">
              <NumberTicker value={player.AST_per_g || 0} delay={200} />
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">PER</span>
            <span className="stat-value">
              <NumberTicker value={player.PER || 0} delay={250} />
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">WS</span>
            <span className="stat-value">
              <NumberTicker value={player.WS || 0} delay={300} />
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">BPM</span>
            <span className="stat-value">
              <NumberTicker value={player.BPM || 0} delay={350} />
            </span>
          </div>
        </div>

        <div className="chart-section">
          <h3>Player Impact Radar</h3>
          <StatsChart player={player} />
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
