import { forwardRef } from 'react'

const QuotationPDF = forwardRef(({ quotation, items, companyInfo }, ref) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div 
      ref={ref}
      style={{
        width: '210mm',
        height: '297mm',
        padding: '12mm 15mm',
        background: 'linear-gradient(180deg, #ffffff 0%, #f0f7fc 100%)',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#1e293b',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontSize: '11px'
      }}
    >
      {/* Top gradient bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '8px',
        background: 'linear-gradient(90deg, #093047 0%, #0D5F89 50%, #0a8cc5 100%)'
      }}></div>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '10px', 
        borderBottom: '2px solid #0D5F89', 
        paddingBottom: '8px',
        paddingTop: '8px',
        background: 'linear-gradient(180deg, rgba(9,48,71,0.03) 0%, rgba(13,95,137,0.02) 100%)',
        margin: '-12mm -15mm 10px -15mm',
        padding: '14mm 15mm 8px 15mm'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '55px',
            height: '55px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 50%, #0a8cc5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(9,48,71,0.3)',
            overflow: 'hidden'
          }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: '45px', height: '45px', objectFit: 'contain' }}
              onError={(e) => { 
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<span style="color:white;font-weight:bold;font-size:18px">NG</span>'
              }}
            />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              background: 'linear-gradient(90deg, #093047 0%, #0D5F89 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0',
              letterSpacing: '1px'
            }}>
              NDANDULENI GROUP
            </h1>
            <p style={{ 
              fontSize: '10px', 
              color: '#0D5F89', 
              margin: '2px 0', 
              fontStyle: 'italic',
              fontWeight: '500'
            }}>
              Innovation Without End
            </p>
            <p style={{ fontSize: '9px', color: '#475569', margin: '0' }}>
              2220 Manthata Str, Ivory Park
            </p>
            <p style={{ fontSize: '9px', color: '#475569', margin: '1px 0' }}>
              Tel: 070 419 9457 | Email: accounts@ndandulenigroup.co.za
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #093047 0%, #0a8cc5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0', 
            letterSpacing: '3px',
            textTransform: 'uppercase'
          }}>
            Quotation
          </h2>
          <div style={{
            marginTop: '5px',
            padding: '4px 12px',
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
            borderRadius: '6px',
            display: 'inline-block'
          }}>
            <p style={{ fontSize: '14px', color: '#ffffff', margin: '0', fontWeight: 'bold', letterSpacing: '1px' }}>
              {quotation?.quotation_number || 'Q-25-0001'}
            </p>
          </div>
          <div style={{ marginTop: '8px', fontSize: '9px', color: '#475569' }}>
            <p style={{ margin: '1px 0' }}>Date: {formatDate(quotation?.quotation_date || new Date())}</p>
            <p style={{ margin: '1px 0' }}>Valid Until: {formatDate(quotation?.valid_until)}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: '#093047', 
            textTransform: 'uppercase', 
            marginBottom: '4px',
            letterSpacing: '1px',
            borderBottom: '1px solid #0D5F89',
            paddingBottom: '2px'
          }}>
            Bill To:
          </h3>
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: '0' }}>
            {quotation?.client_name || 'Client Name'}
          </p>
          {quotation?.client_email && (
            <p style={{ fontSize: '10px', color: '#475569', margin: '1px 0' }}>{quotation.client_email}</p>
          )}
          {quotation?.client_phone && (
            <p style={{ fontSize: '10px', color: '#475569', margin: '1px 0' }}>{quotation.client_phone}</p>
          )}
          {quotation?.client_address && (
            <p style={{ fontSize: '10px', color: '#475569', margin: '1px 0', whiteSpace: 'pre-line' }}>{quotation.client_address}</p>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: '#093047', 
            textTransform: 'uppercase', 
            marginBottom: '4px',
            letterSpacing: '1px',
            borderBottom: '1px solid #0D5F89',
            paddingBottom: '2px'
          }}>
            Payment Terms:
          </h3>
          <p style={{ fontSize: '11px', color: '#0f172a', margin: '0', fontWeight: '500' }}>
            {quotation?.payment_terms || '50% Deposit, Balance on Completion'}
          </p>
          <p style={{ fontSize: '9px', color: '#64748b', margin: '3px 0' }}>
            Payment methods: EFT and card (no cash)
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead>
          <tr style={{ 
            background: 'linear-gradient(90deg, #093047 0%, #0D5F89 100%)',
            color: 'white'
          }}>
            <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', borderRadius: '6px 0 0 0' }}>#</th>
            <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold' }}>Description</th>
            <th style={{ padding: '7px 8px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>Qty</th>
            <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold' }}>Unit Price</th>
            <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', borderRadius: '0 6px 0 0' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item, index) => (
            <tr key={item.id || index} style={{ 
              borderBottom: '1px solid #cbd5e1',
              background: index % 2 === 0 ? 'rgba(13,95,137,0.02)' : 'transparent'
            }}>
              <td style={{ padding: '6px 8px', fontSize: '10px', color: '#475569' }}>{index + 1}</td>
              <td style={{ padding: '6px 8px', fontSize: '10px', color: '#0f172a' }}>
                <p style={{ margin: '0', fontWeight: '500' }}>{item.description || 'Service'}</p>
              </td>
              <td style={{ padding: '6px 8px', fontSize: '10px', color: '#0f172a', textAlign: 'center' }}>{item.quantity || 1}</td>
              <td style={{ padding: '6px 8px', fontSize: '10px', color: '#0f172a', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
              <td style={{ padding: '6px 8px', fontSize: '10px', color: '#0f172a', textAlign: 'right', fontWeight: '600' }}>
                {formatCurrency(item.total_price || (item.quantity * item.unit_price))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #cbd5e1', fontSize: '10px' }}>
            <span style={{ color: '#475569' }}>Subtotal (Excl. VAT):</span>
            <span style={{ color: '#0f172a', fontWeight: '500' }}>{formatCurrency(quotation?.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #cbd5e1', fontSize: '10px' }}>
            <span style={{ color: '#475569' }}>VAT (15%):</span>
            <span style={{ color: '#0f172a' }}>{formatCurrency(quotation?.tax_amount)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '10px 12px', 
            fontSize: '14px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
            marginTop: '4px', 
            borderRadius: '8px',
            color: 'white',
            boxShadow: '0 2px 8px rgba(9,48,71,0.3)'
          }}>
            <span>TOTAL (Incl. VAT):</span>
            <span style={{ fontSize: '16px' }}>{formatCurrency(quotation?.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* VAT Notice */}
      <div style={{ 
        marginBottom: '8px', 
        padding: '6px 10px', 
        background: 'rgba(13,95,137,0.05)', 
        borderRadius: '6px',
        border: '1px dashed #0D5F89',
        fontSize: '9px',
        color: '#093047',
        textAlign: 'center'
      }}>
        ⚠ All prices exclude VAT. VAT is calculated at 15% and added to the final amount.
      </div>

      {/* Terms & Conditions */}
      <div style={{ marginBottom: '6px' }}>
        <h3 style={{ 
          fontSize: '10px', 
          fontWeight: 'bold', 
          color: '#093047', 
          textTransform: 'uppercase', 
          marginBottom: '3px', 
          borderBottom: '1px solid #0D5F89', 
          paddingBottom: '2px',
          letterSpacing: '1px'
        }}>
          Terms & Conditions
        </h3>
        <div style={{ fontSize: '8.5px', color: '#475569', lineHeight: '1.4', display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#093047' }}>Deposit & Payment:</p>
            <ul style={{ margin: '0', paddingLeft: '15px' }}>
              <li>50% deposit required to secure booking</li>
              <li>Balance payable upon completion</li>
              <li>Payment methods: EFT and card (no cash)</li>
            </ul>
            <p style={{ margin: '5px 0 3px 0', fontWeight: 'bold', color: '#093047' }}>Cancellation & Rescheduling:</p>
            <ul style={{ margin: '0', paddingLeft: '15px' }}>
              <li>24-hour notice required for full refund</li>
              <li>Rescheduling subject to availability</li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#093047' }}>Client Responsibilities:</p>
            <ul style={{ margin: '0', paddingLeft: '15px' }}>
              <li>Provide access to premises</li>
              <li>Ensure pets are secured or removed</li>
              <li>Remove clutter and obstacles</li>
            </ul>
            <div style={{ 
              marginTop: '8px', 
              padding: '6px 10px', 
              background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '9px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              ✓ 100% Satisfaction Guaranteed
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        position: 'absolute', 
        bottom: '10mm', 
        left: '15mm', 
        right: '15mm', 
        borderTop: '2px solid #0D5F89', 
        paddingTop: '6px', 
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '8px', color: '#475569', margin: '0' }}>
          <strong style={{ color: '#093047' }}>Ndanduleni Group (Pty) Ltd</strong> | 2220 Manthata Str, Ivory Park | Tel: 070 419 9457 | accounts@ndandulenigroup.co.za
        </p>
        <p style={{ fontSize: '8px', color: '#64748b', margin: '2px 0' }}>
          This quotation is valid for 30 days. All prices exclude VAT. VAT will be added at 15%.
        </p>
      </div>

      {/* Bottom gradient bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #093047 0%, #0D5F89 50%, #0a8cc5 100%)'
      }}></div>

      {/* Watermark */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%) rotate(-30deg)',
        fontSize: '80px',
        color: 'rgba(9,48,71,0.02)',
        fontWeight: 'bold',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        letterSpacing: '5px'
      }}>
        NDANDULENI GROUP
      </div>
    </div>
  )
})

QuotationPDF.displayName = 'QuotationPDF'

export default QuotationPDF
