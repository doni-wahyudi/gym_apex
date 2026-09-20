import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  MapPin, 
  Search 
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { EquipmentItem } from '../../types/gym';
import { useLanguage } from '../../services/i18n';

export const EquipmentManager: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(gymStore.getEquipment());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState<'all' | 'operational' | 'maintenance_due' | 'out_of_order'>('all');

  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [newStatus, setNewStatus] = useState<'operational' | 'maintenance_due' | 'out_of_order'>('operational');
  const [statusNotes, setStatusNotes] = useState('');
  const { language, t } = useLanguage();

  useEffect(() => {
    const unsub = gymStore.subscribe(() => {
      setEquipment(gymStore.getEquipment());
    });
    return unsub;
  }, []);

  const filteredItems = equipment.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterCondition !== 'all' && eq.condition !== filterCondition) return false;
    return true;
  });

  const operationalCount = equipment.filter((e) => e.condition === 'operational').length;
  const maintenanceCount = equipment.filter((e) => e.condition === 'maintenance_due').length;
  const outOfOrderCount = equipment.filter((e) => e.condition === 'out_of_order').length;

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    gymStore.updateEquipmentCondition(editingItem.id, newStatus, statusNotes);
    setEditingItem(null);
    setStatusNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-cyan">
              <Wrench size={13} />
              {language === 'id' ? 'Fasilitas & Aset' : 'Facility & Assets'}
            </span>
            <span className="badge badge-emerald">{equipment.length} {language === 'id' ? 'Unit Terdaftar' : 'Machines Registered'}</span>
          </div>
          <h1>{t('equipment.title')}</h1>
          <p>{t('equipment.subtitle')}</p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="surface-card" style={{ padding: 'var(--space-4)', borderLeft: '4px solid var(--color-emerald)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('equipment.operational')}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
            {operationalCount} Units
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'id' ? 'Siap digunakan latihan' : 'Ready for member workouts'}</div>
        </div>

        <div className="surface-card" style={{ padding: 'var(--space-4)', borderLeft: '4px solid var(--color-amber)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('equipment.maintenance')}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-amber)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
            {maintenanceCount} Units
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'id' ? 'Jadwal servis berkala' : 'Service inspection scheduled'}</div>
        </div>

        <div className="surface-card" style={{ padding: 'var(--space-4)', borderLeft: '4px solid var(--color-rose)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('equipment.out_of_order')}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-rose)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
            {outOfOrderCount} Units
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'id' ? 'Nonaktif untuk perbaikan' : 'Tagged out for repairs'}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Search machinery name, serial code, or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button 
            type="button" 
            className={`btn btn-sm ${filterCondition === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterCondition('all')}
          >
            All Machinery ({equipment.length})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${filterCondition === 'operational' ? 'btn-emerald' : 'btn-secondary'}`}
            onClick={() => setFilterCondition('operational')}
          >
            Operational ({operationalCount})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${filterCondition === 'maintenance_due' ? 'btn-primary' : 'btn-secondary'}`}
            style={filterCondition === 'maintenance_due' ? { background: 'var(--color-amber)', color: '#000' } : {}}
            onClick={() => setFilterCondition('maintenance_due')}
          >
            Maintenance Due ({maintenanceCount})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${filterCondition === 'out_of_order' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setFilterCondition('out_of_order')}
          >
            Out of Order ({outOfOrderCount})
          </button>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            className="surface-card"
            style={{ 
              padding: 'var(--space-5)', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              borderTop: `4px solid ${
                item.condition === 'operational' 
                  ? 'var(--color-emerald)' 
                  : item.condition === 'maintenance_due' 
                  ? 'var(--color-amber)' 
                  : 'var(--color-rose)'
              }`
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                <span className={`badge ${
                  item.condition === 'operational' 
                    ? 'badge-emerald' 
                    : item.condition === 'maintenance_due' 
                    ? 'badge-amber' 
                    : 'badge-rose'
                }`}>
                  {item.condition === 'operational' ? (
                    <CheckCircle2 size={12} />
                  ) : item.condition === 'maintenance_due' ? (
                    <AlertTriangle size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {item.condition.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>{item.name}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <MapPin size={13} color="var(--color-cyan)" />
                  <span>{item.locationFloor}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Serial:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{item.serialNumber}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Calendar size={13} color="var(--text-muted)" />
                  <span>Next Service Due: <strong style={{ color: item.condition === 'maintenance_due' ? 'var(--color-amber)' : 'var(--text-primary)' }}>{item.nextServiceDueDate}</strong></span>
                </div>
              </div>

              {item.notes && (
                <div style={{ background: 'var(--bg-base)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                  {item.notes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditingItem(item);
                  setNewStatus(item.condition);
                  setStatusNotes(item.notes || '');
                }}
                style={{ flex: 1 }}
              >
                <Wrench size={13} />
                Update Status / Service
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Condition Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Update Machine Condition</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-cyan)', marginBottom: 'var(--space-4)' }}>
              {editingItem.name} ({editingItem.serialNumber})
            </p>

            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Operating Condition *</label>
                <select 
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                >
                  <option value="operational">Operational (Safe for Use)</option>
                  <option value="maintenance_due">Maintenance Due (Inspection Scheduled)</option>
                  <option value="out_of_order">Out of Order (Tagged Out)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Comments & Log</label>
                <textarea 
                  className="form-input"
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Incline motor repaired, lubricated deck belt..."
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
