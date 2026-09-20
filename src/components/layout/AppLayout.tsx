import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ShoppingCart, 
  Users, 
  Trophy, 
  Calendar, 
  Wrench, 
  Settings, 
  Menu, 
  X, 
  Dumbbell, 
  Database, 
  ChevronRight,
  Clock,
  Smartphone,
  Globe,
  Palette
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import { getSupabaseCredentials } from '../../services/supabaseClient';
import { SettingsModal } from '../settings/SettingsModal';
import { StaffAttendanceModal } from '../staff/StaffAttendanceModal';
import { useLanguage } from '../../services/i18n';
import { useTheme } from '../../services/theme';
import { useAuth } from '../../services/auth';

export type UserRole = 'owner' | 'front_desk' | 'trainer' | 'member';

interface AppLayoutProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  children: React.ReactNode;
}

const ROLE_PROFILES: Record<UserRole, { name: string; avatar: string; allowedModules: string[] }> = {
  owner: {
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'checkin', 'pos', 'members', 'fitness', 'schedule', 'equipment', 'portal'],
  },
  front_desk: {
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    allowedModules: ['checkin', 'pos', 'members', 'schedule'],
  },
  trainer: {
    name: 'Coach Tyson',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    allowedModules: ['schedule', 'fitness'],
  },
  member: {
    name: 'Alex Wright',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    allowedModules: ['portal'],
  }
};

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  activeModule, 
  onNavigate, 
  userRole, 
  onRoleChange, 
  children 
}) => {
  const [stats, setStats] = useState(gymStore.getStats());
  const [showSettings, setShowSettings] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { currentTheme, changeTheme, themes } = useTheme();
  const { authMode, signOut } = useAuth();

  const creds = getSupabaseCredentials();
  const isSupabaseConfigured = Boolean(creds.url && creds.anonKey);

  const currentProfile = ROLE_PROFILES[userRole] || ROLE_PROFILES.owner;

  const getRoleTitle = (role: UserRole) => {
    if (language === 'id') {
      switch (role) {
        case 'owner': return 'Pemilik & Admin Gym';
        case 'front_desk': return 'Staf Resepsionis';
        case 'trainer': return 'Pelatih Utama';
        case 'member': return 'Member Aktif';
      }
    }
    switch (role) {
      case 'owner': return 'Gym Owner & Admin';
      case 'front_desk': return 'Front Desk Officer';
      case 'trainer': return 'Head Strength Coach';
      case 'member': return 'Pro Member';
    }
  };

  useEffect(() => {
    const unsub = gymStore.subscribe(() => {
      setStats(gymStore.getStats());
    });
    return unsub;
  }, []);

  const allNavItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, badge: undefined },
    { id: 'checkin', label: t('nav.checkin'), icon: ShieldCheck, badge: `${stats.occupancyCount} ${language === 'id' ? 'Di Dalam' : 'Inside'}` },
    { id: 'pos', label: t('nav.pos'), icon: ShoppingCart, badge: undefined },
    { id: 'members', label: t('nav.members'), icon: Users, badge: stats.atRiskMembersCount > 0 ? `${stats.atRiskMembersCount} ${language === 'id' ? 'Risiko' : 'Risk'}` : undefined },
    { id: 'fitness', label: t('nav.fitness'), icon: Trophy, badge: undefined },
    { id: 'schedule', label: t('nav.schedule'), icon: Calendar, badge: undefined },
    { id: 'equipment', label: t('nav.equipment'), icon: Wrench, badge: undefined },
    { id: 'portal', label: t('nav.portal'), icon: Smartphone, badge: language === 'id' ? 'Khusus Member' : 'Member View' },
  ];

  const navItems = allNavItems.filter((item) => currentProfile.allowedModules.includes(item.id));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          background: 'var(--sidebar-bg, var(--bg-subtle))',
          borderRight: '1px solid var(--sidebar-border, var(--border-medium))',
          boxShadow: 'var(--sidebar-glow, none)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
        className="desktop-sidebar"
      >
        {/* Top Branding */}
        <div>
          <div 
            style={{ 
              height: 'var(--header-height)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              padding: '0 var(--space-4)',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.4)'
                }}
              >
                <Dumbbell size={22} color="#ffffff" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                    APEXFORGE
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-cyan)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Gym Operating System
                  </div>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button 
                type="button" 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                title="Collapse Sidebar"
              >
                <ChevronRight size={16} style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }} />
              </button>
            )}
          </div>

          {/* Occupancy Pill in Sidebar */}
          {!sidebarCollapsed && (
            <div style={{ padding: 'var(--space-4)' }}>
              <div 
                className="surface-card" 
                style={{ 
                  padding: 'var(--space-3) var(--space-4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="pulse-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-emerald)', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Inside Facility:</span>
                </div>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>
                  {stats.occupancyCount} / {stats.maxCapacity}
                </span>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 var(--space-3)' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(8, 145, 178, 0.08) 100%)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-cyan)' : '3px solid transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Icon size={19} color={isActive ? 'var(--color-cyan)' : 'currentColor'} />
                    {!sidebarCollapsed && <span style={{ fontSize: '0.9rem' }}>{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span 
                      className={`badge ${item.id === 'members' ? 'badge-amber' : 'badge-emerald'}`} 
                      style={{ fontSize: '0.68rem', padding: '2px 7px' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User / Cloud Status Section */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Supabase Sync Badge */}
          {!sidebarCollapsed && (
            <div 
              onClick={() => setShowSettings(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: 'var(--space-2) var(--space-3)', 
                background: 'var(--bg-base)', 
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Database size={13} color={isSupabaseConfigured ? 'var(--color-emerald)' : 'var(--color-cyan)'} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {isSupabaseConfigured ? 'Supabase Connected' : 'Local Offline Mode'}
                </span>
              </div>
              <span className={`badge ${isSupabaseConfigured ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '0.62rem' }}>
                {isSupabaseConfigured ? 'CLOUD' : 'LOCAL'}
              </span>
            </div>
          )}

          {/* User Profile & Role Switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <img 
                  src={currentProfile.avatar} 
                  alt={currentProfile.name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-cyan)' }}
                />
                {!sidebarCollapsed && (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{currentProfile.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 600 }}>{getRoleTitle(userRole)}</div>
                  </div>
                )}
              </div>

              {!sidebarCollapsed && (
                <button 
                  type="button" 
                  onClick={() => setShowSettings(true)} 
                  className="btn-ghost" 
                  style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                  title="Settings & Cloud Config"
                >
                  <Settings size={18} />
                </button>
              )}
            </div>

            {/* Quick Role Switcher */}
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('role.simulate_role')}
                </div>
                <select
                  aria-label={t('role.simulate_role')}
                  className="form-input"
                  style={{ padding: '4px 8px', fontSize: '0.78rem', height: '30px', background: 'var(--bg-card)' }}
                  value={userRole}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                >
                  <option value="owner">{t('role.owner')}</option>
                  <option value="front_desk">{t('role.front_desk')}</option>
                  <option value="trainer">{t('role.trainer')}</option>
                  <option value="member">{t('role.member')}</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top App Header */}
        <header 
          style={{ 
            height: 'var(--header-height)', 
            borderBottom: '1px solid var(--header-border, var(--border-medium))', 
            background: 'var(--header-bg, var(--bg-subtle))', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0 var(--space-6)',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          {/* Mobile Menu Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button 
              type="button" 
              className="mobile-hamburger-btn btn-ghost" 
              onClick={() => setMobileMenuOpen(true)}
              style={{ display: 'none', padding: '6px' }}
            >
              <Menu size={22} />
            </button>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              ApexForge / <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{activeModule}</strong>
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
              {userRole.toUpperCase()}
            </span>
          </div>

          {/* Header Action Shortcuts, Language Toggle, and Theme Swatches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {/* 5 Theme Color Picker Swatches */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px', 
                background: 'var(--bg-card)', 
                padding: '4px 8px', 
                borderRadius: 'var(--radius-full)', 
                border: '1px solid var(--border-subtle)' 
              }} 
              title={language === 'id' ? 'Pilih Tema Warna (5 Pilihan)' : 'Select Theme Color (5 Options)'}
            >
              <Palette size={13} color="var(--text-muted)" style={{ marginRight: '2px' }} />
              {themes.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => changeTheme(th.id)}
                  style={{
                    width: currentTheme === th.id ? '16px' : '11px',
                    height: currentTheme === th.id ? '16px' : '11px',
                    borderRadius: '50%',
                    background: th.color,
                    border: currentTheme === th.id ? '2px solid #ffffff' : 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.15s ease',
                    boxShadow: currentTheme === th.id ? `0 0 8px ${th.color}` : 'none'
                  }}
                  title={th.name}
                />
              ))}
            </div>

            {/* Language Toggle: ID / EN */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              title={language === 'id' ? 'Ganti ke Bahasa Inggris' : 'Ganti ke Bahasa Indonesia'}
            >
              <Globe size={14} color="var(--color-cyan)" />
              <span style={{ fontWeight: 800 }}>{language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
            </button>

            {/* Desktop Action Shortcuts */}
            <div className="header-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {userRole !== 'member' && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowStaffModal(true)}
                  title={t('header.staff_shifts')}
                >
                  <Clock size={14} color="var(--color-amber)" />
                  {t('header.staff_shifts')}
                </button>
              )}

              {currentProfile.allowedModules.includes('checkin') && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('checkin')}
                >
                  <ShieldCheck size={14} color="var(--color-cyan)" />
                  {t('header.quick_checkin')}
                </button>
              )}

              {currentProfile.allowedModules.includes('pos') && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('pos')}
                >
                  <ShoppingCart size={14} color="var(--color-emerald)" />
                  {t('header.quick_sale')}
                </button>
              )}
            </div>

            {/* Auth status badge */}
            <button
              type="button"
              className={`auth-badge ${authMode === 'supabase' ? 'connected' : 'demo'}`}
              onClick={authMode === 'supabase' ? () => { if (window.confirm(language === 'id' ? 'Keluar dari akun Supabase?' : 'Sign out of Supabase?')) signOut(); } : () => setShowSettings(true)}
              title={authMode === 'supabase' ? (language === 'id' ? 'Terhubung ke Supabase — Klik untuk keluar' : 'Connected to Supabase — Click to sign out') : (language === 'id' ? 'Mode Demo — Klik untuk pengaturan' : 'Demo Mode — Click for settings')}
            >
              <Database size={11} />
              {authMode === 'supabase' ? (language === 'id' ? 'SUPABASE' : 'SUPABASE') : (language === 'id' ? 'DEMO' : 'DEMO')}
            </button>

            <button 
              type="button" 
              className="btn-ghost" 
              onClick={() => setShowSettings(true)}
              style={{ padding: '8px', borderRadius: '50%' }}
              title={t('header.settings')}
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="app-main-content" style={{ flex: 1, padding: 'var(--space-6)', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile Drawer (Capacitor Ready) */}
      {mobileMenuOpen && (
        <div className="modal-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '300px', height: '100vh', margin: 0, borderRadius: 0, position: 'fixed', left: 0, top: 0, padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Dumbbell size={20} color="var(--color-cyan)" />
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)' }}>APEXFORGE</span>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="btn-ghost">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Role Switcher */}
              <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                  {t('role.current_role')}
                </div>
                <select
                  aria-label={t('role.current_role')}
                  className="form-input"
                  style={{ padding: '6px 8px', fontSize: '0.8rem', background: 'var(--bg-card)' }}
                  value={userRole}
                  onChange={(e) => {
                    onRoleChange(e.target.value as UserRole);
                    setMobileMenuOpen(false);
                  }}
                >
                  <option value="owner">{t('role.owner')}</option>
                  <option value="front_desk">{t('role.front_desk')}</option>
                  <option value="trainer">{t('role.trainer')}</option>
                  <option value="member">{t('role.member')}</option>
                </select>
              </div>

              {/* Mobile Quick Language & Theme Controls */}
              <div style={{ marginBottom: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
                >
                  <Globe size={14} color="var(--color-cyan)" />
                  <span>{language === 'id' ? 'Bahasa: ID' : 'Lang: EN'}</span>
                </button>
              </div>

              {/* Mobile Theme Swatches */}
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-2)', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <Palette size={14} color="var(--text-muted)" />
                {themes.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => changeTheme(th.id)}
                    style={{
                      width: currentTheme === th.id ? '22px' : '16px',
                      height: currentTheme === th.id ? '22px' : '16px',
                      borderRadius: '50%',
                      background: th.color,
                      border: currentTheme === th.id ? '2px solid #ffffff' : 'none',
                      cursor: 'pointer',
                      padding: 0,
                      boxShadow: currentTheme === th.id ? `0 0 8px ${th.color}` : 'none'
                    }}
                    title={th.name}
                  />
                ))}
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ justifyContent: 'flex-start', width: '100%' }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Bottom Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
              {userRole !== 'member' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowStaffModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Clock size={16} color="var(--color-amber)" />
                  <span>{t('header.staff_shifts')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowSettings(true);
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Settings size={16} />
                <span>{t('header.settings')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile / Android Bottom Navigation Bar (Fixed at bottom for Capacitor app feel) */}
      <div 
        className="mobile-bottom-nav"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(var(--mobile-nav-height) + var(--safe-bottom))',
          paddingBottom: 'var(--safe-bottom)',
          background: 'rgba(15, 20, 29, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-medium)',
          zIndex: 100,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeModule === 'dashboard' ? 'var(--color-cyan)' : 'var(--text-muted)' }}
        >
          <LayoutDashboard size={20} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>{t('nav.home')}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('checkin')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeModule === 'checkin' ? 'var(--color-cyan)' : 'var(--text-muted)' }}
        >
          <ShieldCheck size={20} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>{t('nav.access')}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('pos')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeModule === 'pos' ? 'var(--color-cyan)' : 'var(--text-muted)' }}
        >
          <ShoppingCart size={20} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>POS</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('members')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeModule === 'members' ? 'var(--color-cyan)' : 'var(--text-muted)' }}
        >
          <Users size={20} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>{t('nav.members')}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'var(--text-muted)' }}
        >
          <Menu size={20} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>{t('nav.more')}</span>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Staff Shifts & Payroll Modal */}
      {showStaffModal && <StaffAttendanceModal onClose={() => setShowStaffModal(false)} />}
    </div>
  );
};
