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

  // Limit items to prevent overflow
  const displayItems = (items || []).slice(0, 8)

  return (
    <div 
      ref={ref}
      style={{
        width: '210mm',
        height: '297mm',
        padding: '8mm 10mm',
        background: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#1e293b',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontSize: '9px'
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
        marginBottom: '6px', 
        borderBottom: '1.5px solid #0D5F89', 
        paddingBottom: '5px',
        paddingTop: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: '34px', height: '34px', objectFit: 'contain' }}
              onError={(e) => { 
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<span style="color:#1e293b;font-weight:bold;font-size:16px">NG</span>'
              }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0', letterSpacing: '0.5px' }}>
              NDANDULENI GROUP
            </h1>
            <p style={{ fontSize: '9px', color: '#64748b', margin: '1px 0', fontStyle: 'italic' }}>
              Innovation Without End
            </p>
            <p style={{ fontSize: '7.5px', color: '#64748b', margin: '0' }}>
              2220 Manthata Str, Ivory Park
            </p>
            <p style={{ fontSize: '7.5px', color: '#64748b', margin: '0' }}>
              Tel: 070 419 9457 | accounts@ndandulenigroup.co.za
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: '0', letterSpacing: '2px' }}>
            QUOTATION
          </h2>
          <div style={{
            marginTop: '3px',
            padding: '3px 10px',
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            <p style={{ fontSize: '12px', color: '#ffffff', margin: '0', fontWeight: 'bold' }}>
              {quotation?.quotation_number || 'Q-25-0001'}
            </p>
          </div>
          <div style={{ marginTop: '5px', fontSize: '8px', color: '#64748b' }}>
            <p style={{ margin: '1px 0' }}>Date: {formatDate(quotation?.quotation_date || new Date())}</p>
            <p style={{ margin: '1px 0' }}>Valid Until: {formatDate(quotation?.valid_until)}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div style={{ marginBottom: '6px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '8px', fontWeight: 'bold', color: '#093047', textTransform: 'uppercase', marginBottom: '2px', borderBottom: '1px solid #0D5F89', paddingBottom: '1px' }}>
            Bill To:
          </h3>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>
            {quotation?.client_name || 'Client Name'}
          </p>
          {quotation?.client_email && (
            <p style={{ fontSize: '8px', color: '#64748b', margin: '1px 0' }}>{quotation.client_email}</p>
          )}
          {quotation?.client_phone && (
            <p style={{ fontSize: '8px', color: '#64748b', margin: '1px 0' }}>{quotation.client_phone}</p>
          )}
          {quotation?.client_address && (
            <p style={{ fontSize: '8px', color: '#64748b', margin: '1px 0' }}>{quotation.client_address}</p>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '8px', fontWeight: 'bold', color: '#093047', textTransform: 'uppercase', marginBottom: '2px', borderBottom: '1px solid #0D5F89', paddingBottom: '1px' }}>
            Payment Terms:
          </h3>
          <p style={{ fontSize: '10px', color: '#1e293b', margin: '0' }}>
            {quotation?.payment_terms || '50% Deposit, Balance on Completion'}
          </p>
          <p style={{ fontSize: '7.5px', color: '#64748b', margin: '2px 0' }}>EFT & Card only (no cash)</p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
        <thead>
          <tr style={{ 
            background: 'linear-gradient(90deg, #093047 0%, #0D5F89 100%)',
            color: 'white'
          }}>
            <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: '8px', fontWeight: 'bold', width: '5%' }}>#</th>
            <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: '8px', fontWeight: 'bold', width: '48%' }}>Description</th>
            <th style={{ padding: '4px 6px', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', width: '8%' }}>Qty</th>
            <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: '8px', fontWeight: 'bold', width: '17%' }}>Unit Price</th>
            <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: '8px', fontWeight: 'bold', width: '22%' }}>Total (Excl. VAT)</th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, index) => (
            <tr key={item.id || index} style={{ 
              borderBottom: '1px solid #e2e8f0'
            }}>
              <td style={{ padding: '3px 6px', fontSize: '8px', color: '#64748b' }}>{index + 1}</td>
              <td style={{ padding: '3px 6px', fontSize: '8px', color: '#1e293b', fontWeight: '500' }}>
                {item.description || 'Service'}
              </td>
              <td style={{ padding: '3px 6px', fontSize: '8px', color: '#1e293b', textAlign: 'center' }}>{item.quantity || 1}</td>
              <td style={{ padding: '3px 6px', fontSize: '8px', color: '#1e293b', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
              <td style={{ padding: '3px 6px', fontSize: '8px', color: '#1e293b', textAlign: 'right', fontWeight: '600' }}>
                {formatCurrency(item.total_price || (item.quantity * item.unit_price))}
              </td>
            </tr>
          ))}
          {(items || []).length > 8 && (
            <tr>
              <td colSpan="5" style={{ padding: '3px 6px', fontSize: '8px', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
                + {items.length - 8} more items (see attached)
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
        <div style={{ width: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e2e8f0', fontSize: '8px' }}>
            <span style={{ color: '#64748b' }}>Subtotal (Excl. VAT):</span>
            <span style={{ color: '#1e293b', fontWeight: '500' }}>{formatCurrency(quotation?.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e2e8f0', fontSize: '8px' }}>
            <span style={{ color: '#64748b' }}>VAT (15%):</span>
            <span style={{ color: '#1e293b' }}>{formatCurrency(quotation?.tax_amount)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '7px 10px', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
            marginTop: '3px', 
            borderRadius: '5px',
            color: 'white'
          }}>
            <span>TOTAL (Incl. VAT):</span>
            <span style={{ fontSize: '13px' }}>{formatCurrency(quotation?.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* VAT Notice */}
      <div style={{ 
        marginBottom: '4px', 
        padding: '3px 8px', 
        background: '#f1f5f9', 
        borderRadius: '4px',
        border: '1px dashed #cbd5e1',
        fontSize: '7.5px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        ⚠ All prices exclude VAT. VAT is calculated at 15% and added to the final amount.
      </div>

      {/* Terms & Conditions */}
      <div style={{ marginBottom: '4px' }}>
        <h3 style={{ 
          fontSize: '8px', 
          fontWeight: 'bold', 
          color: '#093047', 
          textTransform: 'uppercase', 
          marginBottom: '2px', 
          borderBottom: '1px solid #0D5F89', 
          paddingBottom: '1px'
        }}>
          Terms & Conditions
        </h3>
        <div style={{ fontSize: '7px', color: '#475569', lineHeight: '1.4', display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#1e293b' }}>Deposit & Payment:</p>
            <ul style={{ margin: '0', paddingLeft: '12px' }}>
              <li>50% deposit required to secure booking</li>
              <li>Balance payable upon completion</li>
              <li>Payment methods: EFT and card (no cash)</li>
            </ul>
            <p style={{ margin: '3px 0 2px 0', fontWeight: 'bold', color: '#1e293b' }}>Cancellation:</p>
            <ul style={{ margin: '0', paddingLeft: '12px' }}>
              <li>24-hour notice required for full refund</li>
              <li>Rescheduling subject to availability</li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#1e293b' }}>Client Responsibilities:</p>
            <ul style={{ margin: '0', paddingLeft: '12px' }}>
              <li>Provide access to premises</li>
              <li>Ensure pets are secured or removed</li>
              <li>Remove clutter and obstacles</li>
            </ul>
            <div style={{ 
              marginTop: '6px', 
              padding: '5px 8px', 
              background: 'linear-gradient(135deg, #093047 0%, #0D5F89 100%)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '7.5px',
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
        bottom: '8mm', 
        left: '10mm', 
        right: '10mm', 
        borderTop: '1px solid #e2e8f0', 
        paddingTop: '4px', 
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '7px', color: '#64748b', margin: '0' }}>
          <strong style={{ color: '#1e293b' }}>Ndanduleni Group (Pty) Ltd</strong> | 2220 Manthata Str, Ivory Park | Tel: 070 419 9457 | accounts@ndandulenigroup.co.za
        </p>
        <p style={{ fontSize: '6.5px', color: '#94a3b8', margin: '1px 0' }}>
          This quotation is valid for 30 days. All prices exclude VAT. VAT will be added at 15%.
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
