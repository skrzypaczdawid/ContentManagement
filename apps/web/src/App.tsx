import { useState, useEffect } from 'react'
import Welcome from './pages/Welcome'
import DatabaseSetup from './pages/DatabaseSetup'
import Dashboard from './pages/Dashboard'
import { checkDatabaseStatus } from './api/apiClient'
import { databaseConfigService } from './services/databaseConfigService'
import './App.css'

function App() {
  // State to track database configuration status
  const [isDatabaseConfigured, setIsDatabaseConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simple state-based routing (in a real app, you'd use react-router or similar)
  const [currentPage, setCurrentPage] = useState('loading'); // Start with loading state

  // Check database configuration status on startup
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        // Check local storage first for immediate decision
        const isLocallyConfigured = databaseConfigService.isDatabaseConfigured();
        
        // Pre-set the state based on local info to reduce flashing
        if (isLocallyConfigured) {
          setIsDatabaseConfigured(true);
          setCurrentPage('dashboard');
        }
        
        // Then verify with the API
        const { isConfigured } = await checkDatabaseStatus();
        
        setIsDatabaseConfigured(isConfigured);
        
        // If database is configured, go to dashboard
        if (isConfigured) {
          setCurrentPage('dashboard');
        } else if (isLocallyConfigured) {
          // If locally configured but API says not configured, clear local config
          databaseConfigService.clearConfig();
          setCurrentPage('welcome');
        } else {
          // Not configured anywhere
          setCurrentPage('welcome');
        }
      } catch (error) {
        console.error('Failed to check database status:', error);
        setIsDatabaseConfigured(false);
        setCurrentPage('welcome');
      } finally {
        setIsLoading(false);
      }
    };

    checkDbStatus();
  }, []);

  // Function to navigate between pages
  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  // When database setup is complete
  const handleSetupComplete = () => {
    setIsDatabaseConfigured(true);
    setCurrentPage('dashboard');
  };

  // Show loading spinner during initial check
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {!isDatabaseConfigured && currentPage === 'welcome' && 
        <Welcome onGetStarted={() => navigateTo('database-setup')} />}
      
      {!isDatabaseConfigured && currentPage === 'database-setup' && 
        <DatabaseSetup onSetupComplete={handleSetupComplete} />}
      
      {(isDatabaseConfigured || currentPage === 'dashboard') && <Dashboard />}
    </div>
  )
}

export default App