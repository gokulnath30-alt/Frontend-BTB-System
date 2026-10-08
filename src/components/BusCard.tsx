import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Wifi, Zap, Star, ShieldCheck, ChevronRight, Clock } from 'lucide-react';
import { formatShortDateWithDay, isDepartedTime } from '../utils/dateUtils';

interface BusCardProps {
  bus: any;
}

const BusCard: React.FC<BusCardProps> = ({ bus }) => {
  const navigate = useNavigate();

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const isSleeper = (bus.busType || bus.type || '').toLowerCase().includes('sleeper');
  const availableSeats = bus.availableSeats ?? bus.capacity ?? 30;
  const isDeparted = isDepartedTime(bus.departureTime) || bus.isDeparted === true;

  return (
    <div 
      className="bus-card"
      style={{
        opacity: isDeparted ? 0.75 : 1,
        border: isDeparted ? '1px solid rgba(239, 68, 68, 0.25)' : undefined
      }}
    >
      {/* Bus and Operator Meta */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge ${isSleeper ? 'badge-cyan' : 'badge-indigo'}`}>
            {bus.busType || bus.type || 'Luxury Coach'}
          </span>
          {isDeparted ? (
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              Departed (Past)
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
              <Star size={13} fill="#f59e0b" /> 4.8
            </div>
          )}
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bus size={18} style={{ color: 'var(--primary-light)' }} />
          {bus.name || bus.busNumber || 'Volvo 9600 Luxury Multi-Axle'}
        </h3>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
          Coach Reg: <strong style={{ color: 'var(--text-muted)' }}>{bus.busNumber || 'EXP-2026'}</strong>
        </div>

        {/* Amenities Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
          <span title="Free Wi-Fi" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Wifi size={13} /> Wi-Fi</span>
          <span title="USB Charging" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Zap size={13} /> Charging</span>
          <span title="Sanitized" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><ShieldCheck size={13} /> Sanitized</span>
        </div>
      </div>

      {/* Journey Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          {/* Departure */}
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
              {formatTime(bus.departureTime)}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {bus.source || 'Origin'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--amber)', fontWeight: 600, marginTop: '2px' }}>
              {formatShortDateWithDay(bus.departureTime)}
            </div>
          </div>

          {/* Travel Line */}
          <div style={{ flex: 1, margin: '0 1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Direct Express
            </span>
            <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--cyan), var(--primary))', position: 'relative', margin: '6px 0' }}>
              <div style={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: isDeparted ? '#ef4444' : 'var(--primary-light)', boxShadow: `0 0 8px ${isDeparted ? '#ef4444' : 'var(--primary)'}` }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: isDeparted ? '#f87171' : 'var(--emerald)', fontWeight: 600 }}>
              {isDeparted ? 'Departed' : 'On Time'}
            </span>
          </div>

          {/* Arrival */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
              {formatTime(bus.arrivalTime)}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {bus.destination || 'Destination'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {formatShortDateWithDay(bus.arrivalTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Fare & Booking CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Starting From
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', margin: '0.1rem 0 0.4rem' }}>
          ₹{bus.fare || 750}
        </div>

        <div style={{ marginBottom: '0.85rem' }}>
          <span className={`badge ${isDeparted ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '0.72rem' }}>
            {isDeparted ? 'Booking Closed' : `${availableSeats} Seats Left`}
          </span>
        </div>

        {isDeparted ? (
          <button
            type="button"
            disabled
            className="btn btn-outline"
            style={{
              width: '100%',
              opacity: 0.55,
              cursor: 'not-allowed',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.08)'
            }}
            title="This departure was in the past. Bookings are only available for current and future departures."
          >
            <Clock size={14} /> Departed (Closed)
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate(`/bus/${bus.id}`)}
          >
            Select Seats <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default BusCard;
