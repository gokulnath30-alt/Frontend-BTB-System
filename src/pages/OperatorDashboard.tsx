import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bus, MapPin, RefreshCw, CheckCircle } from 'lucide-react';


const OperatorDashboard: React.FC = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOperatorBuses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/operator/buses');
      setBuses(res.data);
    } catch (err) {
      console.error('Failed to fetch buses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatorBuses();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-cyan">Fleet Operations</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Assigned Operator Fleet</span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>Coach & Route Operations</h1>
        </div>

        <button onClick={fetchOperatorBuses} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Fleet
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading fleet status...</p>
        </div>
      ) : buses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            <Bus size={28} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Assigned Coaches Yet</h3>
          <p style={{ color: 'var(--text-dim)' }}>You do not currently have any buses assigned to your operator account.</p>
        </div>
      ) : (
        <div className="grid-cols-2">
          {buses.map((bus) => (
            <div key={bus.id} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <span className="badge badge-cyan" style={{ marginBottom: '0.4rem' }}>
                    {bus.busType || 'AC Sleeper'}
                  </span>
                  <h3 style={{ fontSize: '1.3rem' }}>{bus.name || bus.busNumber}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    Registration: <strong style={{ color: 'var(--text-muted)' }}>{bus.busNumber}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                  <CheckCircle size={13} /> Active Service
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Assigned Route</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} style={{ color: 'var(--cyan)' }} />
                    {bus.source} → {bus.destination}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Capacity</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                    {bus.capacity || 40} Seats
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                <span>GPS Live Tracker: <strong style={{ color: 'var(--emerald)' }}>Online</strong></span>
                <span>Safety Rating: <strong style={{ color: 'var(--amber)' }}>4.9/5.0</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;
