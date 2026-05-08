import { useState } from 'react'
import { callGemini, formatCurrency } from '../utils/api'
import DocumentPreview from '../components/DocumentPreview'
import QuotationDocument from '../components/QuotationDocument'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'

const AI_SYSTEM_PROMPT = `You are a professional business writer for Webier Studio, a web development agency. Based on the project details provided, generate ONLY these 3 sections in valid JSON format (no markdown, no code fences):

{
  "overview": "2-3 professional, confident sentences describing the project scope and value proposition.",
  "scope": [
    {
      "title": "Page or Feature Name",
      "details": ["Sub-detail 1", "Sub-detail 2", "Sub-detail 3"]
    }
  ],
  "techDetails": ["Technical implementation point 1", "Technical implementation point 2", "..."]
}

Rules:
- "overview" must be 2-3 sentences, confident and professional tone
- "scope" must expand the user's pages/features into proper titled items with 2-3 descriptive sub-bullets each
- "techDetails" must list 4-6 technical implementation points based on the tech stack
- Return ONLY valid JSON. No markdown. No explanation. No code fences.`

const PROJECT_TYPES = ['Frontend Only', 'Full Stack', 'E-commerce', 'Landing Page', 'Custom']
const QUOTATION_TYPES = ['Fresh Quotation', 'Revised Quotation']

const initialForm = {
  quotationType: 'Fresh Quotation',
  clientName: '',
  companyName: '',
  industry: '',
  projectType: 'Frontend Only',
  pagesFeatures: '',
  techStack: '',
  totalCost: '',
  advancePayment: '',
  timeline: '',
  exclusions: '',
  specialNotes: '',
}

export default function QuotationGenerator() {
  const [form, setForm] = useState(initialForm)
  const [aiContent, setAiContent] = useState(null)
  const [isGenerated, setIsGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const pendingPayment = (parseFloat(form.totalCost) || 0) - (parseFloat(form.advancePayment) || 0)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const buildUserMessage = () => {
    return `Project Type: ${form.projectType}
Client: ${form.clientName}, Company: ${form.companyName || 'N/A'}, Industry: ${form.industry || 'N/A'}
Pages & Features: ${form.pagesFeatures}
Tech Stack: ${form.techStack || 'Modern web technologies'}
Budget: $${form.totalCost}`
  }

  const handleGenerate = async () => {
    if (!form.clientName || !form.totalCost || !form.pagesFeatures) {
      toast.error('Please fill in Client Name, Pages & Features, and Total Cost.')
      return
    }

    setIsLoading(true)
    try {
      const result = await callGemini(AI_SYSTEM_PROMPT, buildUserMessage())

      // Parse JSON from AI response
      const cleaned = result.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      const parsed = JSON.parse(cleaned)

      setAiContent(parsed)
      setIsGenerated(true)
      toast.success('Quotation generated!')
    } catch (err) {
      // If AI fails, still generate the document with fallback content
      if (err instanceof SyntaxError) {
        console.warn('AI returned invalid JSON, using fallback content')
        setAiContent(null)
        setIsGenerated(true)
        toast.success('Quotation generated (using default content)')
      } else {
        toast.error(err.message || 'Failed to generate')
        // Still show the document with defaults
        setAiContent(null)
        setIsGenerated(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filename = `Quotation_${form.clientName || 'Client'}_${new Date().toISOString().split('T')[0]}`

  return (
    <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-65px)]">
      {/* Left Panel — Form */}
      <div className="w-full lg:w-[420px] lg:flex-shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-100px)] pr-1">
        <div className="bg-surface rounded-2xl border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-electric" />
            Quotation Details
          </h3>

          <div className="space-y-4">
            {/* Quotation Type */}
            <Field label="Quotation Type">
              <select
                value={form.quotationType}
                onChange={(e) => updateField('quotationType', e.target.value)}
                className={selectClass}
              >
                {QUOTATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            {/* Client Name */}
            <Field label="Client Name *">
              <input type="text" value={form.clientName} onChange={(e) => updateField('clientName', e.target.value)}
                placeholder="John Doe" className={inputClass} />
            </Field>

            {/* Company */}
            <Field label="Company Name">
              <input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Acme Inc." className={inputClass} />
            </Field>

            {/* Industry */}
            <Field label="Industry">
              <input type="text" value={form.industry} onChange={(e) => updateField('industry', e.target.value)}
                placeholder="E-commerce, Healthcare, SaaS..." className={inputClass} />
            </Field>

            {/* Project Type */}
            <Field label="Project Type">
              <select value={form.projectType} onChange={(e) => updateField('projectType', e.target.value)} className={selectClass}>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            {/* Pages & Features */}
            <Field label="Pages & Features *">
              <textarea value={form.pagesFeatures} onChange={(e) => updateField('pagesFeatures', e.target.value)}
                rows={4} placeholder="- Homepage with hero section&#10;- About page&#10;- Contact form&#10;- Admin dashboard"
                className={`${inputClass} resize-none`} />
            </Field>

            {/* Tech Stack */}
            <Field label="Tech Stack">
              <input type="text" value={form.techStack} onChange={(e) => updateField('techStack', e.target.value)}
                placeholder="React, Next.js, Tailwind CSS, Node.js" className={inputClass} />
            </Field>

            {/* Cost */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total Cost (USD) *">
                <input type="number" value={form.totalCost} onChange={(e) => updateField('totalCost', e.target.value)}
                  placeholder="5000" className={inputClass} />
              </Field>
              <Field label="Advance (USD)">
                <input type="number" value={form.advancePayment} onChange={(e) => updateField('advancePayment', e.target.value)}
                  placeholder="2500" className={inputClass} />
              </Field>
            </div>

            {/* Pending */}
            {(form.totalCost || form.advancePayment) && (
              <div className="bg-navy-900 rounded-xl px-3 py-2.5 border border-electric/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Pending Payment</span>
                  <span className="text-sm font-bold text-electric">{formatCurrency(pendingPayment)}</span>
                </div>
              </div>
            )}

            {/* Timeline */}
            <Field label="Estimated Timeline">
              <input type="text" value={form.timeline} onChange={(e) => updateField('timeline', e.target.value)}
                placeholder="7–14 working days" className={inputClass} />
            </Field>

            {/* Exclusions */}
            <Field label="Exclusions">
              <textarea value={form.exclusions} onChange={(e) => updateField('exclusions', e.target.value)}
                rows={3} placeholder="- Domain & hosting&#10;- Content writing&#10;- Stock photography"
                className={`${inputClass} resize-none`} />
            </Field>

            {/* Special Notes */}
            <Field label="Special Notes (Optional)">
              <textarea value={form.specialNotes} onChange={(e) => updateField('specialNotes', e.target.value)}
                rows={2} placeholder="Any additional notes..." className={`${inputClass} resize-none`} />
            </Field>

            {/* Generate */}
            <button onClick={handleGenerate} disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-electric to-electric-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-electric/20">
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Generating...' : 'Generate Quotation'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel — Preview */}
      <DocumentPreview
        isLoading={isLoading}
        isGenerated={isGenerated}
        onRegenerate={handleGenerate}
        filename={filename}
        emptyMessage="Fill in the quotation details and click Generate to create a professional quotation."
      >
        <QuotationDocument data={form} aiContent={aiContent} />
      </DocumentPreview>
    </div>
  )
}

// Reusable field wrapper
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full px-3 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-electric/40 focus:border-electric/40 transition-all'
const selectClass = 'w-full px-3 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/40 focus:border-electric/40 transition-all'
