import { forwardRef } from 'react'

const QuotationPDF = forwardRef(({ quotation, items, companyInfo }, ref) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  const displayItems = (items || []).slice(0, 6)

  return (
    <div 
      ref={ref}
      style={{
        width: '210mm',
        height: '297mm',
        padding: '10mm 12mm 12mm 12mm',
        background: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#1e293b',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Top gradient bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #093047 0%, #0D5F89 50%, #0a8cc5 100%)'
      }}></div>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '8px', 
        borderBottom: '1.5px solid #0D5F89', 
        paddingBottom: '8px',
        paddingTop: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            flexShrink: 0
          }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: '37px', height: '37px', objectFit: 'contain' }}
              onError={(e) => { 
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<span style="color:#1e293b;font-weight:bold;font-size:16px">NG</span>'
              }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>
              NDANDULENI GROUP
            </h1>
            <p style={{ fontSize: '9px', color: '#64748b', margin: '2px 0', fontStyle: 'italic' }}>
              Innovation Without End
            </p>
            <p style={{ fontSize: '8px', color: '#64748b', margin: '0', lineHeight: '1.3' }}>
              2220 Manthata Str, Ivory Park<br/>
              Tel: 070 419 9457 | accounts@ndandulenigroup.co.za
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '0', letterSpacing: '2px' }}>
            QUOTATION
          </h2>
          <div style={{
            marginTop: '4px',
            padding: '4px 12px',
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            <p style={{ fontSize: '13px', color: '#ffffff', margin: '0', fontWeight: 'bold' }}>
              {quotation?.quotation_number || 'Q-25-0001'}
            </p>
          </div>
          <div style={{ marginTop: '6px', fontSize: '8px', color: '#64748b' }}>
            <p style={{ margin: '1px 0' }}>Date: {formatDate(quotation?.quotation_date || new Date())}</p>
            <p style={{ margin: '1px 0' }}>Valid Until: {formatDate(quotation?.valid_until)}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '25px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '9px', fontWeight: 'bold', color: '#093047', textTransform: 'uppercase', marginBottom: '3px', borderBottom: '1px solid #0D5F89', paddingBottom: '2px' }}>
            Bill To:
          </h3>
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>
            {quotation?.client_name || 'Client Name'}
          </p>
          {quotation?.client_email && (
            <p style={{ fontSize: '9px', color: '#64748b', margin: '1px 0' }}>{quotation.client_email}</p>
          )}
          {quotation?.client_phone && (
            <p style={{ fontSize: '9px', color: '#64748b', margin: '1px 0' }}>{quotation.client_phone}</p>
          )}
          {quotation?.client_address && (
            <p style={{ fontSize: '9px', color: '#64748b', margin: '1px 0', lineHeight: '1.3' }}>{quotation.client_address}</p>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '9px', fontWeight: 'bold', color: '#093047', textTransform: 'uppercase', marginBottom: '3px', borderBottom: '1px solid #0D5F89', paddingBottom: '2px' }}>
            Payment Terms:
          </h3>
          <p style={{ fontSize: '10px', color: '#1e293b', margin: '0', fontWeight: '500' }}>
            {quotation?.payment_terms || '50% Deposit, Balance on Completion'}
          </p>
          <p style={{ fontSize: '8px', color: '#64748b', margin: '3px 0' }}>EFT & Card payments accepted</p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead>
          <tr style={{ 
            background: 'linear-gradient(90deg, #093047 0%, #0D5F89 100%)',
            color: 'white'
          }}>
            <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: '9px', fontWeight: 'bold', borderRadius: '4px 0 0 0' }}>#</th>
            <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: '9px', fontWeight: 'bold' }}>Description</th>
            <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Qty</th>
            <th style={{ padding: '5px 8px', textAlign: 'right', fontSize: '9px', fontWeight: 'bold' }}>Unit Price</th>
            <th style={{ padding: '5px 8px', textAlign: 'right', fontSize: '9px', fontWeight: 'bold', borderRadius: '0 4px 0 0' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, index) => (
            <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 8px', fontSize: '9px', color: '#64748b' }}>{index + 1}</td>
              <td style={{ padding: '4px 8px', fontSize: '9px', color: '#1e293b', fontWeight: '500' }}>
                {item.description || 'Service'}
              </td>
              <td style={{ padding: '4px 8px', fontSize: '9px', color: '#1e293b', textAlign: 'center' }}>{item.quantity || 1}</td>
              <td style={{ padding: '4px 8px', fontSize: '9px', color: '#1e293b', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
              <td style={{ padding: '4px 8px', fontSize: '9px', color: '#1e293b', textAlign: 'right', fontWeight: '600' }}>
                {formatCurrency(item.total_price || (item.quantity * item.unit_price))}
              </td>
            </tr>
          ))}
          {(items || []).length > 6 && (
            <tr>
              <td colSpan="5" style={{ padding: '4px 8px', fontSize: '8px', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
                + {items.length - 6} additional items on file
              </td>
            </tr>
          )}
          {/* Empty rows for spacing if fewer items */}
          {displayItems.length < 3 && [...Array(3 - displayItems.length)].map((_, i) => (
            <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 8px' }}>&nbsp;</td>
              <td style={{ padding: '4px 8px' }}></td>
              <td style={{ padding: '4px 8px' }}></td>
              <td style={{ padding: '4px 8px' }}></td>
              <td style={{ padding: '4px 8px' }}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <div style={{ width: '230px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0', fontSize: '9px' }}>
            <span style={{ color: '#64748b' }}>Subtotal:</span>
            <span style={{ color: '#1e293b', fontWeight: '500' }}>{formatCurrency(quotation?.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0', fontSize: '9px' }}>
            <span style={{ color: '#64748b' }}>VAT (15%):</span>
            <span style={{ color: '#1e293b' }}>{formatCurrency(quotation?.tax_amount)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '8px 12px', 
            fontSize: '13px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
            marginTop: '4px', 
            borderRadius: '6px',
            color: 'white'
          }}>
            <span>TOTAL:</span>
            <span style={{ fontSize: '15px' }}>{formatCurrency(quotation?.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div>
        <h3 style={{ 
          fontSize: '9px', 
          fontWeight: 'bold', 
          color: '#093047', 
          textTransform: 'uppercase', 
          marginBottom: '4px', 
          borderBottom: '1px solid #0D5F89', 
          paddingBottom: '2px'
        }}>
          Terms & Conditions
        </h3>
        <div style={{ fontSize: '7.5px', color: '#475569', lineHeight: '1.5', display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#1e293b' }}>Deposit & Payment:</p>
            <ul style={{ margin: '0', paddingLeft: '14px' }}>
              <li>50% deposit required to secure booking</li>
              <li>Balance payable upon completion</li>
              <li>Payment methods: EFT and card (no cash)</li>
            </ul>
            <p style={{ margin: '5px 0 3px 0', fontWeight: 'bold', color: '#1e293b' }}>Cancellation & Rescheduling:</p>
            <ul style={{ margin: '0', paddingLeft: '14px' }}>
              <li>24-hour notice required for full refund</li>
              <li>Rescheduling subject to availability</li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#1e293b' }}>Client Responsibilities:</p>
            <ul style={{ margin: '0', paddingLeft: '14px' }}>
              <li>Provide access to premises</li>
              <li>Ensure pets are secured or removed</li>
              <li>Remove clutter and obstacles</li>
            </ul>
            <div style={{ 
              marginTop: '10px', 
              padding: '6px 10px', 
              background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
              borderRadius: '5px',
              color: 'white',
              fontSize: '8px',
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
        left: '12mm', 
        right: '12mm', 
        borderTop: '1px solid #e2e8f0', 
        paddingTop: '5px', 
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '7px', color: '#64748b', margin: '0' }}>
          <strong style={{ color: '#1e293b' }}>Ndanduleni Group (Pty) Ltd</strong> | 2220 Manthata Str, Ivory Park | Tel: 070 419 9457 | accounts@ndandulenigroup.co.za
        </p>
        <p style={{ fontSize: '6.5px', color: '#94a3b8', margin: '1px 0' }}>
          Quotation valid for 30 days. Thank you for your business.
        </p>
      </div>

      {/* Bottom gradient bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #093047 0%, #0D5F89 50%, #0a8cc5 100%)'
      }}></div>
    </div>
  )
})

QuotationPDF.displayName = 'QuotationPDF'

export default QuotationPDF
