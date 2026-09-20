import { useState, useEffect } from 'react';
import { 
  QrCode, 
  Dumbbell, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Trophy, 
  Plus, 
  Sparkles, 
  LogOut 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { gymStore } from '../../services/gymStore';
import type { Member, GymClass, WorkoutRoutine, PersonalRecord } from '../../types/gym';
import { useLanguage } from '../../services/i18n';

interface MemberPortalViewProps {
  onBackToAdmin?: () => void;
}

export const MemberPortalView = ({ onBackToAdmin }: MemberPortalViewProps) => {
  const members = gymStore.getMembers();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'pass' | 'workouts' | 'classes' | 'progress'>('pass');
  
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [weightInput, setWeightInput] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const { language, t } = useLanguage();

  const [classes, setClasses] = useState<GymClass[]>(gymStore.getClasses());
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);

  const activeMember: Member | undefined = members.find((m) => m.id === selectedMemberId);

  useEffect(() => {
    const update = () => {
      setClasses(gymStore.getClasses());
      if (selectedMemberId) {
        setRoutines(gymStore.getRoutines(selectedMemberId));
        setPrs(gymStore.getPRs(selectedMemberId));
      }
    };
    update();
    const unsub = gymStore.subscribe(update);
    return unsub;
  }, [selectedMemberId]);

  if (!activeMember) return null;

  const daysRemaining = Math.ceil(
    (new Date(activeMember.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysRemaining < 0;

  const handleToggleExercise = (exId: string) => {
    setCompletedExercises((prev) => {
      const next = { ...prev, [exId]: !prev[exId] };
      // If completed, trigger small celebration
      if (!prev[exId]) {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#06b6d4', '#10b981'],
        });
      }
      return next;
    });
  };

  const handleBookClass = (classId: string) => {
    const success = gymStore.bookClass(classId, activeMember.id);
    if (success) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#f59e0b'],
      });
    } else {
      alert('Class is already at maximum capacity!');
    }
  };

  const handleCancelBooking = (classId: string) => {
    gymStore.cancelClassBooking(classId, activeMember.id);
  };

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    gymStore.addMetric({
      memberId: activeMember.id,
      recordedAt: new Date().toISOString(),
      weightKg: parseFloat(weightInput),
      bodyFatPercent: 14.5,
      muscleMassKg: 42.0,
      notes: 'Logged via Member Portal',
    });
    setWeightInput('');
    setShowWeightModal(false);
    confetti({ particleCount: 30, spread: 50 });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Top Bar with Member Switcher & Admin Exit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="badge badge-cyan">
            <Sparkles size={12} />
            {t('portal.title')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Member Profile Switcher (For Pair Programming / Demo) */}
          <select 
            className="form-input" 
            style={{ minHeight: '34px', padding: '0 8px', fontSize: '0.8rem' }}
            value={selectedMemberId}
            onChange={(e) => {
              setSelectedMemberId(e.target.value);
              setCompletedExercises({});
            }}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {language === 'id' ? 'Masuk sebagai:' : 'Logged in as:'} {m.fullName}
              </option>
            ))}
          </select>

          {onBackToAdmin && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={onBackToAdmin}
              title="Return to Staff Management Dashboard"
            >
              <LogOut size={13} />
              {t('portal.back_admin')}
            </button>
          )}
        </div>
      </div>

      {/* Member Hero Identity Card */}
      <div 
        className="surface-card" 
        style={{ 
          padding: 'var(--space-5)', 
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <img 
            src={activeMember.avatarUrl} 
            alt={activeMember.fullName} 
            style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-xl)', objectFit: 'cover', border: '2px solid var(--color-cyan)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h2>{activeMember.fullName}</h2>
              <span className={`badge ${activeMember.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>
                {activeMember.status}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{activeMember.memberCode}</span> • 
              <strong style={{ color: 'var(--color-cyan)', marginLeft: '4px' }}>{activeMember.tierName}</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: isExpired ? 'var(--color-rose)' : 'var(--text-muted)', marginTop: '4px' }}>
              {isExpired ? 'Membership Expired' : `${daysRemaining} days remaining on pass`} • {activeMember.remainingPTSessions} PT credits
            </div>
          </div>
        </div>

        {/* Quick Check-In Status */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lifetime Visits</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {activeMember.totalVisits}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-medium)', paddingBottom: 'var(--space-2)', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('pass')}
          className={`btn btn-sm ${activeTab === 'pass' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <QrCode size={14} />
          {t('portal.digital_pass')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workouts')}
          className={`btn btn-sm ${activeTab === 'workouts' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Dumbbell size={14} />
          {t('portal.todays_workout')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`btn btn-sm ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar size={14} />
          {t('portal.book_classes')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`btn btn-sm ${activeTab === 'progress' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Trophy size={14} />
          {t('portal.my_progress')}
        </button>
      </div>

      {/* Tab 1: Digital Athletic Pass */}
      {activeTab === 'pass' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)' }}>
          <div 
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #161e2b 0%, #0d121a 100%)',
              border: '2px solid var(--border-strong)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  APEXFORGE PASS
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Official Access Barcode
                </div>
              </div>
              <span className="badge badge-cyan">{activeMember.tierName}</span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <img 
                src={activeMember.avatarUrl} 
                alt={activeMember.fullName}
                style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '3px solid var(--color-cyan)' }}
              />
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>{activeMember.fullName}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-cyan)', marginTop: '2px' }}>
                  {activeMember.memberCode}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Expires: <strong style={{ color: isExpired ? 'var(--color-rose)' : '#ffffff' }}>{activeMember.expiryDate}</strong>
                </div>
              </div>
            </div>

            {/* Simulated Dynamic High-Contrast Barcode */}
            <div 
              style={{ 
                background: '#ffffff', 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--space-4)', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              {/* Barcode Graphic Stripes */}
              <div style={{ display: 'flex', height: '54px', justifyContent: 'center', gap: '2px', alignItems: 'stretch', marginBottom: '6px' }}>
                {[3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3].map((width, idx) => (
                  <div key={idx} style={{ width: `${width * 2}px`, background: '#000' }} />
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#000', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.2em' }}>
                *{activeMember.memberCode}*
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Present this screen at the turnstile camera scanner or kiosk for instantaneous admission.
          </p>
        </div>
      )}

      {/* Tab 2: Assigned Workout Split & Exercise Checklist */}
      {activeTab === 'workouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {routines.length === 0 ? (
            <div className="surface-card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Dumbbell size={40} style={{ margin: '0 auto var(--space-2)', opacity: 0.3 }} />
              <h3>No custom workout assigned yet</h3>
              <p>Your personal trainer will configure your tailored exercise split shortly.</p>
            </div>
          ) : (
            routines.map((routine) => {
              const totalEx = routine.exercises.length;
              const completedCount = routine.exercises.filter((ex) => completedExercises[ex.id]).length;
              const pct = Math.round((completedCount / (totalEx || 1)) * 100);

              return (
                <div key={routine.id} className="surface-card" style={{ padding: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <span className="badge badge-cyan" style={{ marginBottom: '4px' }}>{routine.splitType} Split</span>
                      <h3>{routine.title}</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-cyan)' }}>
                        {completedCount} / {totalEx} Done
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-base)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-4)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-emerald)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s ease' }} />
                  </div>

                  {/* Exercise Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {routine.exercises.map((ex) => {
                      const isDone = Boolean(completedExercises[ex.id]);
                      return (
                        <div 
                          key={ex.id}
                          onClick={() => handleToggleExercise(ex.id)}
                          className="surface-elevated"
                          style={{ 
                            padding: 'var(--space-3) var(--space-4)', 
                            borderRadius: 'var(--radius-md)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            background: isDone ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface-elevated)',
                            borderLeft: `4px solid ${isDone ? 'var(--color-emerald)' : 'var(--color-cyan)'}`,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {isDone ? (
                              <CheckCircle2 size={20} color="var(--color-emerald)" />
                            ) : (
                              <Circle size={20} color="var(--text-muted)" />
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: isDone ? 'var(--color-emerald)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                                {ex.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {ex.notes} • Rest: {ex.restSeconds}s
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                              {ex.targetSets} sets x {ex.targetReps}
                            </span>
                            {ex.targetWeightKg && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                                @{ex.targetWeightKg}kg
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Group Class Self-Booking */}
      {activeTab === 'classes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Reserve your spot in upcoming studio classes. Your pass includes unlimited access!
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {classes.map((cls) => {
              const isEnrolled = cls.enrolledMemberIds.includes(activeMember.id);
              const isFull = cls.enrolledMemberIds.length >= cls.maxCapacity;

              return (
                <div 
                  key={cls.id}
                  className="surface-card"
                  style={{ 
                    padding: 'var(--space-4)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                    borderLeft: `4px solid ${isEnrolled ? 'var(--color-emerald)' : 'var(--color-cyan)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <img 
                      src={cls.instructorAvatar} 
                      alt={cls.instructorName} 
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <strong style={{ fontSize: '1rem' }}>{cls.title}</strong>
                        {isEnrolled && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                            <CheckCircle2 size={11} /> BOOKED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-2)', marginTop: '2px' }}>
                        <span>{cls.startTime} - {cls.endTime}</span>
                        <span>•</span>
                        <span>{cls.locationRoom}</span>
                        <span>•</span>
                        <span>Coach {cls.instructorName.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>Capacity</span>
                      <div style={{ fontWeight: 700, color: isFull ? 'var(--color-rose)' : 'var(--text-primary)' }}>
                        {cls.enrolledMemberIds.length} / {cls.maxCapacity}
                      </div>
                    </div>

                    {isEnrolled ? (
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCancelBooking(cls.id)}
                        style={{ color: 'var(--color-rose)' }}
                      >
                        Cancel Spot
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        disabled={isFull}
                        onClick={() => handleBookClass(cls.id)}
                      >
                        {isFull ? 'Full' : 'Reserve Spot'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: My PRs & Progress Log */}
      {activeTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Personal Records & Verified Best Lifts</h3>
              <p style={{ fontSize: '0.82rem' }}>Verified lifetime benchmarks achieved at ApexForge.</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowWeightModal(true)}>
              <Plus size={13} />
              Log Weigh-In
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
            {prs.map((pr) => (
              <div key={pr.id} className="surface-elevated" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pr.exerciseName}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-amber)', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                  {pr.weightKg} kg
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {pr.reps} {pr.reps === 1 ? 'Rep Max' : 'Reps'} • {new Date(pr.achievedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="modal-overlay" onClick={() => setShowWeightModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Log Today's Body Weight</h3>
            <form onSubmit={handleLogWeight} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Weight (kg) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  value={weightInput} 
                  onChange={(e) => setWeightInput(e.target.value)} 
                  placeholder="e.g. 86.8" 
                  required 
                  autoFocus 
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWeightModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
