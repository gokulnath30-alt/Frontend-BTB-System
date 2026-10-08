import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Shield, 
  SlidersHorizontal, 
  User, 
  LogIn, 
  AlertCircle,
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export type LoginModule = 'USER' | 'OPERATOR' | 'ADMIN';

interface LoginProps {
  defaultModule?: LoginModule;
}

interface ModuleMeta {
  key: LoginModule;
  badge: string;
  tabLabel: string;
  tabIcon: React.ElementType;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  gradient: string;
  glowShadow: string;
  demoEmail: string;
  demoRoleName: string;
  redirectPath: string;
  routePath: string;
  expectedRole: string;
  notice: string;
}

const MODULE_CONFIG: Record<LoginModule, ModuleMeta> = {
  USER: {
    key: 'USER',
    badge: 'PASSENGER PORTAL',
    tabLabel: 'Passenger',
    tabIcon: User,
    title: 'Passenger Sign In',
    subtitle: 'Search routes, select premium seats, and access digital boarding passes.',
    accentColor: '#818cf8',
    badgeBg: 'rgba(99, 102, 241, 0.12)',
    badgeBorder: 'rgba(99, 102, 241, 0.3)',
    gradient: 'var(--primary-gradient)',
    glowShadow: 'var(--shadow-glow)',
    demoEmail: 'passenger@gmail.com',
    demoRoleName: 'Passenger Account',
    redirectPath: '/',
    routePath: '/login',
    expectedRole: 'USER',
    notice: 'Book with ease. Instant seat lock and real-time departure tracking included.'
  },
  OPERATOR: {
    key: 'OPERATOR',
    badge: 'OPERATOR FLEET PORTAL',
    tabLabel: 'Fleet Operator',
    tabIcon: SlidersHorizontal,
    title: 'Operator Sign In',
    subtitle: 'Supervise assigned coaches, update routes, and oversee passenger manifests.',
    accentColor: 'var(--cyan)',
    badgeBg: 'rgba(6, 182, 212, 0.12)',
    badgeBorder: 'rgba(6, 182, 212, 0.3)',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #3b82f6 100%)',
    glowShadow: 'var(--shadow-cyan)',
    demoEmail: 'operator1@example.com',
    demoRoleName: 'Express Fleet Partner',
    redirectPath: '/operator',
    routePath: '/operator/login',
    expectedRole: 'OPERATOR',
    notice: 'Operator Fleet Terminal. Access granted strictly to authorized coach conductors and managers.'
  },
  ADMIN: {
    key: 'ADMIN',
    badge: 'MASTER SYSTEM ADMIN',
    tabLabel: 'System Admin',
    tabIcon: Shield,
    title: 'Administrator Sign In',
    subtitle: 'Master control console: system-wide user controls, route pricing, and revenue analytics.',
    accentColor: 'var(--amber)',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeBorder: 'rgba(245, 158, 11, 0.3)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #e11d48 100%)',
    glowShadow: '0 0 35px -5px rgba(245, 158, 11, 0.45)',
    demoEmail: 'admin@busticket.com',
    demoRoleName: 'Super Administrator',
    redirectPath: '/admin',
    routePath: '/admin/login',
    expectedRole: 'ADMIN',
    notice: 'High-security zone. All administrative queries and modifications are cryptographically audited.'
  }
};

const Login: React.FC<LoginProps> = ({ defaultModule = 'USER' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Determine initial module from URL or prop
  const getModuleFromPath = (): LoginModule => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/admin')) return 'ADMIN';
    if (path.includes('/operator')) return 'OPERATOR';
    return defaultModule;
  };

  const [activeModule, setActiveModule] = useState<LoginModule>(getModuleFromPath);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Keep activeModule in sync with URL location
  useEffect(() => {
    const targetMod = getModuleFromPath();
    setActiveModule(targetMod);
    setError('');
  }, [location.pathname]);

  const currentConfig = MODULE_CONFIG[activeModule];
  const IconComponent = currentConfig.tabIcon;

  const handleSwitchModule = (mod: LoginModule) => {
    setActiveModule(mod);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    navigate(MODULE_CONFIG[mod].routePath);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.user || {
        id: res.data.id || email,
        email: res.data.email,
        role: res.data.role,
        name: res.data.name || res.data.email
      };

      const userRole = (userData.role || '').toUpperCase();

      // Enforce role authorization per module
      if (activeModule === 'ADMIN') {
        const isMasterAdmin = userRole === 'ADMIN' && userData.email.toLowerCase() === 'admin@busticket.com';
        if (!isMasterAdmin) {
          setError('Access Denied: Only the designated System Administrator (admin@busticket.com) is permitted to access the Admin Console.');
          setLoading(false);
          return;
        }
      }

      if (activeModule === 'OPERATOR' && userRole !== 'OPERATOR' && userRole !== 'ADMIN') {
        setError('Access Denied: This terminal is strictly reserved for Fleet Operators. Please use the Passenger Portal.');
        setLoading(false);
        return;
      }

      // Valid session
      login(res.data.token, userData);
      setSuccessMsg(`Welcome back, ${userData.name || userData.email}!`);

      setTimeout(() => {
        const fromPath = (location.state as any)?.from?.pathname;
        if (fromPath && !fromPath.includes('/login')) {
          navigate(fromPath);
        } else {
          navigate(currentConfig.redirectPath);
        }
      }, 600);

    } catch (err: any) {
      console.error('Login error', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2.5rem auto', position: 'relative' }}>
      
      {/* Module Segmented Tab Switcher */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '6px',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-md)',
          gap: '6px'
        }}
      >
        {(['USER', 'OPERATOR', 'ADMIN'] as LoginModule[]).map((modKey) => {
          const cfg = MODULE_CONFIG[modKey];
          const TabIcon = cfg.tabIcon;
          const isSelected = activeModule === modKey;

          return (
            <button
              key={modKey}
              type="button"
              onClick={() => handleSwitchModule(modKey)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: isSelected ? `1px solid ${cfg.accentColor}` : '1px solid transparent',
                background: isSelected ? cfg.badgeBg : 'transparent',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? `0 4px 16px -2px ${cfg.badgeBorder}` : 'none'
              }}
            >
              <TabIcon size={16} style={{ color: isSelected ? cfg.accentColor : 'inherit' }} />
              <span>{cfg.tabLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Main Login Card */}
      <div 
        className="card" 
        style={{ 
          padding: '2.5rem', 
          border: `1px solid ${currentConfig.badgeBorder}`,
          boxShadow: currentConfig.glowShadow,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative glow orb */}
        <div 
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: currentConfig.gradient,
            opacity: 0.15,
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />

        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Glowing Icon Badge */}
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '20px', 
              background: currentConfig.gradient, 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              marginBottom: '1rem', 
              boxShadow: currentConfig.glowShadow 
            }}
          >
            <IconComponent size={32} />
          </div>

          {/* Module Identifier Tag */}
          <div style={{ marginBottom: '0.6rem' }}>
            <span 
              style={{ 
                fontSize: '0.72rem', 
                fontWeight: 800, 
                letterSpacing: '0.08em',
                color: currentConfig.accentColor, 
                background: currentConfig.badgeBg,
                border: `1px solid ${currentConfig.badgeBorder}`, 
                padding: '4px 12px', 
                borderRadius: '999px',
                textTransform: 'uppercase'
              }}
            >
              {currentConfig.badge}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>{currentConfig.title}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
            {currentConfig.subtitle}
          </p>
        </div>



        {/* Error Alert */}
        {error && (
          <div 
            className="card" 
            style={{ 
              borderColor: 'var(--rose)', 
              background: 'rgba(244, 63, 94, 0.12)', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.9rem' 
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--rose)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#fecdd3' }}>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div 
            className="card" 
            style={{ 
              borderColor: 'var(--emerald)', 
              background: 'rgba(16, 185, 129, 0.12)', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.9rem' 
            }}
          >
            <CheckCircle2 size={20} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
              {activeModule === 'ADMIN' ? 'Admin Username / Email' : activeModule === 'OPERATOR' ? 'Operator Corporate Email' : 'Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder={currentConfig.demoEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.6rem' }}
                required
              />
              <Mail 
                size={17} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-dim)' 
                }} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Password</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Default: password</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                required
              />
              <Lock 
                size={17} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-dim)' 
                }} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit Button with Custom Gradient */}
          <button
            type="submit"
            className="btn btn-lg"
            style={{ 
              width: '100%', 
              background: currentConfig.gradient,
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: currentConfig.glowShadow,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <LogIn size={18} /> Sign In to {currentConfig.tabLabel}
              </span>
            )}
          </button>
        </form>

        {/* Module Notice */}
        <div 
          style={{ 
            marginTop: '1.5rem', 
            padding: '0.75rem 1rem', 
            borderRadius: '10px', 
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '0.75rem',
            color: 'var(--text-dim)'
          }}
        >
          <ShieldCheck size={16} style={{ color: currentConfig.accentColor, flexShrink: 0, marginTop: '1px' }} />
          <span>{currentConfig.notice}</span>
        </div>

        {/* Footer Actions */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          {activeModule === 'USER' ? (
            <div>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: currentConfig.accentColor, fontWeight: 600 }}>
                Create Passenger Account
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.82rem' }}>
              <button 
                type="button" 
                onClick={() => handleSwitchModule('USER')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Back to Passenger Portal
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Quick Cross-Portal Switch Links at Bottom */}
      <div 
        style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}
      >
        <span>Switch Portal:</span>
        <button 
          type="button" 
          onClick={() => handleSwitchModule('USER')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: activeModule === 'USER' ? 'var(--primary-light)' : 'var(--text-muted)', 
            fontWeight: activeModule === 'USER' ? 700 : 400,
            cursor: 'pointer' 
          }}
        >
          Passenger
        </button>
        <span>•</span>
        <button 
          type="button" 
          onClick={() => handleSwitchModule('OPERATOR')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: activeModule === 'OPERATOR' ? 'var(--cyan)' : 'var(--text-muted)', 
            fontWeight: activeModule === 'OPERATOR' ? 700 : 400,
            cursor: 'pointer' 
          }}
        >
          Fleet Operator
        </button>
        <span>•</span>
        <button 
          type="button" 
          onClick={() => handleSwitchModule('ADMIN')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: activeModule === 'ADMIN' ? 'var(--amber)' : 'var(--text-muted)', 
            fontWeight: activeModule === 'ADMIN' ? 700 : 400,
            cursor: 'pointer' 
          }}
        >
          System Admin
        </button>
      </div>

    </div>
  );
};

export default Login;
