import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Generates a session summary using the Gemini API.
 * 
 * @param sessionData A string containing the log and context of the maintenance session.
 * @returns A promise that resolves to the AI-generated summary text.
 */
export const generateSessionSummary = async (sessionData: string): Promise<string> => {
  try {
    // Use the browser-compatible environment variable access
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Gemini API key not configured')
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
      Eres un asistente de IA para "Tourify Remote", una herramienta de supervisión remota de faenas para el Metro de Santiago.
      Tu tarea es generar un resumen conciso y profesional de una sesión de mantenimiento remoto para un reporte oficial.
      Usa el siguiente registro de sesión para crear el resumen. Sé claro y objetivo.

      Registro de Sesión:
      ---
      ${sessionData}
      ---
      
      Resumen del Reporte:
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error llamando a la API de Gemini:", error)
    // Proporciona un mensaje de respaldo si la llamada a la API falla
    return "No se pudo generar el resumen con IA debido a un error. Por favor, revisa el registro de la sesión manualmente."
  }
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  async generateSessionReport(sessionData: {
    siteId: string
    siteName: string
    siteType: string
    duration: number
    annotations: string[]
    expertName: string
    technicianName: string
  }): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured')
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Actúa como un asistente especializado para Metro de Santiago. Genera un resumen profesional de una sesión de supervisión remota con la siguiente información:

**Datos de la Sesión:**
- Sitio: ${sessionData.siteName} (${sessionData.siteType})
- ID del Sitio: ${sessionData.siteId}
- Duración: ${sessionData.duration} minutos
- Experto: ${sessionData.expertName}
- Técnico en Campo: ${sessionData.technicianName}
- Anotaciones realizadas: ${sessionData.annotations.length} marcaciones

**Instrucciones:**
1. Crea un resumen profesional y conciso de la sesión
2. Incluye los puntos clave discutidos basándose en las anotaciones
3. Menciona cualquier problema identificado o recomendaciones
4. Usa un tono formal pero accesible
5. Estructura el resumen en párrafos claros
6. Máximo 300 palabras

**Contexto:** Esta es una sesión de supervisión remota donde un experto guía a un técnico en campo usando tecnología de realidad aumentada y comunicación en tiempo real para resolver problemas de mantenimiento en la red del Metro de Santiago.

Genera el resumen:
`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating report:', error)
      throw new Error('Failed to generate session report')
    }
  }

  async generateMaintenanceRecommendations(equipmentList: string[], issueDescription: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured')
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Como experto en mantenimiento de sistemas de transporte metro, proporciona recomendaciones específicas para el siguiente caso:

**Equipos involucrados:**
${equipmentList.map(eq => `- ${eq}`).join('\n')}

**Descripción del problema:**
${issueDescription}

**Solicitud:**
Proporciona recomendaciones de mantenimiento específicas, incluyendo:
1. Acciones inmediatas requeridas
2. Herramientas necesarias
3. Precauciones de seguridad
4. Tiempo estimado de resolución
5. Seguimiento recomendado

Mantén un enfoque técnico pero claro, considerando las normativas de seguridad del Metro de Santiago.
`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw new Error('Failed to generate maintenance recommendations')
    }
  }
}

export const geminiService = new GeminiService()