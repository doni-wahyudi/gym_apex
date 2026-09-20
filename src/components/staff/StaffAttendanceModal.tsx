import { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  X 
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { Trainer, StaffShift } from '../../types/gym';

interface StaffAttendanceModalProps {
  onClose: () => void;
}

export const StaffAttendanceModal = ({ onClose }: StaffAttendanceModalProps) => {
  const trainers = gymStore.getTrainers();
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(trainers[0]?.id || '');
  
  // Shift state
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState('2026-09-20T07:00:00Z');
  const [shifts, setShifts] = useState<StaffShift[]>([
    { id: 'sh-1', staffName: 'Marcus Vance', role: 'trainer', clockInTime: '2026-09-20T06:00:00Z', notes: 'Morning shift opening' },
    { id: 'sh-2', staffName: 'Front Desk Admin', role: 'front_desk', clockInTime: '2026-09-20T06:30:00Z', notes: 'Turnstile & POS register active' },
    { id: 'sh-3', staffName: 'Elena Rostova', role: 'trainer', clockInTime: '2026-09-19T08:00:00Z', clockOutTime: '2026-09-19T16:00:00Z', hoursLogged: 8, notes: 'Full shift completed' },
  ]);

  const activeTrainer: Trainer | undefined = trainers.find((t) => t.id === selectedTrainerId);

  // Commission calculations
  const sessionsConductedThisMonth = (activeTrainer?.activeClientsCount || 10) * 3; // simulated sessions
  const grossRevenue = sessionsConductedThisMonth * (activeTrainer?.hourlyRate || 65);
  const commissionRate = (activeTrainer?.commissionRatePercent || 70) / 100;
  const trainerNetPayout = grossRevenue * commissionRate;
  const gymRetainedProfit = grossRevenue * (1 - commissionRate);

  const handleToggleClock = () => {
    if (isClockedIn) {
      // Clock out
      setIsClockedIn(false);
      setShifts((prev) => [
        {
          id: 'sh-' + Date.now(),
          staffName: 'Marcus Vance',
          role: 'trainer',
          clockInTime,
          clockOutTime: new Date().toISOString(),
          hoursLogged: 6.5,
          notes: 'Standard shift closed.',
        },
        ...prev.filter((s) => s.staffName !== 'Marcus Vance' || s.clockOutTime),
      ]);
    } else {
      // Clock in
      setIsClockedIn(true);
      const now = new Date().toISOString();
      setClockInTime(now);
      setShifts((prev) => [
        {
          id: 'sh-' + Date.now(),
          staffName: 'Marcus Vance',
          role: 'trainer',
          clockInTime: now,
          notes: 'Shift started.',
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', padding: 'var(--space-6)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="badge badge-cyan">
              <Clock size={13} />
              Staff Management & Payroll
            </span>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <h2 style={{ marginBottom: 'var(--space-2)' }}>Staff Attendance & Trainer Commission</h2>
        <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-5)' }}>
          Clock-in logs for front desk staff and 1-on-1 PT session payout ledger.
        </p>

        {/* Current Staff Clock-In Card */}
        <div 
          className="surface-card" 
          style={{ 
            padding: 'var(--space-5)', 
            marginBottom: 'var(--space-5)',
            borderLeft: `4px solid ${isClockedIn ? 'var(--color-emerald)' : 'var(--color-amber)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className={`badge ${isClockedIn ? 'badge-emerald' : 'badge-amber'}`}>
                {isClockedIn ? 'Currently Clocked In' : 'Clocked Out'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Marcus Vance (Owner / Head Coach)</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '6px' }}>
              {isClockedIn ? 'Shift Started at 07:00 AM' : 'Off Duty'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Terminal: Front Desk Station #1
            </div>
          </div>

          <button 
            type="button" 
            className={`btn ${isClockedIn ? 'btn-danger' : 'btn-emerald'}`}
            onClick={handleToggleClock}
          >
            {isClockedIn ? 'Clock Out Shift' : 'Clock In Now'}
          </button>
        </div>

        {/* Trainer Commission & Session Split Calculator */}
        <div className="surface-elevated" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <DollarSign size={18} color="var(--color-emerald)" />
              <h3 style={{ fontSize: '1.05rem' }}>Trainer Commission Ledger</h3>
            </div>

            <select 
              className="form-input" 
              style={{ minHeight: '32px', padding: '0 8px', fontSize: '0.82rem' }}
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
            >
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.commissionRatePercent}% split)
                </option>
              ))}
            </select>
          </div>

          {activeTrainer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                <div style={{ background: 'var(--bg-base)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sessions Done</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {sessionsConductedThisMonth}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>@ ${activeTrainer.hourlyRate}/hr</div>
                </div>

                <div style={{ background: 'var(--bg-base)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Revenue</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: '2px' }}>
                    ${grossRevenue.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total billed</div>
                </div>

                <div style={{ background: 'var(--bg-base)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trainer Net Payout</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-emerald)', marginTop: '2px' }}>
                    ${trainerNetPayout.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-emerald)' }}>({activeTrainer.commissionRatePercent}% split)</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
                <span>Gym Net Retained Share ({(100 - activeTrainer.commissionRatePercent)}%):</span>
                <strong style={{ color: 'var(--color-cyan)' }}>${gymRetainedProfit.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Shift Attendance Logs */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>
            Recent Staff Shift Records
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: '180px', overflowY: 'auto' }}>
            {shifts.map((sh) => (
              <div 
                key={sh.id}
                className="surface-elevated"
                style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sh.staffName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{sh.notes}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${sh.clockOutTime ? 'badge-cyan' : 'badge-emerald'}`} style={{ fontSize: '0.68rem' }}>
                    {sh.clockOutTime ? `${sh.hoursLogged} hrs` : 'ACTIVE'}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(sh.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
