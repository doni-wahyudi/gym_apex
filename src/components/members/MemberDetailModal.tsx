import { useState } from 'react';
import { 
  X, 
  QrCode, 
  CreditCard, 
  Clock, 
  UserCheck, 
  FileText, 
  Phone, 
  Mail, 
  RefreshCw, 
  Printer,
  Send
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { Member } from '../../types/gym';
import { generateExpiryReminderUrl } from '../../services/whatsappService';

interface MemberDetailModalProps {
  member: Member;
  onClose: () => void;
  onNavigateToPos?: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose, onNavigateToPos }) => {
  const [activeTab, setActiveTab] = useState<'card' | 'attendance' | 'invoices' | 'notes'>('card');
  const [selectedPlanId, setSelectedPlanId] = useState(member.tierId);
  const [showRenewForm, setShowRenewForm] = useState(false);

  const plans = gymStore.getPlans();
  const checkIns = gymStore.getCheckIns().filter((c) => c.memberId === member.id);
  const sales = gymStore.getSales().filter((s) => s.memberId === member.id);

  const isExpired = new Date() > new Date(member.expiryDate);
  const daysRemaining = Math.ceil(
    (new Date(member.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleRenew = (e: React.FormEvent) => {
    e.preventDefault();
    gymStore.renewMembership(member.id, selectedPlanId);
    setShowRenewForm(false);
  };

  const handleInstantCheckIn = () => {
    gymStore.checkInMember(member.id, 'entry');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', padding: 'var(--space-6)' }}
      >
        {/* Header with Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <img 
              src={member.avatarUrl} 
              alt={member.fullName} 
              style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '2px solid var(--border-medium)' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h2>{member.fullName}</h2>
                <span className={`badge ${member.status === 'active' ? 'badge-emerald' : member.status === 'expiring' ? 'badge-amber' : 'badge-rose'}`}>
                  {member.status}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: 'var(--space-3)', marginTop: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{member.memberCode}</span>
                <span>•</span>
                <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>{member.tierName}</span>
              </div>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn-ghost" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Action Strip */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-emerald btn-sm"
            onClick={handleInstantCheckIn}
            disabled={isExpired}
          >
            <UserCheck size={14} />
            Quick Check-In
          </button>

          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => setShowRenewForm(!showRenewForm)}
          >
            <RefreshCw size={14} />
            Renew Membership
          </button>

          {onNavigateToPos && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateToPos(member)}
            >
              <CreditCard size={14} />
              Open in POS
            </button>
          )}

          <a 
            href={generateExpiryReminderUrl(member)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <Send size={14} color="var(--color-emerald)" />
            Send WhatsApp Reminder
          </a>
        </div>

        {/* Renew Form Drawer if toggled */}
        {showRenewForm && (
          <form 
            onSubmit={handleRenew}
            className="surface-elevated"
            style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', border: '1px solid var(--color-cyan)' }}
          >
            <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.9rem' }}>
              Select Renewal Tier:
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select 
                className="form-input" 
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                style={{ flex: 1 }}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.price} ({p.durationDays} Days)
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-emerald btn-sm">
                Confirm Renewal
              </button>
            </div>
          </form>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-medium)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)' }}>
          <button 
            type="button" 
            className={`btn btn-sm ${activeTab === 'card' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('card')}
          >
            <QrCode size={14} />
            Digital Card
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${activeTab === 'attendance' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('attendance')}
          >
            <Clock size={14} />
            Attendance ({checkIns.length})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('invoices')}
          >
            <CreditCard size={14} />
            Purchases ({sales.length})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('notes')}
          >
            <FileText size={14} />
            Profile & Notes
          </button>
        </div>

        {/* Tab 1: Digital ID Card */}
        {activeTab === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
            {/* Athletic Membership Card */}
            <div 
              style={{ 
                width: '100%', 
                maxWidth: '420px', 
                background: 'linear-gradient(135deg, #151d2a 0%, #0c1119 100%)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--color-cyan)' }}>
                  APEXFORGE PASS
                </span>
                <span className="badge badge-cyan">{member.tierName}</span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <img 
                  src={member.avatarUrl} 
                  alt={member.fullName} 
                  style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '2px solid var(--color-cyan)' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ffffff' }}>{member.fullName}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-cyan)' }}>{member.memberCode}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Member Since {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Barcode & Expiry Bar */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expiration Date</div>
                  <div style={{ fontWeight: 700, color: isExpired ? 'var(--color-rose)' : '#ffffff', fontSize: '0.9rem' }}>
                    {member.expiryDate} {daysRemaining >= 0 ? `(${daysRemaining}d left)` : '(EXPIRED)'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PT Sessions</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)', fontSize: '0.9rem' }}>
                    {member.remainingPTSessions} Remaining
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={14} />
              Print Physical ID Card
            </button>
          </div>
        )}

        {/* Tab 2: Attendance History */}
        {activeTab === 'attendance' && (
          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {checkIns.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>No check-in history logged yet.</p>
            ) : (
              checkIns.map((c) => (
                <div 
                  key={c.id} 
                  className="surface-elevated"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className={`badge ${c.status === 'granted' ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                      {c.type === 'entry' ? 'ENTRY' : 'EXIT'}
                    </span>
                    <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{new Date(c.timestamp).toLocaleString()}</span>
                  </div>
                  <span className={`badge ${c.status === 'granted' ? 'badge-emerald' : 'badge-rose'}`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Purchase History */}
        {activeTab === 'invoices' && (
          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {sales.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>No purchase history found for this member.</p>
            ) : (
              sales.map((s) => (
                <div 
                  key={s.id}
                  className="surface-elevated"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.invoiceNo}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(s.timestamp).toLocaleDateString()} • {s.items.length} items ({s.paymentMethod.toUpperCase()})
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                    ${s.total.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Profile & Notes */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.88rem' }}>
            <div className="surface-elevated" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <Phone size={14} /> Phone
              </div>
              <div style={{ fontWeight: 600 }}>{member.phone}</div>
            </div>

            <div className="surface-elevated" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <Mail size={14} /> Email
              </div>
              <div style={{ fontWeight: 600 }}>{member.email}</div>
            </div>

            <div className="surface-elevated" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Emergency Contact</div>
              <div style={{ fontWeight: 600 }}>{member.emergencyContact} ({member.emergencyPhone})</div>
            </div>

            <div className="surface-elevated" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Trainer Notes / Medical Notes</div>
              <div style={{ color: 'var(--text-primary)' }}>{member.notes || 'No special notes recorded.'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
