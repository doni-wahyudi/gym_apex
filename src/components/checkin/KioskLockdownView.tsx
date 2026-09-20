import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Camera, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Delete, 
  ArrowRight
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { Member, CheckInRecord } from '../../types/gym';
import { CameraScannerModal } from './CameraScannerModal';

interface KioskLockdownViewProps {
  onExitKiosk: () => void;
}

export const KioskLockdownView = ({ onExitKiosk }: KioskLockdownViewProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [occupancy, setOccupancy] = useState(gymStore.getOccupancy());
  const [pinInput, setPinInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // Exit PIN dialog
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Result Banner
  const [checkInResult, setCheckInResult] = useState<{
    member?: Member;
    record?: CheckInRecord;
    status: 'granted' | 'denied';
    message: string;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const unsub = gymStore.subscribe(() => {
      setOccupancy(gymStore.getOccupancy());
    });
    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  const handleKeyPress = (digit: string) => {
    if (pinInput.length < 12) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPinInput('');
  };

  const processCode = (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed) return;

    const members = gymStore.getMembers();
    // Match memberCode (e.g. AF-1001 or 1001) or phone number
    const member = members.find((m) => {
      const numericCode = m.memberCode.replace(/[^0-9]/g, '');
      const rawNumeric = trimmed.replace(/[^0-9]/g, '');
      return (
        m.memberCode.toLowerCase() === trimmed.toLowerCase() ||
        (rawNumeric && numericCode === rawNumeric) ||
        m.phone.replace(/[^0-9]/g, '').includes(rawNumeric)
      );
    });

    if (!member) {
      setCheckInResult({
        status: 'denied',
        message: `No active athlete found matching "${trimmed}". Please visit the front desk.`,
      });
      setPinInput('');
      setTimeout(() => setCheckInResult(null), 5000);
      return;
    }

    try {
      const record = gymStore.checkInMember(member.id, 'entry');
      if (record.status === 'granted') {
        setCheckInResult({
          member,
          record,
          status: 'granted',
          message: `Welcome, ${member.fullName.split(' ')[0]}! Access verified.`,
        });
      } else {
        setCheckInResult({
          member,
          record,
          status: 'denied',
          message: record.denialReason || 'Membership expired. Please renew at desk.',
        });
      }
    } catch {
      setCheckInResult({
        status: 'denied',
        message: 'Check-in validation error. Please see staff.',
      });
    }

    setPinInput('');
    setTimeout(() => setCheckInResult(null), 4500);
  };

  const handleAdminExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '1234') {
      onExitKiosk();
    } else {
      setPinError(true);
      setAdminPinInput('');
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'linear-gradient(135deg, #090d13 0%, #0c1119 100%)', 
        color: '#ffffff', 
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-6)',
        overflowY: 'auto'
      }}
    >
      {/* Top Kiosk Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-lg)', 
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)'
            }}
          >
            <Dumbbell size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
              APEXFORGE
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-cyan)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Self-Service Turnstile Kiosk
            </div>
          </div>
        </div>

        {/* Real-time Clock & Occupancy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div 
            className="surface-card" 
            style={{ 
              padding: 'var(--space-2) var(--space-4)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)',
              background: 'rgba(20, 27, 38, 0.7)'
            }}
          >
            <span className="pulse-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-emerald)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {occupancy.currentCount} / {occupancy.maxCapacity} Inside
            </span>
          </div>

          {/* Admin Exit Button */}
          <button 
            type="button" 
            onClick={() => setShowPinPrompt(true)}
            className="btn-ghost"
            style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-muted)' }}
            title="Exit Kiosk Mode"
          >
            <Lock size={18} />
          </button>
        </div>
      </div>

      {/* Main Kiosk Body: Scan Pass or Keypad */}
      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', alignItems: 'center' }}>
        {/* Verification Card if Scanned */}
        {checkInResult ? (
          <div 
            className="surface-card"
            style={{ 
              width: '100%', 
              padding: 'var(--space-6)', 
              border: `3px solid ${checkInResult.status === 'granted' ? 'var(--color-emerald)' : 'var(--color-rose)'}`,
              background: checkInResult.status === 'granted' 
                ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, #121822 100%)' 
                : 'linear-gradient(180deg, rgba(244, 63, 94, 0.2) 0%, #121822 100%)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center',
              animation: 'scaleUp 0.25s ease-out'
            }}
          >
            {checkInResult.member?.avatarUrl ? (
              <img 
                src={checkInResult.member.avatarUrl} 
                alt={checkInResult.member.fullName} 
                style={{ width: '88px', height: '88px', borderRadius: 'var(--radius-xl)', margin: '0 auto var(--space-3)', objectFit: 'cover', border: '3px solid #ffffff' }}
              />
            ) : checkInResult.status === 'granted' ? (
              <CheckCircle2 size={64} color="var(--color-emerald)" style={{ margin: '0 auto var(--space-3)' }} />
            ) : (
              <XCircle size={64} color="var(--color-rose)" style={{ margin: '0 auto var(--space-3)' }} />
            )}

            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
              {checkInResult.member ? checkInResult.member.fullName : 'Scan Status'}
            </div>

            <p style={{ fontSize: '1.1rem', color: checkInResult.status === 'granted' ? 'var(--color-emerald)' : '#fda4af', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              {checkInResult.message}
            </p>

            {checkInResult.member && (
              <div style={{ display: 'inline-flex', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>
                <span>Pass: <strong>{checkInResult.member.tierName}</strong></span>
                <span>•</span>
                <span>Visits: <strong>{checkInResult.member.totalVisits}</strong></span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Camera Scan Big Trigger */}
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="btn btn-primary btn-lg"
              style={{ 
                width: '100%', 
                height: '68px', 
                fontSize: '1.2rem', 
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 6px 24px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Camera size={26} />
              Tap to Scan Barcode / QR Card
            </button>

            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 'var(--space-4)', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                or Enter Member ID / Phone
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {/* Display Input */}
            <div 
              style={{ 
                width: '100%', 
                height: '60px', 
                background: 'var(--bg-surface)', 
                border: '2px solid var(--border-medium)', 
                borderRadius: 'var(--radius-lg)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: pinInput ? 'var(--color-cyan)' : 'var(--text-muted)'
              }}
            >
              {pinInput || '1001'}
            </div>

            {/* Numeric Touch Keypad (3x4) */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 'var(--space-3)', 
                width: '100%',
                maxWidth: '380px' 
              }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="btn btn-secondary"
                  style={{ height: '60px', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', borderRadius: 'var(--radius-lg)' }}
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                style={{ height: '60px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 'var(--radius-lg)' }}
              >
                CLEAR
              </button>

              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="btn btn-secondary"
                style={{ height: '60px', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', borderRadius: 'var(--radius-lg)' }}
              >
                0
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-secondary"
                style={{ height: '60px', borderRadius: 'var(--radius-lg)' }}
              >
                <Delete size={20} />
              </button>
            </div>

            {/* Check-In Confirm Button */}
            <button
              type="button"
              disabled={!pinInput}
              onClick={() => processCode(pinInput)}
              className="btn btn-emerald btn-lg"
              style={{ width: '100%', maxWidth: '380px', height: '54px', fontSize: '1.1rem' }}
            >
              Check In Now
              <ArrowRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Footer Instructions */}
      <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        ApexForge Gym Kiosk • Need assistance? Please request front-desk staff.
      </div>

      {/* Live Camera Scanner Modal */}
      {showCamera && (
        <CameraScannerModal 
          onClose={() => setShowCamera(false)} 
          onScanSuccess={(code) => {
            setShowCamera(false);
            processCode(code);
          }} 
        />
      )}

      {/* Staff Admin PIN Dialog */}
      {showPinPrompt && (
        <div className="modal-overlay" onClick={() => setShowPinPrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px', padding: 'var(--space-6)', textAlign: 'center' }}>
            <Lock size={36} color="var(--color-cyan)" style={{ margin: '0 auto var(--space-2)' }} />
            <h3 style={{ marginBottom: 'var(--space-1)' }}>Staff PIN Required</h3>
            <p style={{ fontSize: '0.8rem', marginBottom: 'var(--space-4)' }}>Enter 4-digit code to exit kiosk mode (Default: 1234).</p>

            <form onSubmit={handleAdminExit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <input 
                type="password"
                maxLength={4}
                autoFocus
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.3em', fontFamily: 'var(--font-mono)' }}
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setPinError(false);
                }}
              />

              {pinError && (
                <div style={{ color: 'var(--color-rose)', fontSize: '0.8rem', fontWeight: 600 }}>
                  Incorrect PIN. Try 1234.
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPinPrompt(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
