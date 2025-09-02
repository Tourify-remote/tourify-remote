import React, { useState, useMemo, useEffect } from 'react'
import { Plus, MapPin, Play, Filter } from 'lucide-react'
import { Tour, Ticket } from '../types'
import { useOrganization } from '../auth/OrganizationProvider'
import { supabase } from '../lib/supabase'

interface DashboardProps {
  onStartSession: (_tour: Tour) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onStartSession }) => {
  const { currentOrg } = useOrganization()
  const [selectedSite, setSelectedSite] = useState<Tour | null>(null)
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all')
  const [locationFilter] = useState<string>('all')
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentOrg) {
      loadSites()
    }
  }, [currentOrg])

  const loadSites = async () => {
    if (!currentOrg) return

    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('org_id', currentOrg.id)

      if (error) throw error

      // Convert sites to tours format
      const convertedTours: Tour[] = data.map(site => ({
        id: site.id,
        name: site.name,
        location: site.location || 'Unknown',
        type: (site.site_type as any) || 'station',
        coordinates: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }, // Random for demo
        equipment: ['Sistema principal', 'Equipos auxiliares'], // Mock data
        status: (site.status as any) || 'active',
        lastInspection: site.created_at,
        priority: 'medium' as const
      }))

      setTours(convertedTours)
    } catch (error) {
      console.error('Error loading sites:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for tickets
  const tickets: Ticket[] = [
    {
      id: 'T001',
      title: 'Escalera mecánica fuera de servicio',
      description: 'La escalera mecánica principal presenta ruidos anómalos',
      status: 'open',
      priority: 'high',
      location: 'Estación Baquedano',
      assignee: 'Juan Pérez',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'T002',
      title: 'Revisión sistema hidráulico',
      description: 'Mantenimiento preventivo del sistema hidráulico',
      status: 'in-progress',
      priority: 'medium',
      location: 'Taller Neptuno',
      assignee: 'María González',
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-16')
    }
  ]

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const statusMatch = ticketFilter === 'all' || ticket.status === ticketFilter
      const locationMatch = locationFilter === 'all' || ticket.location === locationFilter
      return statusMatch && locationMatch
    })
  }, [tickets, ticketFilter, locationFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-metro-blue"></div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Control - Tourify Remote
        </h1>
        <p className="text-gray-600">
          Supervisión remota de sitios de trabajo - Metro de Santiago
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Site Map Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Mapa de Sitios
            </h2>
            <button className="flex items-center px-3 py-2 bg-metro-blue text-white rounded-md hover:bg-metro-light-blue">
              <Plus size={16} className="mr-1" />
              Añadir Ubicación
            </button>
          </div>

          {/* Map Container */}
          <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
            {/* Mock Metro Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="absolute top-4 left-4 text-sm text-gray-600">
                Red Metro de Santiago
              </div>

              {/* Site Markers */}
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${tour.coordinates?.x || 50}%`,
                    top: `${tour.coordinates?.y || 50}%`
                  }}
                  onClick={() => setSelectedSite(tour)}
                >
                  <div className={`w-4 h-4 rounded-full animate-pulse ${
                    tour.status === 'active' ? 'bg-green-500' :
                    tour.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <div className={`w-8 h-8 rounded-full absolute -top-2 -left-2 ${
                      tour.status === 'active' ? 'bg-green-200' :
                      tour.status === 'maintenance' ? 'bg-yellow-200' : 'bg-red-200'
                    } animate-ping`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Site Details Popover */}
            {selectedSite && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{selectedSite.name}</h3>
                  <button
                    onClick={() => setSelectedSite(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Tipo: {selectedSite.type === 'station' ? 'Estación' :
                         selectedSite.type === 'workshop' ? 'Taller' : 'Túnel'}
                </p>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Equipos:</p>
                  <ul className="text-xs text-gray-600">
                    {selectedSite.equipment?.map((eq, idx) => (
                      <li key={idx}>• {eq}</li>
                    )) || <li>No equipment listed</li>}
                  </ul>
                </div>
                <button
                  onClick={() => onStartSession(selectedSite)}
                  className="w-full flex items-center justify-center px-3 py-2 bg-metro-orange text-white rounded-md hover:bg-orange-600"
                >
                  <Play size={16} className="mr-1" />
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Support Tickets Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Tickets de Soporte
            </h2>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">Todos</option>
                <option value="open">Abiertos</option>
                <option value="in-progress">En Progreso</option>
                <option value="closed">Cerrados</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status === 'open' ? 'Abierto' :
                     ticket.status === 'in-progress' ? 'En Progreso' : 'Cerrado'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {ticket.location}
                  </div>
                  <div className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority === 'high' ? 'Alta' :
                     ticket.priority === 'medium' ? 'Media' :
                     ticket.priority === 'low' ? 'Baja' : 'Crítica'}
                  </div>
                </div>
                {ticket.assignee && (
                  <div className="text-sm text-gray-500 mt-1">
                    Asignado a: {ticket.assignee}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
