import { useState } from 'react'
import Welcome from './pages/Welcome'
import DatabaseSetup from './pages/DatabaseSetup'
import './App.css'

function App() {
  // Simple state-based routing (in a real app, you'd use react-router or similar)
  const [currentPage, setCurrentPage] = useState('welcome')

  // Function to navigate between pages
  const navigateTo = (page: string) => {
    setCurrentPage(page)
  }

  return (
    <div className="app">
      {currentPage === 'welcome' && <Welcome onGetStarted={() => navigateTo('database-setup')} />}
      {currentPage === 'database-setup' && <DatabaseSetup />}
    </div>
  )
}

export default App