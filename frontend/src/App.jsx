import React, { useState, useEffect } from 'react';
import Leaderboard from './components/Leaderboard';
import OracleSimulator from './components/OracleSimulator';
import PlayerMarquee from './components/PlayerMarquee';
import HowItWorks from './components/HowItWorks';
import StatsDashboard from './components/StatsDashboard';
import AboutModel from './components/AboutModel';
import { Marquee } from './components/ui/marquee';
import { RainbowButton } from './components/ui/rainbow-button';
import { ShimmerButton } from './components/ui/shimmer-button';
import { Meteors } from './components/ui/meteors';
import { fetchLeaderboard } from './services/api';

function App() {
  const [marqueePlayers, setMarqueePlayers] = useState([]);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    // Load top players for marquee
    const loadMarqueeData = async () => {
      try {
        const result = await fetchLeaderboard(2026);
        // Get top 10 players for marquee
        setMarqueePlayers(result.slice(0, 10));
      } catch (err) {
        console.error('Error loading marquee data:', err);
      }
    };
    loadMarqueeData();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo cursor-pointer" onClick={() => setShowAbout(false)}>NBA MVP Forecaster</div>
        <nav>
          <button 
            className={`nav-link ${!showAbout ? 'active' : ''}`}
            onClick={() => setShowAbout(false)}
          >
            Leaderboard
          </button>
          <button 
            className={`nav-link ${showAbout ? 'active' : ''}`}
            onClick={() => setShowAbout(true)}
          >
            About Model
          </button>
        </nav>
      </header>
      
      <main className="main-content">
        <div className="hero-section">
          <Meteors number={30} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1>2025-26 MVP Prediction</h1>
            <p>AI-Powered Forecast based on Advanced Stats & Historical Trends</p>
            <div className="hero-cta" style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <RainbowButton onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })}>
                Compare Players
              </RainbowButton>
            </div>
          </div>
        </div>
        
        {marqueePlayers.length > 0 && (
          <div className="marquee-section" style={{ marginBottom: '30px' }}>
            <PlayerMarquee players={marqueePlayers} title="Top MVP Contenders" />
          </div>
        )}
        
        <StatsDashboard year={2026} />
        
        <div id="leaderboard">
          <Leaderboard />
        </div>
        
        <HowItWorks />
        
        <section id="oracle" className="oracle-section">
          <OracleSimulator />
        </section>
      </main>
      
      {showAbout && <AboutModel onClose={() => setShowAbout(false)} />}
      
      <footer className="app-footer">
        <div className="footer-marquee">
          <Marquee pauseOnHover className="[--duration:20s]">
            <span className="footer-text">Powered by Random Forest</span>
            <span className="footer-separator">•</span>
            <span className="footer-text">XGBoost</span>
            <span className="footer-separator">•</span>
            <span className="footer-text">Ridge Regression</span>
            <span className="footer-separator">•</span>
            <span className="footer-text">Advanced Analytics</span>
            <span className="footer-separator">•</span>
          </Marquee>
        </div>
        <p>NBA MVP DataSculptor Model &copy; 2025</p>
      </footer>
    </div>
  );
}

export default App;
