import React from 'react';
import { RainbowButton } from './ui/rainbow-button';

const AboutModel = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="player-card glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="card-header">
          <div className="oracle-icon" style={{ fontSize: '2.5rem', marginRight: '20px' }}>🤖</div>
          <div className="player-info">
            <h2>About the Model</h2>
            <p className="team-badge">Ensemble Learning Architecture</p>
          </div>
        </div>

        <div className="about-content" style={{ padding: '0 10px' }}>
          <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
            The NBA MVP DataSculptor uses an advanced <strong>Ensemble Machine Learning</strong> approach to forecast the MVP outcome.
            By combining multiple algorithms, we achieve higher accuracy and robustness than any single model could provide.
          </p>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '30px' }}>
            <div className="stat-item">
              <div className="stat-label">Primary Algorithm</div>
              <div className="stat-value" style={{ fontSize: '1rem' }}>Random Forest</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Secondary Algorithm</div>
              <div className="stat-value" style={{ fontSize: '1rem' }}>XGBoost</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Baseline</div>
              <div className="stat-value" style={{ fontSize: '1rem' }}>Ridge Regression</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '15px' }}>Key Predictive Features</h3>
          <ul style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '10px', 
            listStyle: 'none', 
            padding: 0,
            marginBottom: '30px'
          }}>
            {[
              "Player Efficiency Rating (PER)", "Win Shares (WS)", 
              "Box Plus/Minus (BPM)", "Value Over Replacement (VORP)",
              "Team Win Percentage", "Usage Percentage (USG%)",
              "True Shooting % (TS%)", "Points Per Game (PTS)"
            ].map((feature, i) => (
              <li key={i} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '10px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-secondary)',
                fontSize: '0.9rem'
              }}>
                ✅ {feature}
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
             <RainbowButton onClick={onClose}>
               Back to Leaderboard
             </RainbowButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModel;
