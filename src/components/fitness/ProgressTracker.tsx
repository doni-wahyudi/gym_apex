import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Dumbbell, 
  Plus, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { gymStore } from '../../services/gymStore';
import type { BodyMetric, PersonalRecord, WorkoutRoutine } from '../../types/gym';
import { useLanguage } from '../../services/i18n';

export const ProgressTracker: React.FC = () => {
  const members = gymStore.getMembers();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);

  // Form states
  const [showLogMetric, setShowLogMetric] = useState(false);
  const [showLogPr, setShowLogPr] = useState(false);
  const { language, t } = useLanguage();

  // New metric form inputs
  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [muscleMassInput, setMuscleMassInput] = useState('');
  const [waistInput, setWaistInput] = useState('');

  // New PR form inputs
  const [prExercise, setPrExercise] = useState('Flat Barbell Bench Press');
  const [prWeight, setPrWeight] = useState('');
  const [prReps, setPrReps] = useState('1');
  const [prNotes, setPrNotes] = useState('');

  const activeMember = members.find((m) => m.id === selectedMemberId);

  useEffect(() => {
    const update = () => {
      if (selectedMemberId) {
        setMetrics(gymStore.getMetrics(selectedMemberId));
        setPrs(gymStore.getPRs(selectedMemberId));
        setRoutines(gymStore.getRoutines(selectedMemberId));
      }
    };
    update();
    const unsub = gymStore.subscribe(update);
    return unsub;
  }, [selectedMemberId]);

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !weightInput) return;

    gymStore.addMetric({
      memberId: selectedMemberId,
      recordedAt: new Date().toISOString(),
      weightKg: parseFloat(weightInput),
      bodyFatPercent: parseFloat(bodyFatInput) || 15.0,
      muscleMassKg: parseFloat(muscleMassInput) || 40.0,
      waistCm: parseFloat(waistInput) || undefined,
    });

    setWeightInput('');
    setBodyFatInput('');
    setMuscleMassInput('');
    setWaistInput('');
    setShowLogMetric(false);
  };

  const handleSavePr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !prWeight) return;

    const existingPr = prs.find((p) => p.exerciseName === prExercise);
    const newWeight = parseFloat(prWeight);

    gymStore.addPR({
      memberId: selectedMemberId,
      exerciseName: prExercise,
      weightKg: newWeight,
      reps: parseInt(prReps) || 1,
      achievedAt: new Date().toISOString(),
      previousRecordKg: existingPr ? existingPr.weightKg : undefined,
      notes: prNotes || 'Logged in training session.',
    });

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#f59e0b', '#ffffff'],
    });

    setPrWeight('');
    setPrNotes('');
    setShowLogPr(false);
  };

  // SVG Chart Calculation for Weight Trends
  const renderTrendChart = () => {
    if (metrics.length < 2) {
      return (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Need at least 2 recorded weigh-ins to plot progression line chart.</p>
        </div>
      );
    }

    const weights = metrics.map((m) => m.weightKg);
    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;
    const range = maxWeight - minWeight || 1;

    const chartWidth = 500;
    const chartHeight = 160;
    const padding = 30;

    const points = metrics.map((m, idx) => {
      const x = padding + (idx / (metrics.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((m.weightKg - minWeight) / range) * (chartHeight - padding * 2);
      return { x, y, val: m.weightKg, date: new Date(m.recordedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) };
    });

    const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '180px', overflow: 'visible' }}>
          {/* Subtle Grid Lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />

          {/* Area Gradient */}
          <defs>
            <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
            fill="url(#cyanGrad)"
          />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="#0c1017" stroke="#06b6d4" strokeWidth="2.5" />
              <text x={p.x} y={p.y - 10} fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="JetBrains Mono">
                {p.val}kg
              </text>
              <text x={p.x} y={chartHeight - 12} fill="#64748b" fontSize="10" textAnchor="middle">
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const initialWeight = metrics[0]?.weightKg;
  const currentWeight = metrics[metrics.length - 1]?.weightKg;
  const weightChange = initialWeight && currentWeight ? +(currentWeight - initialWeight).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-cyan">
              <Trophy size={13} />
              {language === 'id' ? 'Pelacak Kebugaran & PR' : 'Fitness & Progress Tracking'}
            </span>
            <span className="badge badge-emerald">PR Hall of Fame</span>
          </div>
          <h1>{t('fitness.title')}</h1>
          <p>{t('fitness.subtitle')}</p>
        </div>

        {/* Member Switcher */}
        <div className="surface-card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {activeMember && (
            <img 
              src={activeMember.avatarUrl} 
              alt={activeMember.fullName}
              style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
            />
          )}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'id' ? 'Pilih Atlet:' : 'Viewing Athlete:'}</div>
            <select 
              className="form-input"
              style={{ minHeight: '34px', padding: '0 var(--space-2)', fontSize: '0.88rem', fontWeight: 600 }}
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Body Composition on Left, PR Hall of Fame on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left Column: Body Composition & Trend */}
        <div className="surface-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{t('fitness.body_comp')}</h3>
              <p style={{ fontSize: '0.85rem' }}>{language === 'id' ? 'Tren berat & komposisi lemak tubuh' : 'Weight & body fat trend over time'}</p>
            </div>
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={() => setShowLogMetric(true)}
            >
              <Plus size={14} />
              {t('fitness.add_metric')}
            </button>
          </div>

          {/* High-Level Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <div className="surface-elevated" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Weight</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                {currentWeight ? `${currentWeight} kg` : '—'}
              </div>
              <div style={{ fontSize: '0.72rem', color: weightChange <= 0 ? 'var(--color-emerald)' : 'var(--color-amber)', fontWeight: 600 }}>
                {weightChange <= 0 ? `${weightChange} kg` : `+${weightChange} kg`} (total)
              </div>
            </div>

            <div className="surface-elevated" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Body Fat %</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                {metrics[metrics.length - 1]?.bodyFatPercent ? `${metrics[metrics.length - 1].bodyFatPercent}%` : '—'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lean Recomp</div>
            </div>

            <div className="surface-elevated" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Muscle Mass</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                {metrics[metrics.length - 1]?.muscleMassKg ? `${metrics[metrics.length - 1].muscleMassKg} kg` : '—'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-emerald)' }}>Skeletal Muscle</div>
            </div>
          </div>

          {/* Visual Trend Chart */}
          <div className="surface-elevated" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
              WEIGHT PROGRESSION (KG)
            </div>
            {renderTrendChart()}
          </div>
        </div>

        {/* Right Column: Personal Records (PR) Hall of Fame */}
        <div className="surface-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Trophy size={18} color="var(--color-amber)" />
                <h3>PR Hall of Fame</h3>
              </div>
              <p style={{ fontSize: '0.85rem' }}>Verified lifetime personal bests</p>
            </div>
            <button 
              type="button" 
              className="btn btn-emerald btn-sm"
              onClick={() => setShowLogPr(true)}
            >
              <Sparkles size={14} />
              Log New PR
            </button>
          </div>

          {/* PR List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '380px', overflowY: 'auto' }}>
            {prs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                <Trophy size={36} style={{ margin: '0 auto var(--space-2)', opacity: 0.3 }} />
                <p>No personal records logged for this athlete yet.</p>
              </div>
            ) : (
              prs.map((pr) => (
                <div 
                  key={pr.id}
                  className="surface-elevated"
                  style={{ 
                    padding: 'var(--space-4)', 
                    borderRadius: 'var(--radius-md)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderLeft: '4px solid var(--color-amber)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {pr.exerciseName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Achieved: {new Date(pr.achievedAt).toLocaleDateString()} • {pr.notes || 'Gym verification'}
                    </div>
                    {pr.previousRecordKg && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-emerald)', fontWeight: 600, marginTop: '2px' }}>
                        ▲ +{pr.weightKg - pr.previousRecordKg} kg milestone increase!
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-amber)', fontFamily: 'var(--font-display)' }}>
                      {pr.weightKg} kg
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {pr.reps} {pr.reps === 1 ? 'Rep Max' : 'Reps'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assigned Workout Routines Section */}
      <div className="surface-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <h3>Active Workout Routine & Exercise Splits</h3>
            <p style={{ fontSize: '0.85rem' }}>Trainer-assigned exercises, sets, target reps, and rest intervals.</p>
          </div>
        </div>

        {routines.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Dumbbell size={36} style={{ margin: '0 auto var(--space-2)', opacity: 0.3 }} />
            <p>No specific workout split assigned yet. Default full-body conditioning active.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
            {routines.map((rtn) => (
              <div key={rtn.id} className="surface-elevated" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge-cyan">{rtn.splitType} Split</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated {rtn.updatedAt}</span>
                </div>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>{rtn.title}</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {rtn.exercises.map((ex) => (
                    <div 
                      key={ex.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        padding: '6px 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ex.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.notes}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {ex.targetSets} x {ex.targetReps}
                        </span>
                        {ex.targetWeightKg && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                            @{ex.targetWeightKg}kg
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Metric Modal */}
      {showLogMetric && (
        <div className="modal-overlay" onClick={() => setShowLogMetric(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Record Body Composition</h3>
            <form onSubmit={handleSaveMetric} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Body Weight (kg) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 86.5"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Body Fat %</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  value={bodyFatInput}
                  onChange={(e) => setBodyFatInput(e.target.value)}
                  placeholder="e.g. 14.5"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Skeletal Muscle Mass (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  value={muscleMassInput}
                  onChange={(e) => setMuscleMassInput(e.target.value)}
                  placeholder="e.g. 42.8"
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogMetric(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log PR Modal */}
      {showLogPr && (
        <div className="modal-overlay" onClick={() => setShowLogPr(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Celebrate & Log New PR</h3>
            <form onSubmit={handleSavePr} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Exercise *</label>
                <select 
                  className="form-input"
                  value={prExercise}
                  onChange={(e) => setPrExercise(e.target.value)}
                >
                  <option value="Barbell Deadlift">Barbell Deadlift</option>
                  <option value="Flat Barbell Bench Press">Flat Barbell Bench Press</option>
                  <option value="Back Squat">Back Squat</option>
                  <option value="Overhead Press (OHP)">Overhead Press (OHP)</option>
                  <option value="Barbell Clean & Jerk">Barbell Clean & Jerk</option>
                  <option value="Weighted Pull-Up">Weighted Pull-Up</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Weight Achieved (kg) *</label>
                <input 
                  type="number" 
                  step="0.5" 
                  className="form-input" 
                  value={prWeight}
                  onChange={(e) => setPrWeight(e.target.value)}
                  placeholder="e.g. 145"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Repetitions</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={prReps}
                  onChange={(e) => setPrReps(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (Spotted by, RPE, equipment)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={prNotes}
                  onChange={(e) => setPrNotes(e.target.value)}
                  placeholder="e.g. Belt only, clean rep!"
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogPr(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-emerald" style={{ flex: 1 }}>
                  <Sparkles size={16} />
                  Record Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
