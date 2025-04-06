// apps/web/src/pages/Dashboard.tsx
import React from 'react';
import '../styles/Dashboard.css';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="./logo-small.svg" alt="logo" width="60px" />
          <h1 className="app-title">InvenTrack</h1>
        </div>
        <div className="user-menu">
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-sidebar">
          <nav className="dashboard-nav">
            <ul>
              <li className="nav-item active">
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">💻</span>
                <span>Assets</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">👥</span>
                <span>Users</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">🏢</span>
                <span>Departments</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">📋</span>
                <span>Assignments</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">📝</span>
                <span>Reports</span>
              </li>
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <span className="nav-icon">⚙️</span>
                  <span>Settings</span>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-welcome">
            <h2>Welcome, {user?.firstName}!</h2>
            <p>Here's an overview of your CMDB system</p>
          </div>

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

          <div className="dashboard-cards">
            <div className="info-card">
              <h3>My Assigned Assets</h3>
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <p>No assets assigned yet</p>
              </div>
            </div>

            <div className="info-card">
              <h3>Recent Activities</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-icon">✅</span>
                  <div className="activity-content">
                    <p>You logged into the system</p>
                    <span className="activity-time">Just now</span>
                  </div>
                </div>
              </div>
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