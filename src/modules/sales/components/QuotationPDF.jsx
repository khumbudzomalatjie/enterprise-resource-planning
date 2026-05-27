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
        background: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#1e293b',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontSize: '11px'
      }}
    >
      {/* Top gradient bar - DESIGN ONLY */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: 'linear-gradient(90deg, #093047 0%, #0D5F89 50%, #0a8cc5 100%)'
      }}></div>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '12px', 
        borderBottom: '2px solid #0D5F89', 
        paddingBottom: '10px',
        paddingTop: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logo - NO BLUE OVERLAY */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: '50px', height: '50px', objectFit: 'contain' }}
              onError={(e) => { 
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<span style="color:#1e293b;font-weight:bold;font-size:20px">NG</span>'
              }}
            />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: '0',
              letterSpacing: '1px'
            }}>
              NDANDULENI GROUP
            </h1>
            <p style={{ 
              fontSize: '11px', 
              color: '#64748b', 
              margin: '3px 0', 
              fontStyle: 'italic',
              fontWeight: '500'
            }}>
              Innovation Without End
            </p>
            <p style={{ fontSize: '9px', color: '#64748b', margin: '0' }}>
              2220 Manthata Str, Ivory Park
            </p>
            <p style={{ fontSize: '9px', color: '#64748b', margin: '1px 0' }}>
              Tel: 070 419 9457 | Email: accounts@ndandulenigroup.co.za
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ 
            fontSize: '26px', 
            fontWeight: 'bold', 
            color: '#1e293b',
            margin: '0', 
            letterSpacing: '3px',
            textTransform: 'uppercase'
          }}>
            Quotation
          </h2>
          {/* Quotation Number - Blue pill DESIGN ONLY */}
          <div style={{
            marginTop: '6px',
            padding: '5px 14px',
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
            borderRadius: '6px',
            display: 'inline-block'
          }}>
            <p style={{ fontSize: '15px', color: '#ffffff', margin: '0', fontWeight: 'bold', letterSpacing: '1px' }}>
              {quotation?.quotation_number || 'Q-25-0001'}
            </p>
          </div>
          <div style={{ marginTop: '10px', fontSize: '9px', color: '#64748b' }}>
            <p style={{ margin: '2px 0' }}>Date: {formatDate(quotation?.quotation_date || new Date())}</p>
            <p style={{ margin: '2px 0' }}>Valid Until: {formatDate(quotation?.valid_until)}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div style={{ marginBottom: '12px', display: 'flex', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: '#093047', 
            textTransform: 'uppercase', 
            marginBottom: '5px',
            letterSpacing: '1px',
            borderBottom: '1px solid #0D5F89',
            paddingBottom: '3px'
          }}>
            Bill To:
          </h3>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>
            {quotation?.client_name || 'Client Name'}
          </p>
          {quotation?.client_email && (
            <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0' }}>{quotation.client_email}</p>
          )}
          {quotation?.client_phone && (
            <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0' }}>{quotation.client_phone}</p>
          )}
          {quotation?.client_address && (
            <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0', whiteSpace: 'pre-line' }}>{quotation.client_address}</p>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: '#093047', 
            textTransform: 'uppercase', 
            marginBottom: '5px',
            letterSpacing: '1px',
            borderBottom: '1px solid #0D5F89',
            paddingBottom: '3px'
          }}>
            Payment Terms:
          </h3>
          <p style={{ fontSize: '12px', color: '#1e293b', margin: '0', fontWeight: '500' }}>
            {quotation?.payment_terms || '50% Deposit, Balance on Completion'}
          </p>
          <p style={{ fontSize: '9px', color: '#64748b', margin: '4px 0' }}>
            Payment methods: EFT and card (no cash)
          </p>
        </div>
      </div>

      {/* Items Table - Blue header DESIGN ONLY */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr style={{ 
            background: 'linear-gradient(90deg, #093047 0%, #0D5F89 100%)',
            color: 'white'
          }}>
            <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', borderRadius: '6px 0 0 0' }}>#</th>
            <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold' }}>Description</th>
            <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>Qty</th>
            <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold' }}>Unit Price</th>
            <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', borderRadius: '0 6px 0 0' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item, index) => (
            <tr key={item.id || index} style={{ 
              borderBottom: '1px solid #e2e8f0',
              background: index % 2 === 0 ? '#f8fafc' : '#ffffff'
            }}>
              <td style={{ padding: '7px 10px', fontSize: '10px', color: '#64748b' }}>{index + 1}</td>
              <td style={{ padding: '7px 10px', fontSize: '10px', color: '#1e293b' }}>
                <p style={{ margin: '0', fontWeight: '500' }}>{item.description || 'Service'}</p>
              </td>
              <td style={{ padding: '7px 10px', fontSize: '10px', color: '#1e293b', textAlign: 'center' }}>{item.quantity || 1}</td>
              <td style={{ padding: '7px 10px', fontSize: '10px', color: '#1e293b', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
              <td style={{ padding: '7px 10px', fontSize: '10px', color: '#1e293b', textAlign: 'right', fontWeight: '600' }}>
                {formatCurrency(item.total_price || (item.quantity * item.unit_price))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals - Blue DESIGN ONLY on total box */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <div style={{ width: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #e2e8f0', fontSize: '10px' }}>
            <span style={{ color: '#64748b' }}>Subtotal (Excl. VAT):</span>
            <span style={{ color: '#1e293b', fontWeight: '500' }}>{formatCurrency(quotation?.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #e2e8f0', fontSize: '10px' }}>
            <span style={{ color: '#64748b' }}>VAT (15%):</span>
            <span style={{ color: '#1e293b' }}>{formatCurrency(quotation?.tax_amount)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px 14px', 
            fontSize: '15px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
            marginTop: '5px', 
            borderRadius: '8px',
            color: 'white',
            boxShadow: '0 3px 10px rgba(9,48,71,0.25)'
          }}>
            <span>TOTAL (Incl. VAT):</span>
            <span style={{ fontSize: '17px' }}>{formatCurrency(quotation?.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* VAT Notice */}
      <div style={{ 
        marginBottom: '10px', 
        padding: '5px 10px', 
        background: '#f1f5f9', 
        borderRadius: '6px',
        border: '1px dashed #cbd5e1',
        fontSize: '9px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        ⚠ All prices exclude VAT. VAT is calculated at 15% and added to the final amount.
      </div>

      {/* Terms & Conditions */}
      <div style={{ marginBottom: '8px' }}>
        <h3 style={{ 
          fontSize: '10px', 
          fontWeight: 'bold', 
          color: '#093047', 
          textTransform: 'uppercase', 
          marginBottom: '4px', 
          borderBottom: '1px solid #0D5F89', 
          paddingBottom: '3px',
          letterSpacing: '1px'
        }}>
          Terms & Conditions
        </h3>
        <div style={{ fontSize: '8.5px', color: '#475569', lineHeight: '1.5', display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#1e293b' }}>Deposit & Payment:</p>
            <ul style={{ margin: '0', paddingLeft: '15px' }}>
              <li>50% deposit required to secure booking</li>
              <li>Balance payable upon completion</li>
              <li>Payment methods: EFT and card (no cash)</li>
            </ul>
            <p style={{ margin: '6px 0 4px 0', fontWeight: 'bold', color: '#1e293b' }}>Cancellation & Rescheduling:</p>
            <ul style={{ margin: '0', paddingLeft: '15px' }}>
              <li>24-hour notice required for full refund</li>
              <li>Rescheduling subject to availability</li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#1e293b' }}>Client Responsibilities:</p>
            <ul style={{ margin: '0', paddingLeft: '15px' }}>
              <li>Provide access to premises</li>
              <li>Ensure pets are secured or removed</li>
              <li>Remove clutter and obstacles</li>
            </ul>
            <div style={{ 
              marginTop: '10px', 
              padding: '7px 12px', 
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
        borderTop: '2px solid #e2e8f0', 
        paddingTop: '8px', 
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '8px', color: '#64748b', margin: '0' }}>
          <strong style={{ color: '#1e293b' }}>Ndanduleni Group (Pty) Ltd</strong> | 2220 Manthata Str, Ivory Park | Tel: 070 419 9457 | accounts@ndandulenigroup.co.za
        </p>
        <p style={{ fontSize: '8px', color: '#94a3b8', margin: '2px 0' }}>
          This quotation is valid for 30 days. All prices exclude VAT. VAT will be added at 15%.
        </p>
      </div>

      {/* Bottom gradient bar - DESIGN ONLY */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #093047 0%, #0D5F89 50%, #0a8cc5 100%)'
      }}></div>

      {/* Watermark - Very light */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%) rotate(-30deg)',
        fontSize: '70px',
        color: 'rgba(226,232,240,0.3)',
        fontWeight: 'bold',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        letterSpacing: '8px'
      }}>
        NDANDULENI
      </div>
    </div>
  )
})

QuotationPDF.displayName = 'QuotationPDF'

export default QuotationPDF
