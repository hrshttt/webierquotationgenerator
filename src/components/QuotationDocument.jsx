import { formatCurrency } from '../utils/api'

export default function QuotationDocument({ data, aiContent }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const pendingPayment = (parseFloat(data.totalCost) || 0) - (parseFloat(data.advancePayment) || 0)
  const isRevised = data.quotationType === 'Revised Quotation'

  // Parse scope items from AI or fallback to raw input
  const scopeItems = aiContent?.scope || []
  const projectOverview = aiContent?.overview || ''
  const techDetails = aiContent?.techDetails || []

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#1a1a1a', lineHeight: 1.7, fontSize: '13.5px' }}>
      {/* Title */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>
        {isRevised ? 'Revised Quotation' : 'Quotation'} for Website Design & Development
      </h2>
      {isRevised && (
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0' }}>
          Payment Update & Confirmed Scope
        </p>
      )}

      {/* Client Info Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', marginBottom: '16px', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px' }}>
          <p style={{ margin: '2px 0' }}><strong>Client:</strong> {data.clientName}</p>
          {data.companyName && <p style={{ margin: '2px 0' }}><strong>Company:</strong> {data.companyName}</p>}
          {data.industry && <p style={{ margin: '2px 0' }}><strong>Industry:</strong> {data.industry}</p>}
        </div>
        <div style={{ fontSize: '13px', textAlign: 'right' }}>
          <p style={{ margin: '2px 0' }}><strong>Date:</strong> {today}</p>
          <p style={{ margin: '2px 0' }}><strong>Prepared By:</strong> Webier Studio</p>
          <p style={{ margin: '2px 0' }}><strong>Project Type:</strong> {data.projectType}</p>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

      {/* Project Overview */}
      <h3 style={sectionTitle}>Project Overview</h3>
      <p style={{ margin: '0 0 12px 0', color: '#374151' }}>
        {projectOverview || `We are pleased to present this quotation for the design and development of a ${data.projectType.toLowerCase()} website for ${data.companyName || data.clientName}. This project will be built using modern technologies to deliver a high-performance, responsive, and visually compelling digital experience.`}
      </p>

      <hr style={divider} />

      {/* Scope of Work */}
      <h3 style={sectionTitle}>Scope of Work</h3>
      {scopeItems.length > 0 ? (
        <ol style={{ paddingLeft: '18px', margin: '0 0 12px 0' }}>
          {scopeItems.map((item, i) => (
            <li key={i} style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#111' }}>{item.title}</strong>
              {item.details && item.details.length > 0 && (
                <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', listStyleType: 'disc' }}>
                  {item.details.map((d, j) => (
                    <li key={j} style={{ fontSize: '12.5px', color: '#4b5563', marginBottom: '2px' }}>{d}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div style={{ whiteSpace: 'pre-wrap', color: '#374151', fontSize: '13px', margin: '0 0 12px 0' }}>
          {data.pagesFeatures}
        </div>
      )}

      <hr style={divider} />

      {/* Technical Implementation */}
      <h3 style={sectionTitle}>Technical Implementation</h3>
      {techDetails.length > 0 ? (
        <ul style={{ paddingLeft: '18px', margin: '0 0 12px 0', listStyleType: 'disc' }}>
          {techDetails.map((t, i) => (
            <li key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '3px' }}>{t}</li>
          ))}
        </ul>
      ) : (
        <ul style={{ paddingLeft: '18px', margin: '0 0 12px 0', listStyleType: 'disc' }}>
          <li style={listItem}>Tech Stack: {data.techStack || 'To be confirmed'}</li>
          <li style={listItem}>Fully responsive design (mobile, tablet, desktop)</li>
          <li style={listItem}>SEO-optimized structure with clean, semantic code</li>
          <li style={listItem}>Cross-browser compatibility</li>
          <li style={listItem}>Performance-optimized for fast load times</li>
        </ul>
      )}

      <hr style={divider} />

      {/* Timeline */}
      <h3 style={sectionTitle}>Timeline</h3>
      <ul style={{ paddingLeft: '18px', margin: '0 0 12px 0', listStyleType: 'disc' }}>
        <li style={listItem}>Estimated Delivery: <strong>{data.timeline || 'To be discussed'}</strong></li>
        <li style={listItem}>Timeline begins after advance payment & requirement finalization</li>
        <li style={listItem}>Milestone updates will be shared throughout the project</li>
      </ul>

      <hr style={divider} />

      {/* Cost & Payment Summary */}
      <h3 style={sectionTitle}>Cost & Payment Summary</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 12px 0', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Description</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>Total Project Cost</td>
            <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(data.totalCost)}</td>
          </tr>
          {parseFloat(data.advancePayment) > 0 && (
            <tr>
              <td style={tdStyle}>Payment Received</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#059669' }}>{formatCurrency(data.advancePayment)}</td>
            </tr>
          )}
          <tr style={{ backgroundColor: '#f0f4ff' }}>
            <td style={{ ...tdStyle, fontWeight: 700 }}>Pending Payment</td>
            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>{formatCurrency(pendingPayment)}</td>
          </tr>
        </tbody>
      </table>

      <hr style={divider} />

      {/* Payment Terms */}
      <h3 style={sectionTitle}>Payment Terms</h3>
      <ul style={{ paddingLeft: '18px', margin: '0 0 12px 0', listStyleType: 'disc' }}>
        <li style={listItem}>50% advance payment to initiate the project</li>
        <li style={listItem}>Remaining 50% upon project completion, before final handover</li>
        <li style={listItem}>Payments accepted via Bank Transfer, PayPal, or Wise</li>
      </ul>

      <hr style={divider} />

      {/* Exclusions */}
      {data.exclusions && (
        <>
          <h3 style={sectionTitle}>Exclusions</h3>
          <ul style={{ paddingLeft: '18px', margin: '0 0 12px 0', listStyleType: 'disc' }}>
            {data.exclusions.split('\n').filter(Boolean).map((item, i) => (
              <li key={i} style={listItem}>{item.replace(/^[-•*]\s*/, '')}</li>
            ))}
          </ul>
          <hr style={divider} />
        </>
      )}

      {/* Validity & Revisions */}
      <h3 style={sectionTitle}>Terms & Conditions</h3>
      <ul style={{ paddingLeft: '18px', margin: '0 0 12px 0', listStyleType: 'disc' }}>
        <li style={listItem}>This quotation is valid for <strong>14 days</strong> from the date of issue.</li>
        <li style={listItem}>This project includes up to <strong>2 rounds of revisions</strong>. Additional revisions will be charged separately.</li>
        <li style={listItem}>Any scope additions or feature changes after project initiation may affect timeline and cost.</li>
      </ul>

      {/* Special Notes */}
      {data.specialNotes && (
        <>
          <hr style={divider} />
          <h3 style={sectionTitle}>Additional Notes</h3>
          <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '13px' }}>{data.specialNotes}</p>
        </>
      )}

      <hr style={divider} />

      {/* Acceptance */}
      <h3 style={sectionTitle}>Acceptance</h3>
      <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 20px 0' }}>
        By signing below, the client agrees to the scope, timeline, and payment terms outlined in this quotation.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', marginTop: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ borderBottom: '1px solid #d1d5db', marginBottom: '6px', height: '40px' }} />
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Client Signature</p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>{data.clientName}</p>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ borderBottom: '1px solid #d1d5db', marginBottom: '6px', height: '40px' }} />
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Date</p>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ borderBottom: '1px solid #d1d5db', marginBottom: '6px', height: '40px' }} />
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Prepared By</p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>Webier Studio</p>
        </div>
      </div>
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

const listItem = {
  fontSize: '13px',
  color: '#374151',
  marginBottom: '3px',
}

const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #e5e7eb',
  fontSize: '12px',
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
