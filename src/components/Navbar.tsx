import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bus, Search, Ticket, Shield, LogOut, LogIn, UserPlus, Sparkles, SlidersHorizontal, ChevronDown, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

import api from '../services/api';

const Navbar: React.FC = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showSignInMenu, setShowSignInMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickDemoLogin = async (role: 'ADMIN' | 'OPERATOR' | 'USER') => {
    setShowDemoMenu(false);
    let email = 'passenger@gmail.com';
    let target = '/search';
    if (role === 'ADMIN') {
      email = 'admin@busticket.com';
      target = '/admin';
    } else if (role === 'OPERATOR') {
      email = 'operator1@example.com';
      target = '/operator';
    }

    try {
      const res = await api.post('/auth/login', { email, password: 'password' });
      const userData = res.data.user || {
        id: res.data.id || email,
        email: res.data.email,
        role: res.data.role
      };
      login(res.data.token, userData);
      navigate(target);
    } catch (err) {
      console.error('Quick login error', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-box">
            <Bus size={22} />
          </div>
          <span>
            Sky<span style={{ color: 'var(--primary-light)' }}>Bus</span>{' '}
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '2px 6px', borderRadius: '6px', marginLeft: '4px' }}>LUXE</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
            <Search size={16} /> Search Routes
          </Link>
          {user && (
            <>
              <Link to="/history" className={`nav-link ${isActive('/history') ? 'active' : ''}`}>
                <Ticket size={16} /> My Bookings
              </Link>
              {user.role === 'ADMIN' && user.email?.toLowerCase() === 'admin@busticket.com' && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                  <Shield size={16} style={{ color: '#f59e0b' }} /> Admin Panel
                </Link>
              )}
              {user.role === 'OPERATOR' && (
                <Link to="/operator" className={`nav-link ${isActive('/operator') ? 'active' : ''}`}>
                  <SlidersHorizontal size={16} style={{ color: '#06b6d4' }} /> Operator Fleet
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Nav Actions */}
        <div className="nav-actions">
          <ThemeToggle />
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" className="user-pill" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="user-avatar-badge">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main, #ffffff)' }}>
                    {user.email.split('@')[0]}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: user.role === 'ADMIN' ? 'var(--amber)' : user.role === 'OPERATOR' ? 'var(--cyan)' : 'var(--emerald)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {user.role}
                  </span>
                </div>
              </Link>

              <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Quick Demo Switcher */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.78rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                >
                  <Sparkles size={13} style={{ color: 'var(--primary-light)' }} /> Quick Test Login
                </button>
                {showDemoMenu && (
                  <div
                    className="navbar-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '110%',
                      right: 0,
                      background: 'var(--bg-surface-elevated, #0f172a)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      width: '180px',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 150,
                    }}
                  >
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: 'flex-start', fontSize: '0.82rem', color: 'var(--text-main)' }}
                      onClick={() => handleQuickDemoLogin('USER')}
                    >
                      👤 Passenger
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: 'flex-start', fontSize: '0.82rem', color: 'var(--text-main)' }}
                      onClick={() => handleQuickDemoLogin('OPERATOR')}
                    >
                      🚌 Operator
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: 'flex-start', fontSize: '0.82rem', color: 'var(--text-main)' }}
                      onClick={() => handleQuickDemoLogin('ADMIN')}
                    >
                      🛡️ Admin
                    </button>
                  </div>
                )}
              </div>

              {/* Sign In Dropdown for 3 Separate Portals */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignInMenu(!showSignInMenu);
                    setShowDemoMenu(false);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ gap: '6px' }}
                >
                  <LogIn size={15} /> Sign In <ChevronDown size={13} style={{ opacity: 0.7 }} />
                </button>

                {showSignInMenu && (
                  <div
                    className="navbar-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '115%',
                      right: 0,
                      background: 'var(--bg-surface-elevated, rgba(15, 23, 42, 0.95))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '16px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      width: '240px',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 200,
                    }}
                  >
                    <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Select Login Portal
                    </div>

                    <Link
                      to="/login"
                      onClick={() => setShowSignInMenu(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ 
                        justifyContent: 'flex-start', 
                        fontSize: '0.84rem', 
                        padding: '10px 12px',
                        borderRadius: '10px',
                        display: 'flex',
                        gap: '10px'
                      }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                        <User size={15} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main, #ffffff)' }}>Passenger Portal</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Book tickets & seats</span>
                      </div>
                    </Link>

                    <Link
                      to="/operator/login"
                      onClick={() => setShowSignInMenu(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ 
                        justifyContent: 'flex-start', 
                        fontSize: '0.84rem', 
                        padding: '10px 12px',
                        borderRadius: '10px',
                        display: 'flex',
                        gap: '10px'
                      }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
                        <SlidersHorizontal size={15} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main, #ffffff)' }}>Operator Portal</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Manage bus fleet</span>
                      </div>
                    </Link>

                    <Link
                      to="/admin/login"
                      onClick={() => setShowSignInMenu(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ 
                        justifyContent: 'flex-start', 
                        fontSize: '0.84rem', 
                        padding: '10px 12px',
                        borderRadius: '10px',
                        display: 'flex',
                        gap: '10px'
                      }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
                        <Shield size={15} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main, #ffffff)' }}>Admin Console</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Master system controls</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
