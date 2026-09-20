import { useState } from 'react';
import { Printer, CheckCircle, X, Dumbbell, Send } from 'lucide-react';
import type { Sale } from '../../types/gym';
import { generateReceiptWhatsappUrl } from '../../services/whatsappService';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal = ({ sale, onClose }: ReceiptModalProps) => {
  const [format, setFormat] = useState<'standard' | 'thermal'>('thermal');

  const handlePrint = () => {
    window.print();
  };

  const whatsappUrl = generateReceiptWhatsappUrl(sale);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: format === 'thermal' ? '380px' : '460px', padding: 'var(--space-6)', transition: 'max-width 0.2s ease' }}
      >
        {/* Receipt Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="badge badge-emerald">
              <CheckCircle size={14} />
              Payment Confirmed
            </span>
          </div>

          {/* Toggle standard vs 58mm thermal */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className={`btn btn-sm ${format === 'thermal' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFormat('thermal')}
              style={{ fontSize: '0.72rem', padding: '0 8px' }}
            >
              58mm Roll
            </button>
            <button
              type="button"
              className={`btn btn-sm ${format === 'standard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFormat('standard')}
              style={{ fontSize: '0.72rem', padding: '0 8px' }}
            >
              Standard Slip
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-ghost" 
              style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Physical Printable Receipt Container */}
        <div 
          id="printable-receipt"
          style={{ 
            background: '#ffffff', 
            color: '#000000',
            border: '1px solid #d1d5db', 
            borderRadius: format === 'thermal' ? '0px' : 'var(--radius-md)', 
            padding: format === 'thermal' ? '18px 14px' : 'var(--space-5)',
            fontFamily: 'var(--font-mono)',
            fontSize: format === 'thermal' ? '0.78rem' : '0.85rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            lineHeight: 1.4
          }}
        >
          {/* Gym Header */}
          <div style={{ textAlign: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px dashed #000000' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
              <Dumbbell size={18} color="#000000" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: format === 'thermal' ? '1.1rem' : '1.3rem', letterSpacing: '-0.02em', color: '#000000' }}>
                APEXFORGE GYM
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>
              Metro Fitness Center • Station POS #1
            </div>
            <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>
              Tel: +1 (555) 900-APEX • Tax ID: AFG-9921
            </div>
          </div>

          {/* Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
            <span>Invoice: {sale.invoiceNo}</span>
            <span>{new Date(sale.timestamp).toLocaleDateString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
            <span>Cashier: {sale.cashierName}</span>
            <span>{new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
            Customer: <strong>{sale.customerName}</strong>
          </div>

          {/* Itemized Table */}
          <div style={{ borderTop: '1px dashed #000000', borderBottom: '1px dashed #000000', padding: '6px 0', margin: '6px 0' }}>
            {sale.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ flex: 1, paddingRight: '6px' }}>
                  <div style={{ fontWeight: 700 }}>{item.productName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>
                    {item.quantity} x ${item.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Discount:</span>
                <span>-${sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tax (8%):</span>
              <span>${sale.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, borderTop: '1px solid #000000', paddingTop: '4px', marginTop: '2px' }}>
              <span>TOTAL:</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div style={{ background: '#f3f4f6', padding: '6px', borderRadius: '4px', fontSize: '0.74rem', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Payment Type:</span>
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{sale.paymentMethod}</span>
            </div>
            {sale.cashReceived !== undefined && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cash Tendered:</span>
                  <span>${sale.cashReceived.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Change Given:</span>
                  <span>${(sale.changeGiven || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Barcode Graphic on Thermal Paper */}
          <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '6px', borderTop: '1px dashed #9ca3af' }}>
            <div style={{ display: 'flex', height: '36px', justifyContent: 'center', gap: '2px', alignItems: 'stretch', marginBottom: '4px' }}>
              {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1].map((w, i) => (
                <div key={i} style={{ width: `${w * 1.5}px`, background: '#000000' }} />
              ))}
            </div>
            <div style={{ fontSize: '0.68rem', letterSpacing: '0.15em' }}>{sale.invoiceNo}</div>
            <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '4px' }}>
              Train Hard • Recover Smart • ApexForge.gym
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary" onClick={handlePrint} style={{ flex: 1 }}>
              <Printer size={15} />
              Print ({format === 'thermal' ? '58mm Roll' : 'Standard'})
            </button>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-emerald" 
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <Send size={15} />
              Send WhatsApp
            </a>
          </div>

          <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Done / Next Sale
          </button>
        </div>
      </div>
    </div>
  );
};
