import React, { useState } from 'react';
import { Clock, Lock, CheckCircle2, X, ShieldAlert } from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { CashShift } from '../../types/gym';

interface CashShiftModalProps {
  onClose: () => void;
}

export const CashShiftModal: React.FC<CashShiftModalProps> = ({ onClose }) => {
  const currentShift = gymStore.getShift();
  const [actualCash, setActualCash] = useState<string>(currentShift.expectedCash.toString());
  const [notes, setNotes] = useState(currentShift.notes || '');
  const [closedSummary, setClosedSummary] = useState<CashShift | null>(null);

  const numActual = parseFloat(actualCash) || 0;
  const diff = +(numActual - currentShift.expectedCash).toFixed(2);

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const result = gymStore.closeShift(numActual, notes);
    setClosedSummary(result);
  };

  const handleStartNewShift = () => {
    gymStore.openShift(200.00, 'Front Desk Admin');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px', padding: 'var(--space-6)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className={`badge ${currentShift.status === 'open' ? 'badge-emerald' : 'badge-amber'}`}>
              <Clock size={13} />
              Shift: {currentShift.status.toUpperCase()}
            </span>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <h2 style={{ marginBottom: 'var(--space-2)' }}>Cash Register Drawer</h2>
        <p style={{ fontSize: '0.88rem', marginBottom: 'var(--space-5)' }}>
          Reconcile cash drawer, track opening float, and perform end-of-shift balancing.
        </p>

        {closedSummary ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div 
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid var(--color-emerald)', 
                borderRadius: 'var(--radius-lg)', 
                padding: 'var(--space-5)',
                textAlign: 'center'
              }}
            >
              <CheckCircle2 size={40} color="var(--color-emerald)" style={{ margin: '0 auto var(--space-2)' }} />
              <h3>Shift Successfully Closed</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                Cash drawer reconciled at {new Date(closedSummary.endTime!).toLocaleTimeString()}.
              </p>
            </div>

            <div className="surface-elevated" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Opening Float:</span>
                <span style={{ fontWeight: 600 }}>${closedSummary.openingFloat.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Expected Cash:</span>
                <span style={{ fontWeight: 600 }}>${closedSummary.expectedCash.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Actual Counted Cash:</span>
                <span style={{ fontWeight: 600 }}>${(closedSummary.actualCash || 0).toFixed(2)}</span>
              </div>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  borderTop: '1px solid var(--border-medium)', 
                  paddingTop: 'var(--space-2)',
                  fontWeight: 700,
                  color: (closedSummary.cashDifference || 0) === 0 ? 'var(--color-emerald)' : 'var(--color-rose)'
                }}
              >
                <span>Difference:</span>
                <span>
                  {(closedSummary.cashDifference || 0) > 0 ? `+$${closedSummary.cashDifference}` : `$${closedSummary.cashDifference}`}
                  {(closedSummary.cashDifference || 0) === 0 ? ' (Balanced)' : ' (Discrepancy)'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="button" className="btn btn-primary" onClick={handleStartNewShift} style={{ flex: 1 }}>
                Open New Shift ($200 Float)
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Drawer Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              <div className="surface-elevated" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Opening Float
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ${currentShift.openingFloat.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Started: {new Date(currentShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="surface-elevated" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Expected In Drawer
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '4px' }}>
                  ${currentShift.expectedCash.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Float + Total Cash Sales
                </div>
              </div>
            </div>

            {/* Reconciliation Form */}
            <form onSubmit={handleCloseShift} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Enter Actual Cash Counted in Drawer ($):</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-input" 
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  required
                  style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                />
              </div>

              {/* Difference Banner */}
              <div 
                style={{ 
                  padding: 'var(--space-3) var(--space-4)', 
                  borderRadius: 'var(--radius-md)', 
                  background: diff === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  border: `1px solid ${diff === 0 ? 'var(--color-emerald)' : 'var(--color-rose)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {diff === 0 ? (
                    <CheckCircle2 size={18} color="var(--color-emerald)" />
                  ) : (
                    <ShieldAlert size={18} color="var(--color-rose)" />
                  )}
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {diff === 0 ? 'Drawer is Perfectly Balanced' : diff > 0 ? 'Cash Over Expected' : 'Cash Shortage Detected'}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: diff === 0 ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                  {diff > 0 ? `+$${diff.toFixed(2)}` : `$${diff.toFixed(2)}`}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Shift Handover Notes:</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional shift comments..."
                  style={{ minHeight: '60px', padding: 'var(--space-2) var(--space-3)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>
                  <Lock size={16} />
                  End & Close Shift
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
