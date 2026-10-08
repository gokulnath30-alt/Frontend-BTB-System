import React from 'react';
import { Bus, ShieldCheck, Clock, Headphones, Award } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Trust Badges Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid var(--border-glass)',
          marginBottom: '2.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>100% Secure Checkout</h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Encrypted payment gateways</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
              <Clock size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>Instant E-Tickets</h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>QR code & SMS confirmation</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
              <Award size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>Verified Fleet Operators</h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Top-rated Volvo & Scania buses</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
              <Headphones size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>24/7 Concierge Support</h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Assistance anytime on your journey</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bus size={18} style={{ color: 'var(--primary-light)' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>SkyBus Express</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>— Luxury Intercity Transit Platform</span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            &copy; 2026 SkyBus Express. Connected to Spring Boot + MySQL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
