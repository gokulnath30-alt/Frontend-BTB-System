import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPin, ShieldCheck, Award, ChevronLeft, ArrowRight, Check, AlertCircle, Clock } from 'lucide-react';
import { formatDateTimeFull, isDepartedTime } from '../utils/dateUtils';

const BusDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBus = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/buses/${id}`);
        setBus(res.data);
      } catch (err: any) {
        console.error('Failed to fetch bus details', err);
        setError('Failed to fetch bus trip information.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBus();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading coach details...</p>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: '600px', margin: '2rem auto' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--rose)' }}>{error || 'Bus not found'}</h3>
        <button className="btn btn-outline" onClick={() => navigate('/search')}>
          <ChevronLeft size={16} /> Back to Search
        </button>
      </div>
    );
  }

  const isSleeper = (bus.busType || bus.type || '').toLowerCase().includes('sleeper');
  const isDeparted = isDepartedTime(bus.departureTime) || bus.isDeparted === true;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Back button */}
      <button onClick={() => navigate('/search')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} /> Back to Search Results
      </button>

      {/* Past Departure Warning Notice */}
      {isDeparted && (
        <div className="card" style={{ borderColor: 'var(--rose)', background: 'rgba(244, 63, 94, 0.12)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem 1.5rem' }}>
          <AlertCircle size={24} style={{ color: 'var(--rose)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ffffff', fontSize: '1rem' }}>Departure Elapsed — Booking Closed</strong>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#fca5a5', marginTop: '2px' }}>
              This coach was scheduled for {formatDateTimeFull(bus.departureTime)}. Reservations are strictly forbidden for past dates and elapsed trips. Please return to search to pick an upcoming departure.
            </p>
          </div>
        </div>
      )}

      {/* Main Bus Header Banner */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge ${isSleeper ? 'badge-cyan' : 'badge-indigo'}`}>
                {bus.busType || bus.type || 'Luxury Coach'}
              </span>
              {isDeparted ? (
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                  Departed (Past)
                </span>
              ) : (
                <span className="badge badge-emerald">Verified Fleet</span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>
              {bus.name || bus.busNumber}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
              Registration Number: <strong style={{ color: 'var(--text-muted)' }}>{bus.busNumber}</strong> • Total Capacity: {bus.capacity || 40} Passengers
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Ticket Fare</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              ₹{bus.fare || 750}
            </div>
            <span style={{ fontSize: '0.75rem', color: isDeparted ? 'var(--rose)' : 'var(--emerald)' }}>
              {isDeparted ? 'Booking Unavailable' : 'Tax Included • Instant Seat Lock'}
            </span>
          </div>
        </div>

        {/* Route Details Card */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> DEPARTURE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>
              {bus.source || 'Origin City'}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--amber)', fontWeight: 600, marginTop: '3px' }}>
              {bus.departureTime ? formatDateTimeFull(bus.departureTime) : '06:00 AM'}
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
            <ArrowRight size={22} style={{ color: 'var(--primary-light)' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>DIRECT ROUTE</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> ARRIVAL
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>
              {bus.destination || 'Destination City'}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginTop: '3px' }}>
              {bus.arrivalTime ? formatDateTimeFull(bus.arrivalTime) : '11:30 AM'}
            </div>
          </div>
        </div>
      </div>

      {/* Amenities & Fleet Policy Grid */}
      <div className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
        {/* Onboard Amenities */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} style={{ color: 'var(--primary-light)' }} /> Included Amenities
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></div>
              Ultra High-Speed Satellite Wi-Fi
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></div>
              Individual 220V Laptop & USB Charging Ports
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></div>
              Sanitized Pillow, Blanket & Linen Kit
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></div>
              Complimentary Premium Mineral Water Bottle
            </li>
          </ul>
        </div>

        {/* Travel Guidelines */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--cyan)' }} /> Boarding & Baggage Policy
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></div>
              Please arrive 15 minutes before departure.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></div>
              Luggage allowance: Up to 2 pieces (max 25 kg total).
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></div>
              Government ID verification required at boarding.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></div>
              Instant digital m-ticket with QR code on booking.
            </li>
          </ul>
        </div>
      </div>

      {/* Select Seats CTA Bottom Bar */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>
            {isDeparted ? 'This departure is closed' : 'Ready to choose your seat?'}
          </h4>
          <p style={{ fontSize: '0.88rem' }}>
            {isDeparted ? 'Past schedules cannot be booked. Please choose an active upcoming schedule.' : 'Interactive coach seat map with window, aisle, and sleeper berths.'}
          </p>
        </div>
        {isDeparted ? (
          <button
            type="button"
            disabled
            className="btn btn-outline btn-lg"
            style={{ opacity: 0.55, cursor: 'not-allowed', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
          >
            <Clock size={16} /> Booking Closed (Past Departure)
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate(`/seats/${bus.id}`)}
          >
            Select Seats Now <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default BusDetails;
