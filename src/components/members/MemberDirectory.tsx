import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ChevronRight, 
  ShieldAlert, 
  CreditCard, 
  UserCheck 
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { Member } from '../../types/gym';
import { AddMemberModal } from './AddMemberModal';
import { MemberDetailModal } from './MemberDetailModal';
import { useLanguage } from '../../services/i18n';

interface MemberDirectoryProps {
  onNavigateToPosWithMember?: (member: Member) => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({ onNavigateToPosWithMember }) => {
  const [members, setMembers] = useState(gymStore.getMembers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'at_risk' | 'expired'>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const unsub = gymStore.subscribe(() => {
      setMembers(gymStore.getMembers());
    });
    return unsub;
  }, []);

  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  // Filter logic
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return m.status === 'active';
    if (statusFilter === 'expired') return m.status === 'expired' || new Date(m.expiryDate).getTime() < nowMs;
    
    if (statusFilter === 'expiring') {
      const expMs = new Date(m.expiryDate).getTime();
      return expMs >= nowMs && expMs <= nowMs + sevenDaysMs;
    }

    if (statusFilter === 'at_risk') {
      if (m.status !== 'active') return false;
      if (!m.lastVisitDate) return true;
      return nowMs - new Date(m.lastVisitDate).getTime() > fourteenDaysMs;
    }

    return true;
  });

  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiringCount = members.filter((m) => {
    const expMs = new Date(m.expiryDate).getTime();
    return expMs >= nowMs && expMs <= nowMs + sevenDaysMs;
  }).length;
  const atRiskCount = members.filter((m) => {
    if (m.status !== 'active') return false;
    if (!m.lastVisitDate) return true;
    return nowMs - new Date(m.lastVisitDate).getTime() > fourteenDaysMs;
  }).length;
  const expiredCount = members.filter((m) => m.status === 'expired' || new Date(m.expiryDate).getTime() < nowMs).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-cyan">
              <Users size={13} />
              {language === 'id' ? 'CRM & Retensi Anggota' : 'Member CRM & Retention'}
            </span>
            <span className="badge badge-emerald">{members.length} {language === 'id' ? 'Total Terdaftar' : 'Total Registered'}</span>
          </div>
          <h1>{t('members.title')}</h1>
          <p>{t('members.subtitle')}</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} />
          {t('members.add_member')}
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            <input 
              type="text"
              className="form-input"
              placeholder={t('members.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>

        {/* Status Category Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('all')}
          >
            {t('members.all')} ({members.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'active' ? 'btn-emerald' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('active')}
          >
            {t('members.active')} ({activeCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'expiring' ? 'btn-primary' : 'btn-secondary'}`}
            style={statusFilter === 'expiring' ? { background: 'var(--color-amber)', color: '#000' } : {}}
            onClick={() => setStatusFilter('expiring')}
          >
            {t('members.expiring')} &lt;7d ({expiringCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'at_risk' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('at_risk')}
          >
            <ShieldAlert size={14} />
            {t('members.at_risk')} ({atRiskCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'expired' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('expired')}
          >
            {t('members.expired')} ({expiredCount})
          </button>
        </div>
      </div>

      {/* Member Directory Grid / List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filteredMembers.length === 0 ? (
          <div className="surface-card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ margin: '0 auto var(--space-3)', opacity: 0.3 }} />
            <h3>No members match your criteria</h3>
            <p style={{ marginTop: 'var(--space-1)' }}>Try adjusting your search keywords or filter tab.</p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isExp = new Date(member.expiryDate).getTime() < nowMs;
            const daysLeft = Math.ceil((new Date(member.expiryDate).getTime() - nowMs) / (1000 * 60 * 60 * 24));
            const daysSinceLastVisit = member.lastVisitDate
              ? Math.floor((nowMs - new Date(member.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
              : null;
            const isAtRisk = daysSinceLastVisit !== null && daysSinceLastVisit > 14;

            return (
              <div 
                key={member.id}
                className="surface-card"
                style={{ 
                  padding: 'var(--space-4) var(--space-5)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${
                    isExp 
                      ? 'var(--color-rose)' 
                      : isAtRisk 
                      ? 'var(--color-amber)' 
                      : 'var(--color-emerald)'
                  }`
                }}
                onClick={() => setSelectedMember(member)}
              >
                {/* Member Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', minWidth: '220px' }}>
                  <img 
                    src={member.avatarUrl} 
                    alt={member.fullName}
                    style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '1px solid var(--border-medium)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{member.fullName}</strong>
                      <span className={`badge ${member.status === 'active' ? 'badge-emerald' : member.status === 'expiring' ? 'badge-amber' : 'badge-rose'}`} style={{ fontSize: '0.68rem' }}>
                        {member.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-2)', marginTop: '2px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{member.memberCode}</span>
                      <span>•</span>
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Tier & Validity */}
                <div style={{ minWidth: '160px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan Tier</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-cyan)', fontSize: '0.9rem' }}>{member.tierName}</div>
                  <div style={{ fontSize: '0.75rem', color: isExp ? 'var(--color-rose)' : 'var(--text-secondary)' }}>
                    Expires: {member.expiryDate} {daysLeft >= 0 ? `(${daysLeft}d)` : '(EXPIRED)'}
                  </div>
                </div>

                {/* Activity & Retention Indicators */}
                <div style={{ minWidth: '140px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Visits</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.totalVisits} check-ins</div>
                  <div style={{ fontSize: '0.75rem', color: isAtRisk ? 'var(--color-amber)' : 'var(--text-muted)' }}>
                    {daysSinceLastVisit === null ? 'Never checked in' : daysSinceLastVisit === 0 ? 'Today' : `${daysSinceLastVisit} days ago`}
                    {isAtRisk && ' ⚠️ At-Risk'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} onClick={(e) => e.stopPropagation()}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedMember(member)}
                  >
                    View Card
                  </button>

                  {isExp && onNavigateToPosWithMember && (
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm"
                      onClick={() => onNavigateToPosWithMember(member)}
                    >
                      <CreditCard size={13} />
                      Renew
                    </button>
                  )}

                  {!isExp && (
                    <button 
                      type="button" 
                      className="btn btn-emerald btn-sm"
                      onClick={() => gymStore.checkInMember(member.id, 'entry')}
                    >
                      <UserCheck size={13} />
                      Check In
                    </button>
                  )}

                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onMemberAdded={(id) => {
        const m = gymStore.getMemberById(id);
        if (m) setSelectedMember(m);
      }} />}

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberDetailModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
          onNavigateToPos={(m) => {
            setSelectedMember(null);
            if (onNavigateToPosWithMember) onNavigateToPosWithMember(m);
          }}
        />
      )}
    </div>
  );
};
