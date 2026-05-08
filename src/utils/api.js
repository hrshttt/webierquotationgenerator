const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export async function callGemini(systemPrompt, userMessage) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env file.')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n---\n\n${userMessage}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errMsg = errorData?.error?.message || ''

    // Provide clear guidance for quota errors
    if (response.status === 429 || errMsg.toLowerCase().includes('quota')) {
      throw new Error(
        `API quota exceeded for model "${GEMINI_MODEL}". ` +
        'Try: 1) Wait a minute and retry, 2) Switch model in .env (VITE_GEMINI_MODEL=gemini-2.5-flash), ' +
        'or 3) Upgrade to a paid plan at https://ai.google.dev'
      )
    }

    throw new Error(errMsg || `Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('No content returned from Gemini API')
  }

  // Clean any markdown code fences that might slip through
  return text
    .replace(/```html\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0)
}

export function getNextInvoiceNumber() {
  const stored = localStorage.getItem('webier_invoice_counter')
  const counter = stored ? parseInt(stored, 10) + 1 : 1
  localStorage.setItem('webier_invoice_counter', counter.toString())
  return `WB-INV-${String(counter).padStart(3, '0')}`
}

export function getCurrentInvoiceNumber() {
  const stored = localStorage.getItem('webier_invoice_counter')
  const counter = stored ? parseInt(stored, 10) + 1 : 1
  return `WB-INV-${String(counter).padStart(3, '0')}`
}
