import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle, 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Armchair, 
  Calendar, 
  ShieldCheck, 
  Lock,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { formatDateTimeFull } from '../utils/dateUtils';

interface BookingDraft {
  busId: number;
  scheduleId: number;
  bus: any;
  selectedSeats: string[];
  seatNumbers: string[];
  farePerSeat: number;
  subtotal: number;
  gstTax: number;
  grandTotal: number;
}

const DEFAULT_BOARDING_POINTS = [
  'Central Bus Terminal (Platform 4)',
  'City Center Metro Interchange',
  'Airport Bypass Junction Gate 2',
  'National Highway Toll Tollplaza Tollgate',
  'Railway Station Front Entrance'
];

const DEFAULT_ENDING_POINTS = [
  'Destination Central Bus Terminal (Platform 1)',
  'City Center Shopping Hub & Metro Station',
  'Airport Arrival Drop-Off Terminal',
  'Express Bypass Ring Road Junction',
  'Railway Central Junction Drop Point'
];

const PassengerDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Retrieve booking draft from Router state or localStorage
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  // Traveler Details & Stop Locations
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [boardingPoint, setBoardingPoint] = useState(DEFAULT_BOARDING_POINTS[0]);
  const [customBoarding, setCustomBoarding] = useState('');
  const [isCustomBoarding, setIsCustomBoarding] = useState(false);
  const [endingPoint, setEndingPoint] = useState(DEFAULT_ENDING_POINTS[0]);
  const [customEnding, setCustomEnding] = useState('');
  const [isCustomEnding, setIsCustomEnding] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    // 1. Load draft
    let currentDraft: BookingDraft | null = (location.state as BookingDraft) || null;
    if (!currentDraft) {
      try {
        const stored = localStorage.getItem('bookingDraft');
        if (stored) {
          currentDraft = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }

    if (!currentDraft || !currentDraft.selectedSeats || currentDraft.selectedSeats.length === 0) {
      navigate('/search');
      return;
    }

    setDraft(currentDraft);

    // 2. Pre-fill user details if logged in
    if (user) {
      setPassengerName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '');
      setPassengerEmail(user.email || '');
      setPassengerPhone(user.phone || user.phoneNumber || '');
    }
  }, [location.state, user, navigate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!passengerName.trim()) {
      errs.passengerName = 'Full Name is required.';
    } else if (passengerName.trim().length < 2) {
      errs.passengerName = 'Please enter a valid full name.';
    }

    if (!passengerPhone.trim()) {
      errs.passengerPhone = 'Contact Phone Number is required.';
    } else if (!/^[0-9+() -]{7,18}$/.test(passengerPhone.trim())) {
      errs.passengerPhone = 'Please enter a valid phone number (min 7 digits).';
    }

    if (!passengerEmail.trim()) {
      errs.passengerEmail = 'Email Address is required for e-ticket delivery.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerEmail.trim())) {
      errs.passengerEmail = 'Please enter a valid email address.';
    }

    const finalBoarding = isCustomBoarding ? customBoarding.trim() : boardingPoint.trim();
    if (!finalBoarding) {
      errs.boardingPoint = 'Please select or specify a boarding point.';
    }

    const finalEnding = isCustomEnding ? customEnding.trim() : endingPoint.trim();
    if (!finalEnding) {
      errs.endingPoint = 'Please select or specify a preferred ending point.';
    }

    if (!emergencyContact.trim()) {
      errs.emergencyContact = 'Emergency Contact (Name & Phone) is required for travel safety.';
    } else if (emergencyContact.trim().length < 5) {
      errs.emergencyContact = 'Please provide contact name and phone (e.g. Sarah - 9876543210).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !draft) return;

    setSubmitting(true);
    setServerError('');

    const finalBoarding = isCustomBoarding ? customBoarding.trim() : boardingPoint.trim();
    const finalEnding = isCustomEnding ? customEnding.trim() : endingPoint.trim();

    try {
      const payload = {
        busId: draft.busId,
        scheduleId: draft.scheduleId,
        seatIds: draft.selectedSeats,
        seatNumbers: draft.seatNumbers,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        passengerEmail: passengerEmail.trim(),
        boardingPoint: finalBoarding,
        endingPoint: finalEnding,
        droppingPoint: finalEnding,
        emergencyContact: emergencyContact.trim(),
        paymentMethod: 'CREDIT_CARD'
      };

      const res = await api.post('/bookings', payload);

      // Save complete booking draft details with passenger info for display in payment/history
      const fullBookingDetails = {
        ...draft,
        bookingId: res.data.id,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        passengerEmail: passengerEmail.trim(),
        boardingPoint: finalBoarding,
        endingPoint: finalEnding,
        droppingPoint: finalEnding,
        emergencyContact: emergencyContact.trim()
      };
      localStorage.setItem(`booking_${res.data.id}_details`, JSON.stringify(fullBookingDetails));
      localStorage.removeItem('bookingDraft');

      navigate(`/payment/${res.data.id}`, { state: fullBookingDetails });
    } catch (err: any) {
      console.error('Booking submission error', err);
      setServerError(
        err.response?.data?.message || 'Failed to initialize booking. Please verify the details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!draft) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading booking details...</p>
      </div>
    );
  }

  const { bus, selectedSeats, seatNumbers, farePerSeat, subtotal, gstTax, grandTotal } = draft;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Top Back Navigation */}
      <button 
        type="button" 
        onClick={() => navigate(`/seats/${draft.busId}`)} 
        className="btn btn-ghost btn-sm" 
        style={{ marginBottom: '1.25rem' }}
      >
        <ChevronLeft size={16} /> Back to Seat Selection
      </button>

      {/* Luxury Progress Stepper */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2.5rem',
          padding: '1rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontSize: '0.9rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} /> Step 1: Seat Selection
        </div>
        <span style={{ color: 'var(--text-dim)' }}>→</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontSize: '0.9rem', fontWeight: 700 }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
            2
          </div>
          Step 2: Passenger Details
        </div>
        <span style={{ color: 'var(--text-dim)' }}>→</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          <Lock size={15} /> Step 3: Payment & Ticket
        </div>
      </div>

      {serverError && (
        <div className="card" style={{ borderColor: 'var(--rose)', background: 'rgba(244, 63, 94, 0.12)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={20} style={{ color: 'var(--rose)' }} />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: The 5 Basic Questions Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '20px', marginBottom: '0.5rem' }}>
              <Sparkles size={12} /> PASSENGER VERIFICATION
            </div>
            <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.35rem 0' }}>Primary Traveler Information</h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Please provide the 6 required travel details to generate your digital boarding pass and ensure on-journey communication.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 1. Full Name */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                <User size={15} style={{ color: 'var(--primary-light)' }} /> 1. Full Legal Name <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Johnson"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className={`input-field ${errors.passengerName ? 'border-rose-500' : ''}`}
                style={{ width: '100%', marginTop: '4px' }}
              />
              {errors.passengerName && (
                <span style={{ fontSize: '0.78rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                  {errors.passengerName}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
                As it appears on your government-issued ID card.
              </span>
            </div>

            {/* 2. Phone Number */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                <Phone size={15} style={{ color: 'var(--cyan)' }} /> 2. Mobile Phone Number <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                className={`input-field ${errors.passengerPhone ? 'border-rose-500' : ''}`}
                style={{ width: '100%', marginTop: '4px' }}
              />
              {errors.passengerPhone && (
                <span style={{ fontSize: '0.78rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                  {errors.passengerPhone}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
                Used for live SMS updates, bus track links, and driver coordination.
              </span>
            </div>

            {/* 3. Email Address */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                <Mail size={15} style={{ color: 'var(--amber)' }} /> 3. Email Address <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. alex.johnson@example.com"
                value={passengerEmail}
                onChange={(e) => setPassengerEmail(e.target.value)}
                className={`input-field ${errors.passengerEmail ? 'border-rose-500' : ''}`}
                style={{ width: '100%', marginTop: '4px' }}
              />
              {errors.passengerEmail && (
                <span style={{ fontSize: '0.78rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                  {errors.passengerEmail}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
                Your digital tax invoice and PDF E-Ticket pass will be delivered here.
              </span>
            </div>

            {/* 4. Boarding Point */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                <MapPin size={15} style={{ color: 'var(--emerald)' }} /> 4. Preferred Boarding Point <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              
              {!isCustomBoarding ? (
                <select
                  value={boardingPoint}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomBoarding(true);
                    } else {
                      setBoardingPoint(e.target.value);
                    }
                  }}
                  className="input-field"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {DEFAULT_BOARDING_POINTS.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                  <option value="CUSTOM">➕ Other / Enter Custom Pickup Point...</option>
                </select>
              ) : (
                <div style={{ marginTop: '4px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter specific station or landmark..."
                    value={customBoarding}
                    onChange={(e) => setCustomBoarding(e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomBoarding(false)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Use List
                  </button>
                </div>
              )}

              {errors.boardingPoint && (
                <span style={{ fontSize: '0.78rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                  {errors.boardingPoint}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
                Please arrive at least 15 minutes before departure time.
              </span>
            </div>

            {/* 5. Preferred Ending Point */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                <MapPin size={15} style={{ color: 'var(--amber)' }} /> 5. Preferred Ending Point (Dropping Point) <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              
              {!isCustomEnding ? (
                <select
                  value={endingPoint}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomEnding(true);
                    } else {
                      setEndingPoint(e.target.value);
                    }
                  }}
                  className="input-field"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {DEFAULT_ENDING_POINTS.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                  <option value="CUSTOM">➕ Other / Enter Custom Dropping Point...</option>
                </select>
              ) : (
                <div style={{ marginTop: '4px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter specific station or landmark..."
                    value={customEnding}
                    onChange={(e) => setCustomEnding(e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomEnding(false)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Use List
                  </button>
                </div>
              )}

              {errors.endingPoint && (
                <span style={{ fontSize: '0.78rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                  {errors.endingPoint}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
                Select your preferred destination drop-off terminal or city junction.
              </span>
            </div>

            {/* 6. Emergency Contact */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                <HeartHandshake size={15} style={{ color: 'var(--rose)' }} /> 6. Emergency Contact (Name & Phone) <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Johnson (Spouse) - +91 91234 56789"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className={`input-field ${errors.emergencyContact ? 'border-rose-500' : ''}`}
                style={{ width: '100%', marginTop: '4px' }}
              />
              {errors.emergencyContact && (
                <span style={{ fontSize: '0.78rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                  {errors.emergencyContact}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
                Required safety compliance for long-distance intercity coach travel.
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate(`/seats/${draft.busId}`)}
                className="btn btn-outline"
                style={{ flex: 1, minWidth: '150px' }}
              >
                Change Seats
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ flex: 2, minWidth: '220px', padding: '0.85rem 1.5rem', fontSize: '1rem' }}
              >
                {submitting ? 'Confirming...' : (
                  <>
                    Proceed to Payment <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Trip & Price Summary */}
        <div className="card" style={{ position: 'sticky', top: '100px', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            Trip & Seat Summary
          </h3>

          {/* Route info */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              {bus?.source} → {bus?.destination}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} style={{ color: 'var(--amber)' }} />
              {formatDateTimeFull(bus?.departureTime)}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--cyan)', marginTop: '4px', fontWeight: 600 }}>
              {bus?.name || bus?.busNumber} ({bus?.type || bus?.busType || 'Luxury Coach'})
            </div>
          </div>

          {/* Seats reserved */}
          <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Selected Seats ({selectedSeats.length}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {seatNumbers.map((sNum, idx) => (
                <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                  <Armchair size={13} /> {sNum}
                </span>
              ))}
            </div>
          </div>

          {/* Fare breakdown */}
          <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Base Ticket ({selectedSeats.length} × ₹{farePerSeat})</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>GST & Safe Travel Insurance (5%)</span>
              <span>₹{gstTax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', borderTop: '1px solid var(--border-glass)', paddingTop: '0.8rem', marginTop: '0.3rem' }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--primary-light)' }}>₹{grandTotal}</span>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: '1.5rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald)' }}>
              <ShieldCheck size={14} /> 70% Instant Refund Policy On Cancellation (30% Cancellation Fee)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> End-to-end Encrypted Traveler Protection
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PassengerDetails;
