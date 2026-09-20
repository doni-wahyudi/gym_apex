import React, { useState } from 'react';
import { useAuth } from '../../services/auth';
import { useLanguage } from '../../services/i18n';

export const LoginPage: React.FC = () => {
  const { signIn, enterDemoMode } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(language === 'id' ? 'Email dan kata sandi wajib diisi.' : 'Email and password are required.');
      return;
    }
    setIsLoading(true);
    setError('');
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError);
    }
    setIsLoading(false);
  };

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      {/* Language toggle top-right */}
      <div className="login-lang-toggle">
        <button
          className={`lang-btn ${language === 'id' ? 'active' : ''}`}
          onClick={() => setLanguage('id')}
        >🇮🇩 ID</button>
        <button
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >🇺🇸 EN</button>
      </div>

      <div className="login-container">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 24h4l4-12 8 24 8-24 4 12h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"/>
            </svg>
          </div>
          <h1 className="login-app-name">ApexForge</h1>
          <p className="login-tagline">
            {language === 'id' ? 'Sistem Manajemen Gym Profesional' : 'Professional Gym Management System'}
          </p>
        </div>

        {/* Login card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>{language === 'id' ? 'Masuk ke Sistem' : 'Sign In'}</h2>
            <p>{language === 'id' ? 'Gunakan akun Supabase yang terdaftar' : 'Use your registered Supabase account'}</p>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className="login-field">
              <label htmlFor="login-email">
                <span className="field-icon">✉</span>
                {language === 'id' ? 'Alamat Email' : 'Email Address'}
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={language === 'id' ? 'pemilik@apexgym.id' : 'owner@apexgym.com'}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">
                <span className="field-icon">🔒</span>
                {language === 'id' ? 'Kata Sandi' : 'Password'}
              </label>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="login-spinner" />
              ) : (
                language === 'id' ? 'Masuk Sekarang' : 'Sign In Now'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>{language === 'id' ? 'atau' : 'or'}</span>
          </div>

          {/* Demo mode */}
          <button
            id="demo-mode-btn"
            className="demo-mode-btn"
            onClick={enterDemoMode}
          >
            <span className="demo-icon">🎮</span>
            <div className="demo-text">
              <strong>{language === 'id' ? 'Coba Mode Demo' : 'Try Demo Mode'}</strong>
              <small>{language === 'id' ? 'Data contoh lokal, tanpa login' : 'Local sample data, no login needed'}</small>
            </div>
            <span className="demo-arrow">→</span>
          </button>

          {/* Info note */}
          <p className="login-note">
            {language === 'id'
              ? '🔐 Daftarkan akun Anda di Supabase Authentication Dashboard, lalu masuk di sini.'
              : '🔐 Register your account in the Supabase Authentication Dashboard, then sign in here.'}
          </p>
        </div>

        {/* Footer */}
        <p className="login-footer">
          ApexForge GymOS &copy; {new Date().getFullYear()} &mdash;{' '}
          {language === 'id' ? 'Versi Demo Terbuka' : 'Open Demo Build'}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
