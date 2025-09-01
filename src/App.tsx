import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import LiveSession from './components/LiveSession'
import { PageType, Tour } from './types'

function App() {
  const [activePage, setActivePage] = useState<PageType>('dashboard')
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  const handleStartSession = useCallback((tour: Tour) => {
    setSelectedTour(tour)
    setActivePage('live-session')
  }, [])

  const handleEndSession = useCallback(() => {
    setSelectedTour(null)
    setActivePage('dashboard')
  }, [])

  const renderMainContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onStartSession={handleStartSession} />
      case 'live-session':
        return selectedTour ? (
          <LiveSession 
            tour={selectedTour} 
            onEndSession={handleEndSession}
          />
        ) : null
      case 'reports':
        return <div className="p-8 text-center">Reportes - En desarrollo</div>
      case 'settings':
        return <div className="p-8 text-center">Configuración - En desarrollo</div>
      default:
        return <Dashboard onStartSession={handleStartSession} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activePage={activePage} 
        onPageChange={setActivePage}
      />
      <main className="flex-1 overflow-hidden">
        {renderMainContent()}
      </main>
    </div>
  )
}

export default App