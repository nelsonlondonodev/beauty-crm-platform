import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import {
  LandingNavbar,
  LandingHero,
  LandingFeatures,
  LandingValueProp,
  LandingFooter
} from '../components/landing';

const Landing = () => {
  const navigate = useNavigate();
  const { session, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (session && !authLoading) {
      if (role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [session, role, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-purple-500/30 overflow-hidden font-sans">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingValueProp />
      <LandingFooter />
    </div>
  );
};

export default Landing;
