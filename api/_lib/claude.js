// Server-side Claude client. The key lives only in Vercel env vars.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

export async function callClaude({ system, user, maxTokens = 1500 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }]
    })
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Claude API error ${res.status}: ${text}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// Robustly extract a JSON object from a model response.
export function extractJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON in model response')
  return JSON.parse(text.slice(start, end + 1))
}
