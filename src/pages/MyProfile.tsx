import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Mail, CheckCircle } from 'lucide-react';


const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${user?.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        // Fallback to auth context
        if (user) {
          setProfile({
            id: user.id,
            email: user.email,
            firstName: user.email.split('@')[0],
            lastName: '',
            phoneNumber: '+91 98765 43210',
            role: user.role
          });
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading account profile...</p>
      </div>
    );
  }

  const p = profile || user;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>My Account Profile</h1>
        <p style={{ fontSize: '0.95rem' }}>Manage your personal credentials, contact info, and travel preferences.</p>
      </div>

      {/* Main Profile Header Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow)',
          }}>
            {p?.email ? p.email.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: '1.6rem' }}>
                {p?.firstName ? `${p.firstName} ${p?.lastName || ''}` : p?.email?.split('@')[0]}
              </h2>
              <span className={`badge ${p?.role === 'ADMIN' ? 'badge-amber' : p?.role === 'OPERATOR' ? 'badge-cyan' : 'badge-emerald'}`}>
                {p?.role || 'PASSENGER'}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> {p?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Account Credentials Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          Contact & Identification Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>First Name</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
              {p?.firstName || 'Registered'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Last Name</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
              {p?.lastName || 'Passenger'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
              {p?.email}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
              {p?.phoneNumber || '+91 98765 43210'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>System User ID</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary-light)', marginTop: '4px' }}>
              #{p?.id || '1'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Account Status</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={15} /> Active Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
