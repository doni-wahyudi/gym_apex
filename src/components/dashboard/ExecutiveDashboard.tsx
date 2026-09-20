import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  ShoppingCart, 
  UserPlus 
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { GymStats, Sale, CheckInRecord, Member } from '../../types/gym';
import { useLanguage } from '../../services/i18n';

interface ExecutiveDashboardProps {
  onNavigate: (module: string) => void;
  onSelectMemberForPos?: (member: Member) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onNavigate, onSelectMemberForPos }) => {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState<GymStats>(gymStore.getStats());
  const [recentSales, setRecentSales] = useState<Sale[]>(gymStore.getSales().slice(0, 4));
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>(gymStore.getCheckIns().slice(0, 5));
  const [members, setMembers] = useState<Member[]>(gymStore.getMembers());

  useEffect(() => {
    const update = () => {
      setStats(gymStore.getStats());
      setRecentSales(gymStore.getSales().slice(0, 4));
      setRecentCheckIns(gymStore.getCheckIns().slice(0, 5));
      setMembers(gymStore.getMembers());
    };
    const unsub = gymStore.subscribe(update);
    return unsub;
  }, []);

  const occupancyPercent = Math.round((stats.occupancyCount / stats.maxCapacity) * 100);

  // Hourly traffic distribution for heatmap
  const hourlyTraffic = [
    { hour: '06:00', count: 12, label: '6am' },
    { hour: '07:00', count: 28, label: '7am' },
    { hour: '08:00', count: 36, label: '8am' },
    { hour: '09:00', count: 22, label: '9am' },
    { hour: '10:00', count: 14, label: '10am' },
    { hour: '11:00', count: 10, label: '11am' },
    { hour: '12:00', count: 18, label: '12pm' },
    { hour: '13:00', count: 15, label: '1pm' },
    { hour: '14:00', count: 11, label: '2pm' },
    { hour: '15:00', count: 16, label: '3pm' },
    { hour: '16:00', count: 24, label: '4pm' },
    { hour: '17:00', count: 44, label: '5pm' },
    { hour: '18:00', count: 52, label: '6pm' },
    { hour: '19:00', count: 48, label: '7pm' },
    { hour: '20:00', count: 30, label: '8pm' },
    { hour: '21:00', count: 14, label: '9pm' },
  ];
  const maxTraffic = Math.max(...hourlyTraffic.map((h) => h.count));

  // At-risk members
  const atRiskMembers = members.filter((m) => {
    if (m.status !== 'active') return false;
    if (!m.lastVisitDate) return true;
    return Date.now() - new Date(m.lastVisitDate).getTime() > 14 * 24 * 60 * 60 * 1000;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Welcome & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-cyan">
              <Activity size={13} />
              {language === 'id' ? 'Kokpit Eksekutif Gym' : 'Owner Executive Cockpit'}
            </span>
            <span className="badge badge-emerald">{language === 'id' ? 'Operasi Langsung' : 'Live Operations'}</span>
          </div>
          <h1>{t('dash.title')}</h1>
          <p>{t('dash.subtitle')}</p>
        </div>

        {/* Quick Launch Bar */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('checkin')}>
            <ShieldCheck size={16} />
            {t('nav.checkin')}
          </button>
          <button type="button" className="btn btn-emerald" onClick={() => onNavigate('pos')}>
            <ShoppingCart size={16} />
            {t('nav.pos')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('members')}>
            <UserPlus size={16} />
            {t('members.add_member')}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Card 1: Today's Turnover */}
        <div className="surface-card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--color-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('dash.today_revenue')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--color-cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="var(--color-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            ${stats.todayRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <TrendingUp size={14} />
            <span>+18.4% vs same day last week</span>
          </div>
        </div>

        {/* Card 2: Facility Occupancy */}
        <div className="surface-card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--color-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('dash.occupancy')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--color-emerald-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--color-emerald)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {stats.occupancyCount}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              / {stats.maxCapacity} Max
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-base)', borderRadius: 'var(--radius-full)', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${occupancyPercent}%`, height: '100%', background: 'var(--color-emerald)', borderRadius: 'var(--radius-full)' }} />
          </div>
        </div>

        {/* Card 3: Today's Check-ins */}
        <div className="surface-card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--color-purple)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {language === 'id' ? 'Kunjungan Hari Ini' : 'Total Visits Today'}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--color-purple-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="var(--color-purple)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {stats.todayCheckIns} {language === 'id' ? 'Check-In' : 'Swipes'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {stats.activeMembersCount} {language === 'id' ? 'Member Aktif Terdaftar' : 'Active Members Enrolled'}
          </div>
        </div>

        {/* Card 4: Retention Health / At-Risk */}
        <div className="surface-card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--color-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {language === 'id' ? 'Perhatian Retensi' : 'Retention Attention'}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--color-amber-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="var(--color-amber)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-amber)', fontFamily: 'var(--font-display)' }}>
            {stats.atRiskMembersCount} {language === 'id' ? 'Berisiko Churn' : 'At-Risk'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stats.expiringThisWeekCount} {language === 'id' ? 'paket habis dlm <7 hari' : 'memberships expiring <7 days'}
          </div>
        </div>
      </div>

      {/* Main Section: Peak Hours Heatmap + At-Risk Retention Warning */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Peak Hours Traffic Heatmap */}
        <div className="surface-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <h3>{t('dash.peak_hours')}</h3>
              <span className="badge badge-cyan">{language === 'id' ? 'Kepadatan Fasilitas' : 'Facility Foot-Traffic'}</span>
            </div>
            <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-5)' }}>
              {language === 'id' 
                ? 'Puncak kunjungan tertinggi berada pada pukul 17:00 – 19:30 dan 07:00 – 09:00.' 
                : 'Peak rush occurs between 5:00 PM – 7:30 PM and 7:00 AM – 9:00 AM.'}
            </p>
          </div>

          {/* Histogram Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', paddingBottom: '24px', position: 'relative' }}>
            {hourlyTraffic.map((h, i) => {
              const heightPct = Math.round((h.count / maxTraffic) * 100);
              const isPeak = h.count > 40;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div 
                    title={`${h.hour}: ~${h.count} ${language === 'id' ? 'pengunjung' : 'attendees'}`}
                    style={{ 
                      width: '100%', 
                      height: `${heightPct}%`, 
                      background: isPeak ? 'var(--color-cyan)' : 'rgba(255, 255, 255, 0.12)', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-emerald)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isPeak ? 'var(--color-cyan)' : 'rgba(255, 255, 255, 0.12)')}
                  />
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', whiteSpace: 'nowrap' }}>
                    {i % 2 === 0 ? h.label : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* At-Risk Retention Action Box */}
        <div className="surface-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertTriangle size={20} color="var(--color-amber)" />
              <h3>{t('dash.at_risk_churn')}</h3>
            </div>
            <span className="badge badge-amber">{language === 'id' ? 'Perlu Tindakan' : 'Action Required'}</span>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {t('dash.at_risk_desc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {atRiskMembers.map((m) => (
              <div 
                key={m.id}
                className="surface-elevated"
                style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <img src={m.avatarUrl} alt={m.fullName} style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-amber)' }}>
                      Last visited 18 days ago • {m.tierName}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {onSelectMemberForPos && (
                    <button
                      type="button"
                      onClick={() => onSelectMemberForPos(m)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem' }}
                    >
                      {t('dash.renew_pos')}
                    </button>
                  )}

                  <a 
                    href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(m.fullName)},%20kami%20merindukan%20kehadiran%20Anda%20di%20ApexForge%20Gym!`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-emerald btn-sm"
                    style={{ fontSize: '0.72rem' }}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split Stream: Recent Sales on Left, Recent Turnstile Access on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Recent Sales */}
        <div className="surface-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3>Latest POS Transactions</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('pos')}>
              View Register &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {recentSales.map((sale) => (
              <div 
                key={sale.id}
                className="surface-elevated"
                style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{sale.invoiceNo}</strong>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{sale.paymentMethod}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {sale.customerName} • {sale.items.length} item(s)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                    ${sale.total.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Check-Ins */}
        <div className="surface-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3>Turnstile Access Feed</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('checkin')}>
              View Kiosk &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {recentCheckIns.map((chk) => (
              <div 
                key={chk.id}
                className="surface-elevated"
                style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <img src={chk.memberAvatar} alt={chk.memberName} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{chk.memberName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{chk.tierName}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${chk.status === 'granted' ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                    {chk.status === 'granted' ? 'GRANTED' : 'DENIED'}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
