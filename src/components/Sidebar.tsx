import React from 'react'
import {
  LayoutDashboard,
  Video,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LogOut,
  User,
  Building
} from 'lucide-react'
import { PageType } from '../types'
import { useAuth } from '../auth/AuthProvider'
import { useOrganization } from '../auth/OrganizationProvider'
import { useSubscription } from '../hooks/useSubscription'

interface SidebarProps {
  activePage: PageType
  onPageChange: (_page: PageType) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { user, signOut } = useAuth()
  const { currentOrg, organizations, switchOrganization } = useOrganization()
  const { isActive, openCustomerPortal } = useSubscription(currentOrg?.id || null)

  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Panel', icon: LayoutDashboard },
    { id: 'live-session' as PageType, label: 'Sesión en Vivo', icon: Video, requiresSubscription: true },
    { id: 'reports' as PageType, label: 'Reportes', icon: FileText, requiresSubscription: true },
    { id: 'settings' as PageType, label: 'Configuración', icon: Settings },
  ]

  return (
    <div className={`bg-metro-blue text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold">Tourify Remote</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-metro-light-blue"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActiveItem = activePage === item.id
          const isDisabled = item.requiresSubscription && !isActive

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onPageChange(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                isActiveItem ? 'bg-metro-light-blue border-r-4 border-metro-orange' : ''
              } ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-metro-light-blue'
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && (
                <span className="ml-3">{item.label}</span>
              )}
              {!isCollapsed && isDisabled && (
                <span className="ml-auto text-xs bg-metro-orange px-2 py-1 rounded">Pro</span>
              )}
            </button>
          )
        })}

        {/* Pricing/Billing */}
        <button
          onClick={() => isActive ? openCustomerPortal() : onPageChange('pricing')}
          className="w-full flex items-center px-4 py-3 text-left hover:bg-metro-light-blue transition-colors"
        >
          <CreditCard size={20} />
          {!isCollapsed && (
            <span className="ml-3">{isActive ? 'Billing' : 'Upgrade'}</span>
          )}
        </button>
      </nav>

      {!isCollapsed && (
        <div className="absolute bottom-16 left-4 right-4">
          {/* Organization Selector */}
          {organizations.length > 1 && (
            <div className="mb-4">
              <select
                value={currentOrg?.id || ''}
                onChange={(e) => switchOrganization(e.target.value)}
                className="w-full bg-metro-light-blue text-white rounded px-2 py-1 text-sm"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id} className="bg-metro-blue">
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Info */}
          <div className="border-t border-metro-light-blue pt-4">
            <div className="flex items-center mb-2">
              <User size={16} />
              <span className="ml-2 text-sm truncate">{user?.email}</span>
            </div>
            {currentOrg && (
              <div className="flex items-center mb-3">
                <Building size={16} />
                <span className="ml-2 text-sm truncate">{currentOrg.name}</span>
              </div>
            )}
            <button
              onClick={signOut}
              className="flex items-center text-sm hover:text-metro-orange transition-colors"
            >
              <LogOut size={16} />
              <span className="ml-2">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-300">
            Metro de Santiago
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
