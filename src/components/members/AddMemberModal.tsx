import React, { useState } from 'react';
import { UserPlus, X, Sparkles } from 'lucide-react';
import { gymStore } from '../../services/gymStore';

interface AddMemberModalProps {
  onClose: () => void;
  onMemberAdded?: (memberId: string) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onMemberAdded }) => {
  const plans = gymStore.getPlans();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [tierId, setTierId] = useState(plans[1]?.id || plans[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [waiverSigned, setWaiverSigned] = useState(true);

  // Avatar presets
  const [avatarIndex, setAvatarIndex] = useState(0);
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !tierId) return;

    const selectedPlan = plans.find((p) => p.id === tierId);
    const durationDays = selectedPlan ? selectedPlan.durationDays : 30;
    const expiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newMember = gymStore.addMember({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarUrl: avatarPresets[avatarIndex],
      emergencyContact: emergencyContact.trim(),
      emergencyPhone: emergencyPhone.trim(),
      gender,
      joinDate: new Date().toISOString().split('T')[0],
      tierId,
      tierName: selectedPlan?.name || 'Standard Pass',
      status: 'active',
      expiryDate: expiry,
      waiverSigned,
      notes: notes.trim(),
    });

    if (onMemberAdded) {
      onMemberAdded(newMember.id);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '580px', padding: 'var(--space-6)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="badge badge-cyan">
              <UserPlus size={13} />
              Member Onboarding
            </span>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <h2 style={{ marginBottom: 'var(--space-2)' }}>Register New Member</h2>
        <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-5)' }}>
          Create an athlete profile, assign membership tier, and generate a barcode access ID.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Avatar Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Select Athlete Avatar:</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {avatarPresets.map((url, idx) => (
                <img 
                  key={idx}
                  src={url}
                  alt={`Avatar ${idx}`}
                  onClick={() => setAvatarIndex(idx)}
                  style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: 'var(--radius-md)', 
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: avatarIndex === idx ? '2px solid var(--color-cyan)' : '2px solid transparent',
                    opacity: avatarIndex === idx ? 1 : 0.6,
                    transform: avatarIndex === idx ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Primary Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-input" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input 
                type="tel" 
                className="form-input" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rachel@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                className="form-input"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Membership Tier */}
          <div className="form-group">
            <label className="form-label">Membership Tier *</label>
            <select 
              className="form-input"
              value={tierId}
              onChange={(e) => setTierId(e.target.value)}
              required
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — ${plan.price} ({plan.durationDays} Days)
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label">Emergency Contact Person</label>
              <input 
                type="text" 
                className="form-input" 
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. John Adams (Spouse)"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Phone</label>
              <input 
                type="tel" 
                className="form-input" 
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+1 (555) 987-6543"
              />
            </div>
          </div>

          {/* Fitness Goals / Notes */}
          <div className="form-group">
            <label className="form-label">Fitness Goals / Medical Notes</label>
            <input 
              type="text" 
              className="form-input" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hypertrophy, lower back tightness..."
            />
          </div>

          {/* Waiver */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={waiverSigned}
              onChange={(e) => setWaiverSigned(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-cyan)' }}
            />
            <span>Member has acknowledged and signed physical gym liability waiver.</span>
          </label>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Sparkles size={16} />
              Register Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
