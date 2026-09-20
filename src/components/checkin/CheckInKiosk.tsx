import { useState, useEffect } from 'react';
import { 
  Scan, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  LogOut, 
  Search, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Camera,
  Tablet
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { Member, CheckInRecord } from '../../types/gym';
import { CameraScannerModal } from './CameraScannerModal';
import { KioskLockdownView } from './KioskLockdownView';
import { useLanguage } from '../../services/i18n';

interface CheckInKioskProps {
  onNavigateToPosWithMember?: (member: Member) => void;
}

export const CheckInKiosk: React.FC<CheckInKioskProps> = ({ onNavigateToPosWithMember }) => {
  const [occupancy, setOccupancy] = useState(gymStore.getOccupancy());
  const [members, setMembers] = useState(gymStore.getMembers());
  const [checkIns, setCheckIns] = useState(gymStore.getCheckIns());

  const [inputCode, setInputCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isKioskMode, setIsKioskMode] = useState(false);
  const { language, t } = useLanguage();
  const [lastResult, setLastResult] = useState<{
    member?: Member;
    record?: CheckInRecord;
    type: 'success' | 'denied' | 'checkout';
    message: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = gymStore.subscribe(() => {
      setOccupancy(gymStore.getOccupancy());
      setMembers(gymStore.getMembers());
      setCheckIns(gymStore.getCheckIns());
    });
    return unsubscribe;
  }, []);

  const handleScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputCode.trim();
    if (!query) return;

    // Search by memberCode or exact phone
    const member = members.find(
      (m) => m.memberCode.toLowerCase() === query.toLowerCase() || m.phone.includes(query)
    );

    if (!member) {
      setLastResult({
        type: 'denied',
        message: `No member found matching code "${query}".`,
      });
      setInputCode('');
      return;
    }

    processCheckIn(member);
    setInputCode('');
  };

  const processCheckIn = (member: Member) => {
    try {
      const record = gymStore.checkInMember(member.id, 'entry');
      if (record.status === 'granted') {
        setLastResult({
          member,
          record,
          type: 'success',
          message: `Welcome back, ${member.fullName}! Access granted.`,
        });
      } else {
        setLastResult({
          member,
          record,
          type: 'denied',
          message: record.denialReason || 'Access denied.',
        });
      }
    } catch (err: any) {
      setLastResult({
        type: 'denied',
        message: err.message || 'Check-in failed',
      });
    }
  };

  const handleCheckOut = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    const record = gymStore.checkOutMember(memberId);
    setLastResult({
      member,
      record,
      type: 'checkout',
      message: `Checked out ${member.fullName}. See you next workout!`,
    });
  };

  const occupancyPercentage = Math.round((occupancy.currentCount / occupancy.maxCapacity) * 100);

  const filteredMembers = searchQuery.trim()
    ? members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.memberCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (isKioskMode) {
    return <KioskLockdownView onExitKiosk={() => setIsKioskMode(false)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Header & Occupancy Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-cyan">
              <ShieldCheck size={13} />
              {language === 'id' ? 'Kontrol Akses & Turnstile' : 'Access Control & Turnstile'}
            </span>
            <span className="badge badge-emerald">{language === 'id' ? 'Kios Real-Time' : 'Realtime Kiosk'}</span>
          </div>
          <h1>{t('checkin.title')}</h1>
          <p>{t('checkin.subtitle')}</p>
        </div>

        {/* Live Facility Occupancy Widget & Kiosk Mode Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setIsKioskMode(true)}
            title="Launch full-screen front entrance self-service tablet view"
          >
            <Tablet size={16} color="var(--color-cyan)" />
            {t('checkin.tablet_kiosk')}
          </button>

          <div 
            className="surface-card" 
            style={{ 
              padding: 'var(--space-3) var(--space-5)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-4)',
              borderLeft: `4px solid ${occupancyPercentage > 85 ? 'var(--color-rose)' : 'var(--color-emerald)'}`
            }}
          >
            <div style={{ position: 'relative' }}>
              <div 
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: 'var(--radius-full)', 
                  background: 'var(--bg-base)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid var(--border-medium)'
                }}
              >
                <Users size={20} color={occupancyPercentage > 85 ? 'var(--color-rose)' : 'var(--color-emerald)'} />
              </div>
              <span 
                className="pulse-indicator" 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: 'var(--color-emerald)' 
                }} 
              />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {t('dash.occupancy')}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {occupancy.currentCount}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  / {occupancy.maxCapacity} Max
                </span>
                <span 
                  className={`badge ${occupancyPercentage > 85 ? 'badge-rose' : occupancyPercentage > 60 ? 'badge-amber' : 'badge-emerald'}`}
                  style={{ marginLeft: 'var(--space-1)', fontSize: '0.65rem' }}
                >
                  {occupancyPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Check-In Scanner on Left, Inside Attendees on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left Column: Scanner Station */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="surface-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Scan size={20} color="var(--color-cyan)" />
              {language === 'id' ? 'Pindai atau Ketik ID Member' : 'Scan or Enter Member ID'}
            </h3>

            <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <input 
                  type="text"
                  className="form-input"
                  placeholder={t('checkin.scan_input')}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', letterSpacing: '0.04em' }}
                  autoFocus
                />
              </div>

              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCamera(true)}
                title="Open live camera scanner"
              >
                <Camera size={18} color="var(--color-cyan)" />
                {t('checkin.camera_btn')}
              </button>

              <button type="submit" className="btn btn-primary">
                <CheckCircle2 size={18} />
                {t('checkin.verify_btn')}
              </button>
            </form>

            {/* Simulation Quick-Test Buttons */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', fontWeight: 600 }}>
                {t('checkin.test_simulation')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const m = members.find((x) => x.id === 'mem-1');
                    if (m) processCheckIn(m);
                  }}
                >
                  <Sparkles size={14} color="var(--color-emerald)" />
                  Test Active (Alex Wright)
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const m = members.find((x) => x.id === 'mem-3');
                    if (m) processCheckIn(m);
                  }}
                >
                  <AlertTriangle size={14} color="var(--color-amber)" />
                  Test Expiring (Marcus S.)
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const m = members.find((x) => x.id === 'mem-4');
                    if (m) processCheckIn(m);
                  }}
                >
                  <XCircle size={14} color="var(--color-rose)" />
                  Test Expired (Liam O.)
                </button>
              </div>
            </div>

            {/* Manual Quick Search */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <div className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Or Search Member by Name:</div>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Type name (e.g. Sophia, Dante)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>

              {filteredMembers.length > 0 && (
                <div 
                  className="surface-elevated" 
                  style={{ 
                    marginTop: 'var(--space-2)', 
                    maxHeight: '180px', 
                    overflowY: 'auto',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  {filteredMembers.map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => {
                        processCheckIn(m);
                        setSearchQuery('');
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <img 
                          src={m.avatarUrl} 
                          alt={m.fullName}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{m.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.memberCode} • {m.tierName}</div>
                        </div>
                      </div>
                      <span className={`badge ${m.status === 'active' ? 'badge-emerald' : m.status === 'expiring' ? 'badge-amber' : 'badge-rose'}`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Validation Result Box */}
          {lastResult && (
            <div 
              className="surface-card"
              style={{ 
                padding: 'var(--space-5)',
                border: `2px solid ${
                  lastResult.type === 'success' 
                    ? 'var(--color-emerald)' 
                    : lastResult.type === 'checkout'
                    ? 'var(--color-cyan)'
                    : 'var(--color-rose)'
                }`,
                background: lastResult.type === 'success' 
                  ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, var(--bg-surface) 100%)' 
                  : lastResult.type === 'checkout'
                  ? 'linear-gradient(180deg, rgba(6, 182, 212, 0.12) 0%, var(--bg-surface) 100%)'
                  : 'linear-gradient(180deg, rgba(244, 63, 94, 0.15) 0%, var(--bg-surface) 100%)',
                animation: 'scaleUp 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                  {lastResult.member ? (
                    <img 
                      src={lastResult.member.avatarUrl} 
                      alt={lastResult.member.fullName} 
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: 'var(--radius-lg)', 
                        objectFit: 'cover',
                        border: '2px solid var(--border-medium)'
                      }} 
                    />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={32} color="var(--color-rose)" />
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      {lastResult.type === 'success' && (
                        <span className="badge badge-emerald">
                          <CheckCircle2 size={13} />
                          ACCESS GRANTED
                        </span>
                      )}
                      {lastResult.type === 'checkout' && (
                        <span className="badge badge-cyan">
                          <LogOut size={13} />
                          CHECKED OUT
                        </span>
                      )}
                      {lastResult.type === 'denied' && (
                        <span className="badge badge-rose">
                          <XCircle size={13} />
                          ACCESS DENIED
                        </span>
                      )}
                      {lastResult.member && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {lastResult.member.memberCode}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      {lastResult.member ? lastResult.member.fullName : 'Scan Issue'}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: lastResult.type === 'denied' ? '#fda4af' : 'var(--text-secondary)' }}>
                      {lastResult.message}
                    </p>
                  </div>
                </div>

                {/* Direct CTA if denied -> Renew at POS */}
                {lastResult.type === 'denied' && lastResult.member && onNavigateToPosWithMember && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => onNavigateToPosWithMember(lastResult.member!)}
                  >
                    <Zap size={16} />
                    {t('dash.renew_pos')}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {lastResult.member && (
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 'var(--space-2)', 
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Membership Plan</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lastResult.member.tierName}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Valid Until</div>
                    <div style={{ fontWeight: 600, color: lastResult.type === 'denied' ? 'var(--color-rose)' : 'var(--text-primary)' }}>
                      {lastResult.member.expiryDate}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Total Visits</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lastResult.member.totalVisits} sessions</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Currently Inside Facility Roster */}
        <div className="surface-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <h3>{t('checkin.inside_now')} ({occupancy.currentCount})</h3>
              <p style={{ fontSize: '0.85rem' }}>{language === 'id' ? 'Member aktif yang saat ini sedang berada di gym.' : 'Active members currently training on gym premises.'}</p>
            </div>
            <span className="badge badge-emerald">
              <span className="pulse-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-emerald)', display: 'inline-block' }} />
              Live
            </span>
          </div>

          {occupancy.activeAttendees.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={36} style={{ margin: '0 auto var(--space-2)', opacity: 0.4 }} />
              <p>{language === 'id' ? 'Belum ada member yang check-in saat ini.' : 'No members currently checked in.'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', overflowY: 'auto', maxHeight: '420px', paddingRight: 'var(--space-1)' }}>
              {occupancy.activeAttendees.map((member) => (
                <div 
                  key={member.id}
                  className="surface-elevated"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <img 
                      src={member.avatarUrl} 
                      alt={member.fullName}
                      style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.fullName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {member.memberCode} • <span style={{ color: 'var(--color-cyan)' }}>{member.tierName}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCheckOut(member.id)}
                    title="Manual check-out"
                  >
                    <LogOut size={14} />
                    Check Out
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent Activity Log Strip */}
          <div style={{ marginTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recent Check-In Stream
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: '160px', overflowY: 'auto' }}>
              {checkIns.slice(0, 5).map((chk) => (
                <div 
                  key={chk.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    fontSize: '0.82rem',
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {chk.status === 'granted' ? (
                      chk.type === 'entry' ? <UserCheck size={14} color="var(--color-emerald)" /> : <LogOut size={14} color="var(--color-cyan)" />
                    ) : (
                      <XCircle size={14} color="var(--color-rose)" />
                    )}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{chk.memberName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>({chk.tierName})</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Live Scanner Modal */}
      {showCamera && (
        <CameraScannerModal 
          onClose={() => setShowCamera(false)}
          onScanSuccess={(code) => {
            setShowCamera(false);
            const m = members.find((x) => x.memberCode.toLowerCase() === code.toLowerCase());
            if (m) {
              processCheckIn(m);
            } else {
              setLastResult({
                type: 'denied',
                message: `Code "${code}" not found.`,
              });
            }
          }}
        />
      )}
    </div>
  );
};
