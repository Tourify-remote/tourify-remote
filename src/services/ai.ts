export async function generateSessionSummary(sessionData: string): Promise<string> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionData })
    })

    if (!res.ok) {
      throw new Error(`AI service error ${res.status}`)
    }

    const data = await res.json()
    return data.text as string
  } catch (error) {
    console.error('Error calling AI service:', error)
    // Fallback message in Spanish for the Metro de Santiago context
    return "No se pudo generar el resumen con IA debido a un error. Por favor, revisa el registro de la sesión manualmente."
  }
}

// Legacy function for backward compatibility
export const geminiService = {
  async generateSessionReport(sessionData: {
    siteId: string
    siteName: string
    siteType: string
    duration: number
    annotations: string[]
    expertName: string
    technicianName: string
  }): Promise<string> {
    const formattedData = `
Sitio: ${sessionData.siteName} (${sessionData.siteType})
ID del Sitio: ${sessionData.siteId}
Duración: ${sessionData.duration} minutos
Experto: ${sessionData.expertName}
Técnico en Campo: ${sessionData.technicianName}
Anotaciones realizadas: ${sessionData.annotations.length} marcaciones
Detalles de anotaciones: ${sessionData.annotations.join(', ')}
`
    return generateSessionSummary(formattedData)
  },

  async generateMaintenanceRecommendations(equipmentList: string[], issueDescription: string): Promise<string> {
    const formattedData = `
Equipos involucrados:
${equipmentList.map(eq => `- ${eq}`).join('\n')}

Descripción del problema:
${issueDescription}

Solicitud: Proporciona recomendaciones de mantenimiento específicas para el Metro de Santiago.
`
    return generateSessionSummary(formattedData)
  }
}
