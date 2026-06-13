import { formatCurrency } from '../utils/api'

export default function QuotationDocument({ data, aiContent }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const totalCostValue = parseFloat(data.totalCost) || 0
  const advancePercentValue = parseFloat(data.advancePercent) || 0
  const advanceAmountValue = totalCostValue * (advancePercentValue / 100)
  const pendingPayment = totalCostValue - advanceAmountValue
  const isRevised = data.quotationType === 'Revised Quotation'

  // Parse scope items from AI or fallback to raw input
  const scopeItems = aiContent?.scope || []
  const projectOverview = aiContent?.overview || ''
  const techDetails = aiContent?.techDetails || []

  // Component to render section headers consistently
  const SectionHeader = ({ title }) => (
    <div style={{ 
      backgroundColor: '#3533CD', 
      color: '#ffffff', 
      padding: '12px 24px', 
      fontSize: '18px', 
      fontWeight: 700, 
      letterSpacing: '1px', 
      textTransform: 'uppercase', 
      marginBottom: '24px', 
      borderRadius: '4px',
      pageBreakAfter: 'avoid'
    }}>
      {title}
    </div>
  )

  const timelinePhases = [
    { week: 'Phase 1', title: 'Discovery & UX', desc: 'Requirements gathering, wireframing, and initial user flow design.' },
    { week: 'Phase 2', title: 'UI Design', desc: 'Creating high-fidelity mockups and establishing the visual design system.' },
    { week: 'Phase 3', title: 'Development', desc: 'Frontend and backend implementation, integrating core features.' },
    { week: 'Phase 4', title: 'Testing & Launch', desc: 'QA testing, bug fixing, and final deployment to production.' },
  ]

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#1a1a1a', lineHeight: 1.7, fontSize: '14px', position: 'relative', paddingBottom: '60px' }}>
      
      {/* Print Styles for Pagination */}
      <style>
        {`
          @media print {
            .page-break { page-break-after: always; }
            .avoid-break { page-break-inside: avoid; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-footer { 
              position: fixed; 
              bottom: 0; 
              width: 100%; 
              display: flex; 
              justify-content: space-between; 
              border-top: 2px solid #3533CD; 
              padding-top: 12px; 
              font-size: 12px; 
              color: #6B7280; 
              background: white; 
              padding-bottom: 20px;
            }
          }
          @media screen {
            .print-footer { display: none; }
          }
        `}
      </style>



      {/* Title & Project Details */}
      <div className="page-break" style={{ padding: '0 20px', marginBottom: '60px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', lineHeight: 1.1 }}>
          {isRevised ? 'Revised Quotation' : 'Proposal & Quotation'}
        </h1>
        <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#3533CD', margin: '0 0 40px 0' }}>
          {data.projectType}
        </h2>
        
        <div style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.8, backgroundColor: '#F9FAFB', padding: '32px', borderLeft: '6px solid #3533CD', maxWidth: '600px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', margin: 0, padding: 0 }}>
            <tbody>
              <tr>
                <td style={{ width: '120px', paddingBottom: '12px', verticalAlign: 'top', padding: '0 0 12px 0' }}><strong style={{ color: '#111827' }}>Prepared For:</strong></td>
                <td style={{ paddingBottom: '12px', verticalAlign: 'top', padding: '0 0 12px 0' }}>{data.clientName} {data.companyName && `(${data.companyName})`}</td>
              </tr>
              <tr>
                <td style={{ width: '120px', paddingBottom: '12px', verticalAlign: 'top', padding: '0 0 12px 0' }}><strong style={{ color: '#111827' }}>Date:</strong></td>
                <td style={{ paddingBottom: '12px', verticalAlign: 'top', padding: '0 0 12px 0' }}>{today}</td>
              </tr>
              <tr>
                <td style={{ width: '120px', verticalAlign: 'top', padding: 0 }}><strong style={{ color: '#111827' }}>Validity:</strong></td>
                <td style={{ verticalAlign: 'top', padding: 0 }}>14 Days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* 2. Project Overview */}
        <div className="avoid-break" style={{ marginBottom: '48px' }}>
          <SectionHeader title="Project Overview" />
          <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.8, margin: 0 }}>
            {projectOverview || `We are pleased to present this quotation for the design and development of a ${data.projectType?.toLowerCase() || 'custom'} website for ${data.companyName || data.clientName}. This project will be built using modern technologies to deliver a high-performance, responsive, and visually compelling digital experience tailored to your specific requirements.`}
          </p>
        </div>

        {/* 3. Scope of Work */}
        <div style={{ marginBottom: '48px' }}>
          <SectionHeader title="Scope of Work" />
          {scopeItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {scopeItems.map((item, i) => (
                <div key={i} className="avoid-break" style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ color: '#3533CD', fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0' }}>{item.title}</h4>
                  {item.details && item.details.length > 0 && (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#4B5563', lineHeight: 1.7 }}>
                      {item.details.map((d, j) => (
                        <li key={j} style={{ marginBottom: '6px' }}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', color: '#4B5563', lineHeight: 1.8, backgroundColor: '#F9FAFB', padding: '24px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              {data.pagesFeatures}
            </div>
          )}
        </div>

        {/* 4. Tech Stack */}
        <div className="avoid-break" style={{ marginBottom: '48px' }}>
          <SectionHeader title="Tech Stack & Technologies" />
          <div style={{ backgroundColor: '#F9FAFB', padding: '24px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            {techDetails.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#4B5563', lineHeight: 1.8 }}>
                {techDetails.map((t, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{t}</li>
                ))}
              </ul>
            ) : (
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#4B5563', lineHeight: 1.8 }}>
                <li style={{ marginBottom: '8px' }}><strong>Technologies:</strong> {data.techStack || 'React, Next.js, Tailwind CSS, Node.js'}</li>
                <li style={{ marginBottom: '8px' }}>Fully responsive design (mobile, tablet, desktop)</li>
                <li style={{ marginBottom: '8px' }}>SEO-optimized structure with clean, semantic code</li>
                <li style={{ marginBottom: '8px' }}>Cross-browser compatibility & performance optimization</li>
              </ul>
            )}
          </div>
        </div>

        {/* 5. Timeline */}
        <div className="avoid-break" style={{ marginBottom: '48px' }}>
          <SectionHeader title="Project Timeline" />
          <p style={{ color: '#4B5563', marginBottom: '24px', fontSize: '15px' }}>
            Estimated Total Delivery Time: <strong style={{ color: '#3533CD' }}>{data.timeline || '4-6 Weeks'}</strong>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {timelinePhases.map((phase, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3533CD' }}>
                <div style={{ backgroundColor: '#3533CD', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, minWidth: '80px', textAlign: 'center', marginTop: '2px' }}>
                  {phase.week}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '16px', fontWeight: 700 }}>{phase.title}</h4>
                  <p style={{ margin: 0, color: '#4B5563', fontSize: '14px', lineHeight: 1.6 }}>{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Exclusions & 7. Client Responsibilities */}
        <div className="avoid-break" style={{ marginBottom: '48px', display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <SectionHeader title="Exclusions" />
            <ul style={{ paddingLeft: '20px', color: '#4B5563', lineHeight: 1.8, margin: 0 }}>
              {data.exclusions ? (
                data.exclusions.split('\n').filter(Boolean).map((item, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{item.replace(/^[-•*]\s*/, '')}</li>
                ))
              ) : (
                <>
                  <li style={{ marginBottom: '8px' }}>Domain name registration and premium hosting fees</li>
                  <li style={{ marginBottom: '8px' }}>Paid third-party API or software licenses</li>
                  <li style={{ marginBottom: '8px' }}>Creation of custom branding or logo design</li>
                  <li style={{ marginBottom: '8px' }}>Extensive data migration from old platforms</li>
                </>
              )}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <SectionHeader title="Client Responsibilities" />
            <ul style={{ paddingLeft: '20px', color: '#4B5563', lineHeight: 1.8, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Providing timely feedback on milestones within 48 hours.</li>
              <li style={{ marginBottom: '8px' }}>Supplying brand assets, copywriting, or high-res images.</li>
              <li style={{ marginBottom: '8px' }}>Ensuring availability for scheduled check-ins.</li>
              <li style={{ marginBottom: '8px' }}>Providing access to necessary third-party accounts.</li>
            </ul>
          </div>
        </div>

        {/* 8. Cost Summary & 9. Payment Terms */}
        <div className="avoid-break" style={{ marginBottom: '48px' }}>
          <SectionHeader title="Cost Summary" />
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#F9FAFB', color: '#6B7280', padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #E5E7EB' }}>Description</th>
                  <th style={{ backgroundColor: '#F9FAFB', color: '#6B7280', padding: '16px 24px', textAlign: 'right', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #E5E7EB' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', color: '#111827', fontSize: '15px' }}>Total Project Cost</td>
                  <td style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', color: '#111827', fontSize: '15px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(totalCostValue, data.currency)}</td>
                </tr>
                {advanceAmountValue > 0 && (
                  <tr>
                    <td style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '14px' }}>Advance Payment Needed ({data.advancePercent}%)</td>
                    <td style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>-{formatCurrency(advanceAmountValue, data.currency)}</td>
                  </tr>
                )}
                <tr style={{ backgroundColor: '#F0F4FF' }}>
                  <td style={{ padding: '20px 24px', color: '#111827', fontSize: '16px', fontWeight: 800 }}>Remaining Balance (Due before launch)</td>
                  <td style={{ padding: '20px 24px', color: '#3533CD', fontSize: '18px', textAlign: 'right', fontWeight: 800 }}>{formatCurrency(pendingPayment, data.currency)}</td>
                </tr>
                {parseFloat(data.monthlyRetainer) > 0 && (
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <td style={{ padding: '20px 24px', borderTop: '2px solid #E5E7EB', color: '#111827', fontSize: '15px' }}>Monthly Retainer (Post-launch maintenance)</td>
                    <td style={{ padding: '20px 24px', borderTop: '2px solid #E5E7EB', color: '#111827', fontSize: '15px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(data.monthlyRetainer, data.currency)} / month</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '24px', backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #F5C518' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#111827', textTransform: 'uppercase' }}>Payment Terms</h4>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#4B5563', fontSize: '14px', lineHeight: 1.7 }}>
              <li style={{ marginBottom: '6px' }}>An advance payment of <strong>{formatCurrency(advanceAmountValue, data.currency)}</strong> is required to initiate the project.</li>
              <li style={{ marginBottom: '6px' }}>The remaining balance of <strong>{formatCurrency(pendingPayment, data.currency)}</strong> is due upon project completion, prior to final handover.</li>
              {parseFloat(data.monthlyRetainer) > 0 && (
                <li style={{ marginBottom: '6px' }}>A monthly retainer of <strong>{formatCurrency(data.monthlyRetainer, data.currency)}</strong> will be invoiced at the beginning of each month post-launch for ongoing maintenance.</li>
              )}
              <li style={{ marginBottom: '0' }}>Payments are accepted via Bank Transfer, PayPal, or Wise.</li>
            </ul>
          </div>
        </div>

        {/* 10. Support & 11. Notes */}
        <div className="avoid-break" style={{ marginBottom: '48px', display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <SectionHeader title="Complimentary Support" />
            <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
              We provide <strong>30 days of complimentary technical support</strong> post-launch to ensure everything runs smoothly. This covers bug fixes and critical performance issues but does not include new feature development.
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <SectionHeader title="Additional Notes" />
            <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
              {data.specialNotes || 'This project includes up to 2 rounds of revisions during the design phase. Any major scope additions after project initiation may affect timeline and cost.'}
            </p>
          </div>
        </div>

        {/* 12. Signature Page */}
        <div className="avoid-break" style={{ marginTop: '60px' }}>
          <SectionHeader title="Project Acceptance" />
          <p style={{ color: '#4B5563', fontSize: '15px', margin: '0 0 32px 0' }}>
            By signing below, you agree to the scope, timeline, and payment terms outlined in this quotation.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '32px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#3533CD', textTransform: 'uppercase', margin: '0 0 60px 0', letterSpacing: '1px' }}>Accepted By (Client)</p>
              <div style={{ borderBottom: '2px solid #D1D5DB', marginBottom: '16px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#111827', fontWeight: 600 }}>
                <span>{data.clientName}</span>
                <span style={{ color: '#6B7280', fontWeight: 400 }}>Date: ___/___/20__</span>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '32px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#4655F5', textTransform: 'uppercase', margin: '0 0 60px 0', letterSpacing: '1px' }}>Prepared By (Agency)</p>
              <div style={{ borderBottom: '2px solid #D1D5DB', marginBottom: '16px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#111827', fontWeight: 600 }}>
                <span>Webier Studio</span>
                <span style={{ color: '#6B7280', fontWeight: 400 }}>Date: {today}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Print Footer */}
        <div className="print-footer">
          <span style={{ fontWeight: 600, color: '#4655F5' }}>webier<span style={{ color: '#F5C518' }}>.</span></span>
          <span>Proposal & Quotation</span>
          <span>Page <span style={{ counterIncrement: 'page' }}></span></span>
        </div>

      </div>
    </div>
  )
}
