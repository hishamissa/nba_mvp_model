import React from 'react';
import { Marquee } from './ui/marquee';
import { cn } from '../lib/utils';

const PlayerCard = ({ player }) => {
  if (!player) return null;

  return (
    <figure className="pm-card glass-card">
      <div className="pm-header">
        <div className="pm-avatar">
          {player.Player?.charAt(0) || '?'}
        </div>
        <div className="pm-info">
          <figcaption className="pm-name">
            {player.Player || 'Unknown Player'}
          </figcaption>
          <p className="pm-team">
            {player.primary_team || 'N/A'}
          </p>
        </div>
      </div>
      <div className="pm-stats-grid">
        <div className="pm-stat">
          <div className="pm-stat-label">PTS</div>
          <div className="pm-stat-val">
            {player.PTS_per_g?.toFixed(1) || '0.0'}
          </div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-label">REB</div>
          <div className="pm-stat-val">
            {player.TRB_per_g?.toFixed(1) || '0.0'}
          </div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-label">AST</div>
          <div className="pm-stat-val">
            {player.AST_per_g?.toFixed(1) || '0.0'}
          </div>
        </div>
      </div>
      <div className="pm-footer">
        <div className="pm-stat-label">Award Share</div>
        <div className="pm-share-val">
          {((player.pred_award_share || 0) * 100).toFixed(1)}%
        </div>
      </div>
    </figure>
  );
};

const PlayerMarquee = ({ players, title = "Rising Stars" }) => {
  if (!players || players.length === 0) return null;

  // Duplicate players for seamless scroll
  const duplicatedPlayers = [...players, ...players, ...players];
  const firstRow = duplicatedPlayers.slice(0, Math.ceil(duplicatedPlayers.length / 2));
  const secondRow = duplicatedPlayers.slice(Math.ceil(duplicatedPlayers.length / 2));

  return (
    <div className="player-marquee-container">
      {title && (
        <h3 className="section-title text-center">
          {title}
        </h3>
      )}
      <Marquee pauseOnHover className="[--duration:30s]">
        {firstRow.map((player, index) => (
          <PlayerCard key={`${player.Player}-${index}-1`} player={player} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:30s]">
        {secondRow.map((player, index) => (
          <PlayerCard key={`${player.Player}-${index}-2`} player={player} />
        ))}
      </Marquee>
      <div className="marquee-fade-left"></div>
      <div className="marquee-fade-right"></div>
    </div>
  );
};

export default PlayerMarquee;

