import { useState, useEffect } from 'react'
import Welcome from './pages/Welcome'
import DatabaseSetup from './pages/DatabaseSetup'
import Dashboard from './pages/Dashboard' // You'll need to create this
import { checkDatabaseStatus } from './api/apiClient'
import { databaseConfigService } from './services/databaseConfigService'
import './App.css'

function App() {
  // State to track database configuration status
  const [isDatabaseConfigured, setIsDatabaseConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simple state-based routing (in a real app, you'd use react-router or similar)
  const [currentPage, setCurrentPage] = useState('welcome');

  // Check database configuration status on startup
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        // First check local storage
        const isLocallyConfigured = databaseConfigService.isDatabaseConfigured();
        
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
        }
      } catch (error) {
        console.error('Failed to check database status:', error);
        setIsDatabaseConfigured(false);
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

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      {!isDatabaseConfigured && currentPage === 'welcome' && 
        <Welcome onGetStarted={() => navigateTo('database-setup')} />}
      
      {!isDatabaseConfigured && currentPage === 'database-setup' && 
        <DatabaseSetup onSetupComplete={handleSetupComplete} />}
      
      {isDatabaseConfigured && <Dashboard />}
    </div>
  )
}

export default App