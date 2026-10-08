import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SeatGrid from '../components/SeatGrid';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Armchair, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  Lock,
  Sparkles
} from 'lucide-react';
import { formatDateTimeFull, isDepartedTime } from '../utils/dateUtils';

const BOARDING_OPTIONS = [
  'Central Bus Terminal (Platform 4)',
  'City Center Metro Interchange',
  'Airport Bypass Junction Gate 2',
  'National Highway Toll Plaza',
  'Railway Station Main Entrance'
];

const ENDING_OPTIONS = [
  'Destination Central Bus Terminal (Platform 1)',
  'City Center Shopping Hub & Metro Station',
  'Airport Arrival Drop-Off Terminal',
  'Express Bypass Ring Road Junction',
  'Railway Central Junction Drop Point'
];

const SeatSelection: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [seats, setSeats] = useState<any[]>([]);
  const [bus, setBus] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Traveler Details & Stop Locations
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [boardingPoint, setBoardingPoint] = useState(BOARDING_OPTIONS[0]);
  const [endingPoint, setEndingPoint] = useState(ENDING_OPTIONS[0]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [seatsRes, busRes] = await Promise.all([
          api.get(`/buses/${busId}/seats`),
          api.get(`/buses/${busId}`)
        ]);
        setSeats(seatsRes.data);
        setBus(busRes.data);
      } catch (err: any) {
        console.error('Failed to fetch seats or bus', err);
        setError('Failed to load coach seat layout. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (busId) fetchData();
  }, [busId]);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (!passengerName) {
        setPassengerName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '');
      }
      if (!passengerEmail && user.email) {
        setPassengerEmail(user.email);
      }
      if (!passengerPhone && (user.phone || user.phoneNumber)) {
        setPassengerPhone(user.phone || user.phoneNumber || '');
      }
    }
  }, [user]);

  const isDeparted = isDepartedTime(bus?.departureTime) || bus?.isDeparted === true;

  const handleSeatSelect = (seatId: string) => {
    if (isDeparted) {
      alert('This coach has already departed. You cannot reserve seats for past departures.');
      return;
    }
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
    );
  };

  const farePerSeat = bus?.fare || 750;
  const subtotal = selectedSeats.length * farePerSeat;
  const gstTax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gstTax;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!passengerName.trim()) {
      errs.passengerName = 'Full Name is required.';
    } else if (passengerName.trim().length < 2) {
      errs.passengerName = 'Please enter a valid legal name.';
    }

    if (!passengerPhone.trim()) {
      errs.passengerPhone = 'Mobile phone number is required.';
    } else if (!/^[0-9+() -]{7,18}$/.test(passengerPhone.trim())) {
      errs.passengerPhone = 'Please enter a valid phone number (min 7 digits).';
    }

    if (!passengerEmail.trim()) {
      errs.passengerEmail = 'Email is required for digital e-ticket.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerEmail.trim())) {
      errs.passengerEmail = 'Please enter a valid email address.';
    }

    if (!boardingPoint.trim()) {
      errs.boardingPoint = 'Please select a boarding point.';
    }

    if (!endingPoint.trim()) {
      errs.endingPoint = 'Please select a preferred ending point.';
    }

    if (!emergencyContact.trim()) {
      errs.emergencyContact = 'Emergency contact is required for travel safety.';
    } else if (emergencyContact.trim().length < 4) {
      errs.emergencyContact = 'Please provide contact name & number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToBooking = async () => {
    if (isDeparted) {
      alert('This bus has already departed. Bookings are strictly restricted to future departures.');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to continue.');
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setError('');

    // Find seat numbers for selected IDs
    const seatNumbers = selectedSeats.map(id => {
      const found = seats.find(s => String(s.id) === id || s.seatNumber === id);
      return found ? found.seatNumber : id;
    });

    try {
      const payload = {
        busId: Number(busId),
        scheduleId: bus?.scheduleId ? Number(bus?.scheduleId) : Number(busId),
        seatIds: selectedSeats,
        seatNumbers: seatNumbers,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        passengerEmail: passengerEmail.trim(),
        boardingPoint: boardingPoint.trim(),
        endingPoint: endingPoint.trim(),
        droppingPoint: endingPoint.trim(),
        emergencyContact: emergencyContact.trim(),
        paymentMethod: 'CREDIT_CARD'
      };

      const res = await api.post('/bookings', payload);

      const bookingDetails = {
        busId: Number(busId),
        scheduleId: bus?.scheduleId ? Number(bus?.scheduleId) : Number(busId),
        bus: bus,
        bookingId: res.data.id,
        selectedSeats,
        seatNumbers,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        passengerEmail: passengerEmail.trim(),
        boardingPoint: boardingPoint.trim(),
        endingPoint: endingPoint.trim(),
        emergencyContact: emergencyContact.trim(),
        farePerSeat,
        subtotal,
        gstTax,
        grandTotal
      };

      localStorage.setItem(`booking_${res.data.id}_details`, JSON.stringify(bookingDetails));
      navigate(`/payment/${res.data.id}`, { state: bookingDetails });
    } catch (err: any) {
      console.error('Booking failed', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading interactive coach seating...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ChevronLeft size={16} /> Back
      </button>

      {/* Progress Stepper */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '0.85rem 1.25rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontSize: '0.9rem', fontWeight: 700 }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
            1
          </div>
          Step 1: Seat Selection
        </div>
        <span style={{ color: 'var(--text-dim)' }}>→</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedSeats.length > 0 ? 'var(--cyan)' : 'var(--text-dim)', fontSize: '0.9rem', fontWeight: selectedSeats.length > 0 ? 600 : 400 }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: selectedSeats.length > 0 ? 'var(--cyan)' : '#334155', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
            2
          </div>
          Step 2: Passenger & Stop Details
        </div>
        <span style={{ color: 'var(--text-dim)' }}>→</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          <Lock size={15} /> Step 3: Payment & Ticket
        </div>
      </div>

      {/* Elapsed past departure warning */}
      {isDeparted && (
        <div className="card" style={{ borderColor: 'var(--rose)', background: 'rgba(244, 63, 94, 0.12)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem 1.5rem' }}>
          <AlertCircle size={24} style={{ color: 'var(--rose)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ffffff', fontSize: '1rem' }}>Past Departure Notice</strong>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#fca5a5', marginTop: '2px' }}>
              This journey departed on {formatDateTimeFull(bus?.departureTime)}. Seat reservation is disabled because ticket booking is exclusively available for current and future departures.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Select Your Seats & Passenger Details</h2>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <strong>{bus?.name || bus?.busNumber}</strong>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{bus?.source} → {bus?.destination}</span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: 'var(--amber)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> {formatDateTimeFull(bus?.departureTime)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--emerald)' }}>
          <ShieldCheck size={16} /> Real-Time Live Seat Availability
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--rose)', background: 'rgba(244, 63, 94, 0.1)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} style={{ color: 'var(--rose)' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 1fr)', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Interactive Seat Grid */}
        <div className="card" style={{ padding: '2rem', opacity: isDeparted ? 0.6 : 1 }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Armchair size={18} style={{ color: 'var(--primary-light)' }} /> Choose Seats
          </h3>
          <SeatGrid seats={seats} selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect} />
        </div>

        {/* Right Column: Fare & The 5 Basic Passenger Details Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            Booking & Traveler Details
          </h3>

          {/* Selected Seats chips */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Selected Seats ({selectedSeats.length}):
            </div>
            {selectedSeats.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedSeats.map(id => {
                  const s = seats.find(item => String(item.id) === id || item.seatNumber === id);
                  return (
                    <span key={id} className="badge badge-indigo" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                      <Armchair size={13} /> {s ? s.seatNumber : id}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--cyan)', fontStyle: 'italic', background: 'rgba(6, 182, 212, 0.1)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                👉 Please click on any available seat on the left layout to proceed.
              </p>
            )}
          </div>

          {/* 5 BASIC QUESTIONS ABOUT USER - Displayed right after selecting seats */}
          <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.2rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
              <Sparkles size={14} style={{ color: 'var(--cyan)' }} />
              <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>Traveler Information (6 Required Details)</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              Required to register passenger boarding pass & emergency travel logs:
            </p>

            {/* 1. Full Legal Name */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={13} style={{ color: 'var(--primary-light)' }} /> 1. Full Legal Name <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Johnson"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className={`input-field ${errors.passengerName ? 'border-rose-500' : ''}`}
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.5rem 0.75rem', marginTop: '3px' }}
              />
              {errors.passengerName && (
                <span style={{ fontSize: '0.74rem', color: 'var(--rose)', marginTop: '2px', display: 'block' }}>
                  {errors.passengerName}
                </span>
              )}
            </div>

            {/* 2. Mobile Phone Number */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={13} style={{ color: 'var(--cyan)' }} /> 2. Mobile Phone Number <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                className={`input-field ${errors.passengerPhone ? 'border-rose-500' : ''}`}
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.5rem 0.75rem', marginTop: '3px' }}
              />
              {errors.passengerPhone && (
                <span style={{ fontSize: '0.74rem', color: 'var(--rose)', marginTop: '2px', display: 'block' }}>
                  {errors.passengerPhone}
                </span>
              )}
            </div>

            {/* 3. Email Address */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Mail size={13} style={{ color: 'var(--amber)' }} /> 3. Email Address <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. alex.johnson@example.com"
                value={passengerEmail}
                onChange={(e) => setPassengerEmail(e.target.value)}
                className={`input-field ${errors.passengerEmail ? 'border-rose-500' : ''}`}
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.5rem 0.75rem', marginTop: '3px' }}
              />
              {errors.passengerEmail && (
                <span style={{ fontSize: '0.74rem', color: 'var(--rose)', marginTop: '2px', display: 'block' }}>
                  {errors.passengerEmail}
                </span>
              )}
            </div>

            {/* 4. Boarding Point */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={13} style={{ color: 'var(--emerald)' }} /> 4. Preferred Boarding Point <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <select
                value={boardingPoint}
                onChange={(e) => setBoardingPoint(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.5rem 0.75rem', marginTop: '3px' }}
              >
                {BOARDING_OPTIONS.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>

            {/* 5. Preferred Ending Point */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={13} style={{ color: 'var(--amber)' }} /> 5. Preferred Ending Point (Dropping Point) <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <select
                value={endingPoint}
                onChange={(e) => setEndingPoint(e.target.value)}
                className={`input-field ${errors.endingPoint ? 'border-rose-500' : ''}`}
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.5rem 0.75rem', marginTop: '3px' }}
              >
                {ENDING_OPTIONS.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
              {errors.endingPoint && (
                <span style={{ fontSize: '0.74rem', color: 'var(--rose)', marginTop: '2px', display: 'block' }}>
                  {errors.endingPoint}
                </span>
              )}
            </div>

            {/* 6. Emergency Contact */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <HeartHandshake size={13} style={{ color: 'var(--rose)' }} /> 6. Emergency Contact (Name & Phone) <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Johnson - +91 91234 56789"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className={`input-field ${errors.emergencyContact ? 'border-rose-500' : ''}`}
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.5rem 0.75rem', marginTop: '3px' }}
              />
              {errors.emergencyContact && (
                <span style={{ fontSize: '0.74rem', color: 'var(--rose)', marginTop: '2px', display: 'block' }}>
                  {errors.emergencyContact}
                </span>
              )}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Base Fare ({selectedSeats.length} × ₹{farePerSeat})</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Taxes & GST (5%)</span>
              <span>₹{gstTax}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', borderTop: '1px solid var(--border-glass)', paddingTop: '0.8rem', marginTop: '0.3rem' }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--primary-light)' }}>₹{grandTotal}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <div style={{ marginTop: '1.5rem' }}>
            {isDeparted ? (
              <button
                type="button"
                disabled
                className="btn btn-outline btn-lg"
                style={{ width: '100%', opacity: 0.55, cursor: 'not-allowed', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <Clock size={16} /> Booking Closed (Past Departure)
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleProceedToBooking}
                disabled={selectedSeats.length === 0 || submitting}
              >
                {submitting ? 'Confirming Booking...' : (
                  <>
                    Proceed to Payment <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>
              🔒 256-bit encrypted secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
