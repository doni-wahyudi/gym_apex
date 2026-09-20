import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import type { UserRole } from './components/layout/AppLayout';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { CheckInKiosk } from './components/checkin/CheckInKiosk';
import { PosRegister } from './components/pos/PosRegister';
import { MemberDirectory } from './components/members/MemberDirectory';
import { ProgressTracker } from './components/fitness/ProgressTracker';
import { ClassScheduleView } from './components/schedule/ClassScheduleView';
import { EquipmentManager } from './components/equipment/EquipmentManager';
import { MemberPortalView } from './components/portal/MemberPortalView';
import type { Member } from './types/gym';
import './App.css';

export function App() {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [posMember, setPosMember] = useState<Member | null>(null);

  const handleNavigateToPosWithMember = (member: Member) => {
    setPosMember(member);
    setActiveModule('pos');
  };

  const handleNavigate = (module: string) => {
    setActiveModule(module);
    if (module !== 'pos') {
      // Clear preselected member if leaving POS
      setPosMember(null);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'member') {
      setActiveModule('portal');
    } else if (newRole === 'front_desk' && !['checkin', 'pos', 'members', 'schedule'].includes(activeModule)) {
      setActiveModule('checkin');
    } else if (newRole === 'trainer' && !['schedule', 'fitness'].includes(activeModule)) {
      setActiveModule('schedule');
    } else if (newRole === 'owner' && activeModule === 'portal') {
      setActiveModule('dashboard');
    }
  };

  return (
    <AppLayout 
      activeModule={activeModule} 
      onNavigate={handleNavigate}
      userRole={userRole}
      onRoleChange={handleRoleChange}
    >
      {activeModule === 'dashboard' && (
        <ExecutiveDashboard 
          onNavigate={handleNavigate} 
          onSelectMemberForPos={handleNavigateToPosWithMember}
        />
      )}

      {activeModule === 'checkin' && (
        <CheckInKiosk onNavigateToPosWithMember={handleNavigateToPosWithMember} />
      )}

      {activeModule === 'pos' && (
        <PosRegister initialMember={posMember} />
      )}

      {activeModule === 'members' && (
        <MemberDirectory onNavigateToPosWithMember={handleNavigateToPosWithMember} />
      )}

      {activeModule === 'fitness' && (
        <ProgressTracker />
      )}

      {activeModule === 'schedule' && (
        <ClassScheduleView />
      )}

      {activeModule === 'equipment' && (
        <EquipmentManager />
      )}

      {activeModule === 'portal' && (
        <MemberPortalView onBackToAdmin={() => handleRoleChange('owner')} />
      )}
    </AppLayout>
  );
}

export default App;
