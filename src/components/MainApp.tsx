import React, { useState, useCallback, useEffect } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import LiveSession from './LiveSession'
import { Pricing } from '../pages/Pricing'
import { useOrganization } from '../auth/OrganizationProvider'
import { useSubscription } from '../hooks/useSubscription'
import { PageType, Tour } from '../types'

export const MainApp: React.FC = () => {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const { currentOrg, loading: orgLoading } = useOrganization()
  const { isActive, loading: subLoading } = useSubscription(currentOrg?.id || null)
  
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  // Determine active page from route
  const getActivePageFromPath = (pathname: string): PageType => {
    if (pathname.includes('/live-session')) return 'live-session'
    if (pathname.includes('/reports')) return 'reports'
    if (pathname.includes('/settings')) return 'settings'
    if (pathname.includes('/pricing')) return 'pricing'
    return 'dashboard'
  }

  const [activePage, setActivePage] = useState<PageType>(getActivePageFromPath(location.pathname))

  useEffect(() => {
    setActivePage(getActivePageFromPath(location.pathname))
  }, [location.pathname])

  const handlePageChange = (page: PageType) => {
    setActivePage(page)
    switch (page) {
      case 'dashboard':
        navigate('/dashboard')
        break
      case 'reports':
        navigate('/reports')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'pricing':
        navigate('/pricing')
        break
      default:
        navigate('/dashboard')
    }
  }

  const handleStartSession = useCallback((tour: Tour) => {
    setSelectedTour(tour)
    navigate(`/live-session/${tour.id}`)
  }, [navigate])

  const handleEndSession = useCallback(() => {
    setSelectedTour(null)
    navigate('/dashboard')
  }, [navigate])

  // Show loading while checking organization and subscription
  if (orgLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-metro-blue"></div>
      </div>
    )
  }

  // Show subscription required message for non-active subscriptions on protected features
  const requiresSubscription = activePage === 'live-session' || activePage === 'reports'
  if (requiresSubscription && !isActive) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          activePage={activePage} 
          onPageChange={handlePageChange}
        />
        <main className="flex-1 overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Subscription Required
            </h2>
            <p className="text-gray-600 mb-6">
              This feature requires an active subscription. Please upgrade your plan to continue.
            </p>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-metro-blue text-white px-6 py-2 rounded-md hover:bg-metro-light-blue"
            >
              View Pricing
            </button>
          </div>
        </main>
      </div>
    )
  }

  const renderMainContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onStartSession={handleStartSession} />
      case 'live-session':
        // If we have a siteId in params, find the corresponding tour
        if (params.siteId && !selectedTour) {
          // This would typically fetch the site/tour data from your API
          // For now, we'll create a placeholder
          const tour: Tour = {
            id: params.siteId,
            name: 'Site Session',
            location: 'Unknown',
            type: 'station' as const,
            status: 'active' as const,
            lastInspection: new Date().toISOString(),
            priority: 'medium' as const
          }
          setSelectedTour(tour)
          return <LiveSession tour={tour} onEndSession={handleEndSession} />
        }
        return selectedTour ? (
          <LiveSession 
            tour={selectedTour} 
            onEndSession={handleEndSession}
          />
        ) : <div className="p-8 text-center">No session selected</div>
      case 'reports':
        return <div className="p-8 text-center">Reportes - En desarrollo</div>
      case 'settings':
        return <div className="p-8 text-center">Configuración - En desarrollo</div>
      case 'pricing':
        return <Pricing />
      default:
        return <Dashboard onStartSession={handleStartSession} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activePage={activePage} 
        onPageChange={handlePageChange}
      />
      <main className="flex-1 overflow-hidden">
        {renderMainContent()}
      </main>
    </div>
  )
}