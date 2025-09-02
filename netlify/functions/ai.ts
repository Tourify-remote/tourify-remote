/* eslint-env node */
import type { Handler } from '@netlify/functions'

type Provider = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'openrouter'

const PROVIDER_ORDER: Provider[] = (
  process.env.PROVIDER_ORDER?.split(',').map(p => p.trim() as Provider)
) || ['gemini','groq','openai','anthropic']

const MODELS = {
  gemini: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  openai: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  anthropic: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
  groq: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
  openrouter: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-70b-instruct'
}

const asText = (val: any): string => {
  if (!val) return ''
  if (typeof val === 'string') return val
  // Try common fields across providers
  return (
    val.text ||
    val.output ||
    val.response?.text?.() ||
    val.response?.text ||
    val.candidates?.[0]?.content?.parts?.[0]?.text ||
    val.choices?.[0]?.message?.content ||
    val.content?.[0]?.text ||
    ''
  )
}

const promptForSummary = (sessionData: string) => `
Eres un asistente de IA para "Tourify Remote", una herramienta de supervisión remota de faenas para el Metro de Santiago.
Tu tarea es generar un resumen conciso y profesional de una sesión de mantenimiento remoto para un reporte oficial.

Estructura el resumen de la siguiente manera:
- Contexto y objetivo (1-2 líneas)
- Pasos ejecutados (viñetas)
- Hallazgos/defectos encontrados (viñetas)
- Acciones siguientes + responsables + plazos

Mantén el resumen bajo 150 palabras. Usa lenguaje claro y accionable.

Datos de la sesión:
${sessionData}
`

async function callGemini(sessionData: string) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('Missing GEMINI_API_KEY')
  const model = MODELS.gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptForSummary(sessionData) }]}] })
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  return await res.json()
}

async function callOpenAI(sessionData: string) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')
  const model = MODELS.openai
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: promptForSummary(sessionData) }]
    })
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  return await res.json()
}

async function callAnthropic(sessionData: string) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('Missing ANTHROPIC_API_KEY')
  const model = MODELS.anthropic
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: 'user', content: promptForSummary(sessionData) }] })
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}`)
  return await res.json()
}

async function callGroq(sessionData: string) {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('Missing GROQ_API_KEY')
  const model = MODELS.groq
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: promptForSummary(sessionData) }] })
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  return await res.json()
}

async function callOpenRouter(sessionData: string) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('Missing OPENROUTER_API_KEY')
  const model = MODELS.openrouter
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': process.env.APP_URL || 'https://example.com',
      'X-Title': 'Tourify Remote'
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: promptForSummary(sessionData) }] })
  })
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
  return await res.json()
}

const callers: Record<Provider, (_s: string) => Promise<any>> = {
  gemini: callGemini,
  openai: callOpenAI,
  anthropic: callAnthropic,
  groq: callGroq,
  openrouter: callOpenRouter
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { sessionData, provider } = JSON.parse(event.body || '{}')

    const order = provider ? [provider as Provider] : PROVIDER_ORDER
    let lastErr: any = null

    for (const p of order) {
      try {
        const raw = await callers[p](sessionData || '')
        const text = asText(raw)
        if (text && text.length > 0) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ provider: p, text })
          }
        }
        lastErr = `Empty text from ${p}`
      } catch (e) {
        lastErr = e?.toString?.() || e
        // continue to next provider
      }
    }

    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'All providers failed', detail: String(lastErr) })
    }
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Invalid request body' })
    }
  }
}
