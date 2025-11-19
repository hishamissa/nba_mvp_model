import React, { useState, useEffect } from 'react';
import Leaderboard from './components/Leaderboard';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">NBA MVP Forecaster</div>
        <nav>
          <button className="nav-link active">Leaderboard</button>
          <button className="nav-link">About Model</button>
        </nav>
      </header>
      
      <main className="main-content">
        <div className="hero-section">
          <h1>2025-26 MVP Prediction</h1>
          <p>AI-Powered Forecast based on Advanced Stats & Historical Trends</p>
        </div>
        
        <Leaderboard />
      </main>
      
      <footer className="app-footer">
        <p>NBA MVP DataSculptor Model &copy; 2025</p>
      </footer>
    </div>
  );
}

export default App;
