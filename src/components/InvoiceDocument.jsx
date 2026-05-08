import { formatCurrency } from '../utils/api'

export default function InvoiceDocument({ data }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getLineTotal = (item) => (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
  const subtotal = data.lineItems.reduce((sum, item) => sum + getLineTotal(item), 0)
  const taxAmount = subtotal * ((parseFloat(data.taxPercent) || 0) / 100)
  const totalDue = subtotal + taxAmount

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#1a1a1a', lineHeight: 1.7, fontSize: '13.5px' }}>
      {/* Title */}
      <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: '0 0 20px 0', letterSpacing: '-0.5px' }}>
        INVOICE
      </h2>

      {/* Invoice & Client Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {/* Left: Billed To */}
        <div style={{ fontSize: '13px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>Billed To</p>
          <p style={{ margin: '2px 0', fontWeight: 600, color: '#111' }}>{data.clientName}</p>
          {data.companyName && <p style={{ margin: '2px 0', color: '#374151' }}>{data.companyName}</p>}
          {data.clientEmail && <p style={{ margin: '2px 0', color: '#374151' }}>{data.clientEmail}</p>}
        </div>

        {/* Right: Invoice Details */}
        <div style={{ fontSize: '13px', textAlign: 'right' }}>
          <p style={{ margin: '2px 0' }}><strong>Invoice No:</strong> {data.invoiceNumber}</p>
          <p style={{ margin: '2px 0' }}><strong>Date:</strong> {formatDateStr(data.invoiceDate)}</p>
          <p style={{ margin: '2px 0' }}><strong>Due Date:</strong> {formatDateStr(data.dueDate)}</p>
        </div>
      </div>

      {/* From Block */}
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#6b7280', border: '1px solid #f3f4f6' }}>
        <strong style={{ color: '#374151' }}>From:</strong> Webier Studio &nbsp;·&nbsp; webierstudio.com &nbsp;·&nbsp; contact@webierstudio.com &nbsp;·&nbsp; +91 8209965066
      </div>

      {/* Project Name */}
      {data.projectName && (
        <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 12px 0' }}>
          <strong>Project:</strong> {data.projectName}
        </p>
      )}

      <hr style={divider} />

      {/* Line Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 6px 0', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '50%' }}>Description</th>
            <th style={{ ...thStyle, textAlign: 'center', width: '10%' }}>Qty</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '20%' }}>Unit Price</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '20%' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item, i) => (
            <tr key={i}>
              <td style={tdStyle}>{item.description || '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>{formatCurrency(getLineTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {taxAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
              <span style={{ color: '#6b7280' }}>Tax ({data.taxPercent}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: 700, borderTop: '2px solid #111', marginTop: '4px' }}>
            <span>Total Due</span>
            <span style={{ color: '#1d4ed8' }}>{formatCurrency(totalDue)}</span>
          </div>
        </div>
      </div>

      <hr style={divider} />

      {/* Payment Details */}
      <h3 style={sectionTitle}>Payment Details</h3>
      <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 4px 0' }}>
        <strong>Payment Method:</strong> {data.paymentMethod}
      </p>
      {data.paymentDetails && (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12.5px', color: '#4b5563', backgroundColor: '#f9fafb', borderRadius: '6px', padding: '10px 14px', margin: '6px 0 12px 0', border: '1px solid #f3f4f6' }}>
          {data.paymentDetails}
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <>
          <hr style={divider} />
          <h3 style={sectionTitle}>Notes</h3>
          <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 12px 0' }}>{data.notes}</p>
        </>
      )}

      <hr style={divider} />

      {/* Thank You & Due Notice */}
      <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 6px 0', fontStyle: 'italic' }}>
        Thank you for choosing Webier Studio. We look forward to working with you again.
      </p>
      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>
        Payment is due by {formatDateStr(data.dueDate)}. Late payments may incur additional charges.
      </p>
    </div>
  )
}

// Shared styles
const sectionTitle = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#111827',
  margin: '0 0 8px 0',
  letterSpacing: '-0.2px',
}

const divider = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '14px 0',
}

const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #e5e7eb',
  fontSize: '11px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const tdStyle = {
  padding: '8px 12px',
  borderBottom: '1px solid #f3f4f6',
  color: '#1f2937',
}
