import React from 'react'
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { PageType } from '../types'

interface SidebarProps {
  activePage: PageType
  onPageChange: (_page: PageType) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Panel', icon: LayoutDashboard },
    { id: 'live-session' as PageType, label: 'Sesión en Vivo', icon: Video },
    { id: 'reports' as PageType, label: 'Reportes', icon: FileText },
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
          const isActive = activePage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-metro-light-blue transition-colors ${
                isActive ? 'bg-metro-light-blue border-r-4 border-metro-orange' : ''
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && (
                <span className="ml-3">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

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