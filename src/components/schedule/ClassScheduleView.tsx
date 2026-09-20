import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  UserPlus, 
  Star, 
  Flame, 
  X
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { GymClass } from '../../types/gym';
import { useLanguage } from '../../services/i18n';

export const ClassScheduleView: React.FC = () => {
  const [classes, setClasses] = useState(gymStore.getClasses());
  const [trainers, setTrainers] = useState(gymStore.getTrainers());
  const [members, setMembers] = useState(gymStore.getMembers());

  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday default
  const [bookingClass, setBookingClass] = useState<GymClass | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  useEffect(() => {
    const unsub = gymStore.subscribe(() => {
      setClasses(gymStore.getClasses());
      setTrainers(gymStore.getTrainers());
      setMembers(gymStore.getMembers());
    });
    return unsub;
  }, []);

  const { language, t } = useLanguage();

  const daysOfWeek = language === 'id'
    ? ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredClasses = classes.filter((c) => c.dayOfWeek === selectedDay);

  const handleBookMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingClass || !selectedMemberId) return;

    const success = gymStore.bookClass(bookingClass.id, selectedMemberId);
    if (success) {
      setBookingClass(null);
      setSelectedMemberId('');
    } else {
      alert('Class is at full capacity!');
    }
  };

  const handleCancelBooking = (classId: string, memberId: string) => {
    gymStore.cancelClassBooking(classId, memberId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-cyan">
              <Calendar size={13} />
              {language === 'id' ? 'Jadwal Kelas & Sesi PT' : 'Class Timetable & PT Sessions'}
            </span>
            <span className="badge badge-emerald">{language === 'id' ? 'Pemesanan Langsung' : 'Live Booking'}</span>
          </div>
          <h1>{t('schedule.title')}</h1>
          <p>{t('schedule.subtitle')}</p>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="surface-card" style={{ padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '2px' }}>
          {daysOfWeek.map((dayName, idx) => (
            <button
              key={idx}
              type="button"
              className={`btn btn-sm ${selectedDay === idx ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedDay(idx)}
              style={{ flex: 1, minWidth: '100px' }}
            >
              {dayName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Scheduled Classes for the Day */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
        {filteredClasses.length === 0 ? (
          <div className="surface-card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            <Calendar size={48} style={{ margin: '0 auto var(--space-3)', opacity: 0.3 }} />
            <h3>No group classes scheduled for {daysOfWeek[selectedDay]}</h3>
            <p style={{ marginTop: 'var(--space-1)' }}>Check other weekdays for CrossFit, HIIT, and Spin sessions.</p>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const isFull = cls.enrolledMemberIds.length >= cls.maxCapacity;
            const fillPercentage = Math.round((cls.enrolledMemberIds.length / cls.maxCapacity) * 100);

            return (
              <div 
                key={cls.id}
                className="surface-card"
                style={{ 
                  padding: 'var(--space-5)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 'var(--space-4)',
                  borderTop: `4px solid ${cls.intensity === 'Extreme' ? 'var(--color-rose)' : cls.intensity === 'High' ? 'var(--color-amber)' : 'var(--color-cyan)'}`
                }}
              >
                {/* Time & Room Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                      <span className="badge badge-cyan" style={{ fontFamily: 'var(--font-mono)' }}>
                        <Clock size={12} /> {cls.startTime} - {cls.endTime}
                      </span>
                      <span className="badge badge-emerald">{cls.locationRoom}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginTop: '4px' }}>{cls.title}</h3>
                  </div>

                  <span className={`badge ${cls.intensity === 'Extreme' ? 'badge-rose' : cls.intensity === 'High' ? 'badge-amber' : 'badge-cyan'}`}>
                    <Flame size={12} /> {cls.intensity}
                  </span>
                </div>

                {/* Instructor Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)' }}>
                  <img 
                    src={cls.instructorAvatar} 
                    alt={cls.instructorName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lead Instructor</div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cls.instructorName}</div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Class Capacity</span>
                    <span style={{ fontWeight: 700, color: isFull ? 'var(--color-rose)' : 'var(--text-primary)' }}>
                      {cls.enrolledMemberIds.length} / {cls.maxCapacity} {isFull && '(FULL)'}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-base)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${fillPercentage}%`, 
                        height: '100%', 
                        background: isFull ? 'var(--color-rose)' : fillPercentage > 75 ? 'var(--color-amber)' : 'var(--color-cyan)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>
                </div>

                {/* Enrolled Member Avatars */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                    Enrolled Athletes ({cls.enrolledMemberIds.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {cls.enrolledMemberIds.map((mId) => {
                      const m = members.find((x) => x.id === mId);
                      if (!m) return null;
                      return (
                        <div 
                          key={m.id}
                          className="surface-elevated"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 'var(--space-2)', 
                            padding: '3px 8px', 
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem'
                          }}
                        >
                          <img src={m.avatarUrl} alt={m.fullName} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                          <span>{m.fullName.split(' ')[0]}</span>
                          <button 
                            type="button" 
                            onClick={() => handleCancelBooking(cls.id, m.id)}
                            style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                            title="Remove from class"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Book Action */}
                <button 
                  type="button" 
                  className="btn btn-primary"
                  disabled={isFull}
                  onClick={() => setBookingClass(cls)}
                  style={{ marginTop: 'auto' }}
                >
                  <UserPlus size={16} />
                  {isFull ? 'Class Fully Booked' : 'Book Athlete into Class'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Certified Trainers Section */}
      <div className="surface-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <h3>Certified Personal Training Staff</h3>
            <p style={{ fontSize: '0.85rem' }}>Instructor roster, specialties, hourly rates, and commission payouts.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {trainers.map((trn) => (
            <div key={trn.id} className="surface-elevated" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <img 
                  src={trn.avatarUrl} 
                  alt={trn.name} 
                  style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '2px solid var(--border-medium)' }} 
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{trn.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontWeight: 600 }}>{trn.specialty}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '0.78rem' }}>
                    <Star size={13} color="var(--color-amber)" fill="var(--color-amber)" />
                    <span style={{ fontWeight: 700 }}>{trn.rating}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({trn.activeClientsCount} active clients)</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', marginBottom: 'var(--space-3)' }}>{trn.bio}</p>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Session Rate</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${trn.hourlyRate} / hr</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Commission</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>{trn.commissionRatePercent}% split</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Hours</div>
                  <div style={{ fontWeight: 600 }}>{trn.availableHours}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingClass && (
        <div className="modal-overlay" onClick={() => setBookingClass(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Book Athlete to Class</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-4)', color: 'var(--color-cyan)' }}>
              {bookingClass.title} • {bookingClass.startTime} ({bookingClass.locationRoom})
            </p>

            <form onSubmit={handleBookMember} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Select Active Member *</label>
                <select 
                  className="form-input"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  autoFocus
                >
                  <option value="">-- Choose Athlete --</option>
                  {members
                    .filter((m) => !bookingClass.enrolledMemberIds.includes(m.id) && m.status === 'active')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.memberCode} - {m.tierName})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setBookingClass(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
