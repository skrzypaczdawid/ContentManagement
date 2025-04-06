// apps/web/src/pages/Dashboard.tsx
import React from 'react';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="./logo-small.svg" alt="logo" width="60px" />
          <h1 className="app-title">InvenTrack</h1>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-card">
          <h2>Welcome to InvenTrack Dashboard</h2>
          <p>Your database is configured and ready to use.</p>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Assets</h3>
              <p className="stat-value">0</p>
            </div>
            <div className="stat-card">
              <h3>Users</h3>
              <p className="stat-value">1</p>
            </div>
            <div className="stat-card">
              <h3>Departments</h3>
              <p className="stat-value">6</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Witold Mikołajczak & Dawid Skrzypacz. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;