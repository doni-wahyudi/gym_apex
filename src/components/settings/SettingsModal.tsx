import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  X, 
  Download, 
  RefreshCw, 
  Server,
  Globe,
  Palette
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  testSupabaseConnection 
} from '../../services/supabaseClient';
import { gymStore } from '../../services/gymStore';
import { useLanguage } from '../../services/i18n';
import { useTheme } from '../../services/theme';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentTheme, changeTheme, themes } = useTheme();

  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCreds.anonKey);

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportData = () => {
    const jsonStr = gymStore.exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexforge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm(language === 'id' ? 'Reset semua data member, inventaris, dan kasir ke bawaan awal?' : 'Reset all gym members, inventory, and sales to factory defaults?')) {
      gymStore.resetToDefaultData();
      onClose();
    }
  };

  const copySqlSnippet = () => {
    const sampleSql = `-- Run this in Supabase SQL Editor:
-- Complete script is saved locally in /supabase_schema.sql
-- Check your project folder root for the full schema`;
    navigator.clipboard.writeText(sampleSql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-6)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="badge badge-cyan">
              <Database size={13} />
              {t('settings.title')}
            </span>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <h2 style={{ marginBottom: 'var(--space-2)' }}>{t('settings.title')}</h2>
        <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-5)' }}>
          {language === 'id' 
            ? 'Atur preferensi bahasa, tema warna aplikasi, dan koneksi cloud database Supabase Anda.' 
            : 'Configure system language, color theme, and connect your live Supabase cloud database.'}
        </p>

        {/* 1. Language & Theme Section */}
        <div className="surface-elevated" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
            <Globe size={18} color="var(--color-cyan)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('settings.language')}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className="surface-card"
              style={{
                padding: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                cursor: 'pointer',
                border: language === 'id' ? '2px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                background: language === 'id' ? 'var(--color-cyan-subtle)' : 'var(--bg-card)'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🇮🇩</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Bahasa Indonesia</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bawaan Sistem (Default)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className="surface-card"
              style={{
                padding: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                cursor: 'pointer',
                border: language === 'en' ? '2px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                background: language === 'en' ? 'var(--color-cyan-subtle)' : 'var(--bg-card)'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🇬🇧</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>English</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>International</div>
              </div>
            </button>
          </div>

          {/* 5 Color Theme Selector */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Palette size={16} color="var(--color-cyan)" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t('settings.theme')} (5 Pilihan)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: 'var(--space-2)' }}>
              {themes.map((th) => {
                const isSelected = currentTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => changeTheme(th.id)}
                    className="surface-card"
                    style={{
                      padding: 'var(--space-3) var(--space-2)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${th.color}` : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-surface)' : 'var(--bg-card)',
                      boxShadow: isSelected ? `0 0 12px ${th.color}40` : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        background: th.bgGrad,
                        boxShadow: `0 2px 8px ${th.color}60`,
                        border: isSelected ? '2px solid #ffffff' : 'none'
                      }} 
                    />
                    <div style={{ fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#ffffff' : 'var(--text-secondary)', textAlign: 'center' }}>
                      {th.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Supabase Connection Box */}
        <form onSubmit={handleSave} className="surface-elevated" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
            <Server size={18} color="var(--color-cyan)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Supabase PostgreSQL Connection</span>
          </div>

          <div className="form-group">
            <label className="form-label">Project URL</label>
            <input 
              type="text"
              className="form-input"
              placeholder="https://xyzproject.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Anon / Public API Key</label>
            <input 
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}
            />
          </div>

          {/* Test Connection Feedback */}
          {testResult && (
            <div 
              style={{ 
                padding: 'var(--space-3) var(--space-4)', 
                borderRadius: 'var(--radius-md)', 
                background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                border: `1px solid ${testResult.success ? 'var(--color-emerald)' : 'var(--color-rose)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: '0.85rem',
                color: testResult.success ? 'var(--color-emerald)' : '#fda4af'
              }}
            >
              {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleTestConnection}
              disabled={isTesting}
              style={{ flex: 1 }}
            >
              <RefreshCw size={14} />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>

            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {isSaved ? <Check size={16} /> : <CheckCircle size={16} />}
              {isSaved ? 'Saved!' : 'Save Credentials'}
            </button>
          </div>
        </form>

        {/* Database Schema Guide */}
        <div className="surface-elevated" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Database Schema Setup</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copySqlSnippet}>
              {copiedSchema ? <Check size={12} color="var(--color-emerald)" /> : <Copy size={12} />}
              {copiedSchema ? 'Copied' : 'Copy Schema Info'}
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
            A complete PostgreSQL table script with RLS policies and performance indexes is saved in your project root as <code>supabase_schema.sql</code>. Paste it into your Supabase SQL Editor.
          </p>
        </div>

        {/* Local Backup & Data Reset */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn-secondary" onClick={handleExportData} style={{ flex: 1 }}>
            <Download size={14} />
            Export Data Backup (JSON)
          </button>
          <button type="button" className="btn btn-danger" onClick={handleResetData} style={{ flex: 1 }}>
            Reset Factory Data
          </button>
        </div>
      </div>
    </div>
  );
};
