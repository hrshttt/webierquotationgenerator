import { formatCurrency } from '../utils/api'

export default function InvoiceDocument({ data }) {
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

  let surchargePercent = 0
  if (data.paymentMethod === 'Wise') surchargePercent = 5
  else if (data.paymentMethod === 'PayPal' || data.paymentMethod === 'Bank Transfer') surchargePercent = 10

  const surchargeAmount = (subtotal + taxAmount) * (surchargePercent / 100)
  const totalAmount = subtotal + taxAmount + surchargeAmount

  const advancePercent = parseFloat(data.advancePercent) || 0
  const advanceAmount = totalAmount * (advancePercent / 100)
  const balanceDue = totalAmount - advanceAmount

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#1A1A1A', lineHeight: 1.7, fontSize: '13.5px' }}>
      {/* Header (Negative margins to cancel DocumentPreview padding) */}
      <div style={{ backgroundColor: '#3533CD', color: '#ffffff', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '-20px -40px 40px -40px' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.128em' }}>
          webier<span style={{ color: '#F5C518' }}>.</span>
        </div>
        <div style={{ borderLeft: '2px solid #F5C518', paddingLeft: '16px', fontSize: '11px', lineHeight: 1.6, color: '#ffffff', opacity: 0.9, textAlign: 'left' }}>
          <div>webierstudio.com</div>
          <div>contact@webierstudio.com</div>
          <div>+91 9257565709</div>
        </div>
      </div>

      {/* Title & Project */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#3533CD', margin: '0 0 8px 0', letterSpacing: '4px', textTransform: 'uppercase' }}>
          {data.paymentStage === 'Advance' ? 'ADVANCE INVOICE' : data.paymentStage === 'Final' ? 'FINAL INVOICE' : 'INVOICE'}
        </h2>
        {data.projectName && (
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, fontWeight: 500 }}>
            {data.projectName}
          </p>
        )}
      </div>

      {/* Invoice & Client Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', marginBottom: '48px' }}>
        {/* Left: Billed To */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>BILLED TO</p>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#1A1A1A', fontSize: '16px' }}>{data.clientName}</p>
          {data.companyName && <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontWeight: 500 }}>{data.companyName}</p>}
          {data.clientEmail && <p style={{ margin: '0', color: '#6B7280' }}>{data.clientEmail}</p>}
        </div>

        {/* Right: Invoice Meta */}
        <div style={{ flex: 1, borderLeft: '2px solid #3533CD', paddingLeft: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>INVOICE NO.</span>
            <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{data.invoiceNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>DATE</span>
            <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{formatDateStr(data.invoiceDate)}</span>
          </div>
          {data.hasDueDate && !!data.dueDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>DUE DATE</span>
              <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{formatDateStr(data.dueDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '50%' }}>DESCRIPTION</th>
            <th style={{ ...thStyle, textAlign: 'center', width: '10%' }}>QTY</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '20%' }}>PRICE</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '20%' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#F9F9FF' }}>
              <td style={tdStyle}>{item.description || '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#1A1A1A' }}>{formatCurrency(getLineTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
        <div style={{ width: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: '13px' }}>
            <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SUBTOTAL</span>
            <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{formatCurrency(subtotal)}</span>
          </div>
          {taxAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: '13px', borderTop: '1px solid #F3F4F6' }}>
              <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TAX ({data.taxPercent}%)</span>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          {surchargeAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: '13px', borderTop: '1px solid #F3F4F6' }}>
              <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{data.paymentMethod.toUpperCase()} SURCHARGE ({surchargePercent}%)</span>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{formatCurrency(surchargeAmount)}</span>
            </div>
          )}
          {data.paymentStage === 'Advance' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: '13px', borderTop: '1px solid #E5E7EB' }}>
                <span style={{ color: '#1A1A1A', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL PROJECT AMOUNT</span>
                <span style={{ fontWeight: 800, color: '#1A1A1A' }}>{formatCurrency(totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#3533CD', color: '#ffffff', borderRadius: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ADVANCE DUE ({advancePercent}%)</span>
                <span style={{ color: '#F5C518', fontSize: '20px', fontWeight: 800 }}>{formatCurrency(advanceAmount)}</span>
              </div>
            </>
          ) : data.paymentStage === 'Final' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: '13px', borderTop: '1px solid #E5E7EB' }}>
                <span style={{ color: '#1A1A1A', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL PROJECT AMOUNT</span>
                <span style={{ fontWeight: 800, color: '#1A1A1A' }}>{formatCurrency(totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: '13px', borderTop: '1px solid #F3F4F6' }}>
                <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>LESS ADVANCE PAID ({advancePercent}%)</span>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>-{formatCurrency(advanceAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#3533CD', color: '#ffffff', borderRadius: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>BALANCE DUE</span>
                <span style={{ color: '#F5C518', fontSize: '20px', fontWeight: 800 }}>{formatCurrency(balanceDue)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#3533CD', color: '#ffffff', borderRadius: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL DUE</span>
              <span style={{ color: '#F5C518', fontSize: '20px', fontWeight: 800 }}>{formatCurrency(totalAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment & Notes Row */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        {/* Payment Section */}
        <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '24px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>PAYMENT METHOD</h3>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{data.paymentMethod}</p>
          </div>
          {data.paymentMethod === 'Bank Transfer' && data.paymentDetails && (
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '12.5px', color: '#4B5563', lineHeight: 1.6 }}>
              {data.paymentDetails}
            </div>
          )}
          {data.paymentLink && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px' }}>Payment Link</span>
                <a href={data.paymentLink} style={{ color: '#3533CD', textDecoration: 'none', fontWeight: 600, fontSize: '13px', wordBreak: 'break-all' }}>
                  {data.paymentLink}
                </a>
              </div>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data.paymentLink)}&margin=0`}
                alt="Payment QR Code"
                style={{ width: '80px', height: '80px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '4px', backgroundColor: '#ffffff' }}
              />
            </div>
          )}
        </div>

        {/* Notes Section */}
        {data.notes ? (
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>NOTES</h3>
            <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.6 }}>{data.notes}</p>
          </div>
        ) : (
          <div style={{ flex: 1 }}></div>
        )}
      </div>

      {/* Footer (Negative bottom margin to cancel padding) */}
      <div style={{ borderTop: '2px solid #3533CD', padding: '24px 40px', margin: '0 -40px -30px -40px' }}>
        <p style={{ fontSize: '14px', color: '#3533CD', margin: '0 0 4px 0', fontStyle: 'italic', fontWeight: 600 }}>
          Thank you for choosing Webier Studio. We look forward to working with you again.
        </p>
        {data.hasDueDate && !!data.dueDate && (
          <p style={{ fontSize: '11px', color: '#6B7280', margin: '0' }}>
            Payment is due by {formatDateStr(data.dueDate)}. Late payments may incur additional charges.
          </p>
        )}
      </div>
    </div>
  )
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 16px',
  borderBottom: '2px solid #E5E7EB',
  fontSize: '10px',
  fontWeight: 700,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '1px',
}

const tdStyle = {
  padding: '16px',
  borderBottom: '1px solid #F3F4F6',
  color: '#4B5563',
  fontSize: '13px',
}
