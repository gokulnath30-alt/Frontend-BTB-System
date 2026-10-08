import React from 'react';
import { Armchair, Lock, Check } from 'lucide-react';

interface SeatGridProps {
  seats: any[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
}

const SeatGrid: React.FC<SeatGridProps> = ({ seats, selectedSeats, onSeatSelect }) => {
  return (
    <div>
      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        marginBottom: '1.75rem',
        padding: '0.75rem 1rem',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-glass)',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.5)', background: 'rgba(16, 185, 129, 0.15)' }} />
          <span>Available</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--primary-gradient)', boxShadow: '0 0 8px var(--primary)' }} />
          <span>Selected</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)' }} />
          <span style={{ color: 'var(--text-dim)' }}>Booked / Occupied</span>
        </div>
      </div>

      {/* Bus Cabin Mockup */}
      <div className="bus-cabin">
        {/* Driver Cab Front */}
        <div className="steering-wheel-header">
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Front • Driver Cabin
          </span>
          <span style={{ fontSize: '1.2rem' }} title="Steering Wheel">
            🛞
          </span>
        </div>

        {/* 2+Aisle+2 Seat Layout */}
        <div className="seats-grid">
          {seats.map((seat, idx) => {
            const isBooked = seat.status === 'BOOKED' || seat.isBooked === true;
            const isSelected = selectedSeats.includes(String(seat.id)) || selectedSeats.includes(seat.seatNumber);

            return (
              <React.Fragment key={seat.id || idx}>
                {/* Insert aisle gap in column 3 every row */}
                {idx % 4 === 2 && (
                  <div className="aisle-spacer">
                    <div className="aisle-line" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => !isBooked && onSeatSelect(String(seat.id || seat.seatNumber))}
                  disabled={isBooked}
                  className={`seat-btn ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                  title={isBooked ? `Seat ${seat.seatNumber} (Booked)` : `Seat ${seat.seatNumber} (Available)`}
                >
                  {isBooked ? (
                    <Lock size={12} style={{ marginBottom: '2px', opacity: 0.6 }} />
                  ) : isSelected ? (
                    <Check size={14} style={{ marginBottom: '2px' }} />
                  ) : (
                    <Armchair size={13} style={{ marginBottom: '2px' }} />
                  )}
                  <span>{seat.seatNumber}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Rear of bus */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', color: 'var(--text-dim)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Rear Coach
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
