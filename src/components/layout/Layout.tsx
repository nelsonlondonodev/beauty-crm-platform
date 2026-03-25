import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OnboardingWizard from '../onboarding/OnboardingWizard';
import { useAuth } from '../../contexts/AuthContext';
import { useStaff } from '../../hooks/useStaff';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { role } = useAuth();
  const { staff, loading: staffLoading } = useStaff();
  const [showWizard, setShowWizard] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!staffLoading && !hasChecked) {
      if (role === 'owner' && staff.length === 0) {
        setShowWizard(true);
      }
      setHasChecked(true);
    }
  }, [role, staff, staffLoading, hasChecked]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {showWizard && <OnboardingWizard onComplete={() => setShowWizard(false)} />}
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden transition-all md:pl-64">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
          <div className="animate-fade-in-up mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
