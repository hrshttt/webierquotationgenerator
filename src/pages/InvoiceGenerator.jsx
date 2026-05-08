import { useState, useEffect } from 'react'
import { formatCurrency, getCurrentInvoiceNumber, getNextInvoiceNumber } from '../utils/api'
import DocumentPreview from '../components/DocumentPreview'
import InvoiceDocument from '../components/InvoiceDocument'
import toast from 'react-hot-toast'
import { FileText, Plus, Trash2 } from 'lucide-react'

const PAYMENT_METHODS = ['Bank Transfer', 'PayPal', 'Wise', 'Crypto', 'Other']
const emptyLineItem = { description: '', quantity: 1, unitPrice: '' }

export default function InvoiceGenerator() {
  const [form, setForm] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    clientName: '',
    companyName: '',
    clientEmail: '',
    projectName: '',
    lineItems: [{ ...emptyLineItem }],
    taxPercent: 0,
    paymentMethod: 'Bank Transfer',
    paymentDetails: '',
    notes: 'Thank you for your business!',
  })
  const [isGenerated, setIsGenerated] = useState(false)

  useEffect(() => {
    setForm((prev) => ({ ...prev, invoiceNumber: getCurrentInvoiceNumber() }))
  }, [])

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const updateLineItem = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.lineItems]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, lineItems: items }
    })
  }

  const addLineItem = () => setForm((prev) => ({ ...prev, lineItems: [...prev.lineItems, { ...emptyLineItem }] }))

  const removeLineItem = (index) => {
    if (form.lineItems.length === 1) return
    setForm((prev) => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }))
  }

  const getLineTotal = (item) => (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
  const subtotal = form.lineItems.reduce((sum, item) => sum + getLineTotal(item), 0)
  const taxAmount = subtotal * ((parseFloat(form.taxPercent) || 0) / 100)
  const totalDue = subtotal + taxAmount

  const handleGenerate = () => {
    if (!form.clientName || form.lineItems.some((i) => !i.description || !i.unitPrice)) {
      toast.error('Please fill in Client Name and all line item details.')
      return
    }
    getNextInvoiceNumber()
    setIsGenerated(true)
    toast.success('Invoice generated!')
  }

  const filename = `Invoice_${form.invoiceNumber}_${form.clientName || 'Client'}`

  return (
    <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-65px)]">
      {/* Left Panel — Form */}
      <div className="w-full lg:w-[420px] lg:flex-shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-100px)] pr-1">
        <div className="bg-surface rounded-2xl border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-electric" />
            Invoice Details
          </h3>

          <div className="space-y-4">
            {/* Invoice Number & Date */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Invoice No.">
                <input type="text" value={form.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Invoice Date">
                <input type="date" value={form.invoiceDate} onChange={(e) => updateField('invoiceDate', e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
              </Field>
            </div>

            <Field label="Due Date">
              <input type="date" value={form.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
            </Field>

            <Field label="Client Name *">
              <input type="text" value={form.clientName} onChange={(e) => updateField('clientName', e.target.value)} placeholder="John Doe" className={inputClass} />
            </Field>

            <Field label="Company Name">
              <input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} placeholder="Acme Inc." className={inputClass} />
            </Field>

            <Field label="Client Email (Optional)">
              <input type="email" value={form.clientEmail} onChange={(e) => updateField('clientEmail', e.target.value)} placeholder="client@company.com" className={inputClass} />
            </Field>

            <Field label="Project Name / Description">
              <input type="text" value={form.projectName} onChange={(e) => updateField('projectName', e.target.value)} placeholder="Website Development — Phase 1" className={inputClass} />
            </Field>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-400">Line Items</label>
                <button onClick={addLineItem} className="inline-flex items-center gap-1 text-xs text-electric hover:text-electric-light transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
              <div className="space-y-2">
                {form.lineItems.map((item, index) => (
                  <div key={index} className="bg-navy-900 rounded-xl border border-white/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Item {index + 1}</span>
                      {form.lineItems.length > 1 && (
                        <button onClick={() => removeLineItem(index)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input type="text" value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Description" className="w-full px-3 py-2 bg-navy-800 border border-white/5 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-electric/40 transition-all" />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Qty</label>
                        <input type="number" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          min="1" className="w-full px-2 py-1.5 bg-navy-800 border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-electric/40 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Unit Price ($)</label>
                        <input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                          placeholder="0" className="w-full px-2 py-1.5 bg-navy-800 border border-white/5 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-electric/40 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Total</label>
                        <div className="px-2 py-1.5 bg-navy-800/50 border border-white/5 rounded-lg text-electric text-sm font-medium">
                          {formatCurrency(getLineTotal(item))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax */}
            <Field label="Tax % (Optional)">
              <input type="number" value={form.taxPercent} onChange={(e) => updateField('taxPercent', e.target.value)}
                min="0" max="100" className={inputClass} />
            </Field>

            {/* Summary */}
            <div className="bg-navy-900 rounded-xl px-3 py-3 border border-electric/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Subtotal</span>
                <span className="text-sm text-gray-300">{formatCurrency(subtotal)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Tax ({form.taxPercent}%)</span>
                  <span className="text-sm text-gray-300">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                <span className="text-xs font-semibold text-white">Total Amount Due</span>
                <span className="text-base font-bold text-electric">{formatCurrency(totalDue)}</span>
              </div>
            </div>

            {/* Payment */}
            <Field label="Payment Method">
              <select value={form.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)} className={selectClass}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>

            <Field label="Payment Details">
              <textarea value={form.paymentDetails} onChange={(e) => updateField('paymentDetails', e.target.value)}
                rows={3} placeholder="Bank Name: ...&#10;Account No: ...&#10;IFSC: ..." className={`${inputClass} resize-none`} />
            </Field>

            <Field label="Notes (Optional)">
              <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)}
                rows={2} placeholder="Thank you for your business!" className={`${inputClass} resize-none`} />
            </Field>

            {/* Generate */}
            <button onClick={handleGenerate}
              className="w-full py-3 bg-gradient-to-r from-electric to-electric-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-electric/20">
              <FileText className="w-4 h-4" />
              Generate Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel — Preview */}
      <DocumentPreview
        isLoading={false}
        isGenerated={isGenerated}
        filename={filename}
        emptyMessage="Fill in the invoice details and click Generate to create a professional invoice."
      >
        <InvoiceDocument data={form} />
      </DocumentPreview>
    </div>
  )
}

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
