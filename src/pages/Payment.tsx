import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  CheckCircle2, 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  CreditCard, 
  XCircle, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  HeartHandshake,
  QrCode,
  Smartphone,
  Check
} from 'lucide-react';
import { formatFullDateWithDay, formatDateTimeFull, isDepartedTime } from '../utils/dateUtils';

type PaymentMethodType = 'UPI' | 'DEBIT_CARD' | 'CREDIT_CARD';
type UpiSubOption = 'APPS' | 'QR';

const EXPIRY_MONTHS = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
];

const CURRENT_YEAR = new Date().getFullYear();
// Generate 15 years strictly starting from CURRENT_YEAR onwards (no past years)
const EXPIRY_YEARS = Array.from({ length: 15 }, (_, i) => {
  const fullYear = CURRENT_YEAR + i;
  return {
    value: String(fullYear).slice(-2),
    label: String(fullYear)
  };
});

const Payment: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cancelled, setCancelled] = useState(false);

  // Selected payment method tabs
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('UPI');
  const [upiSubOption, setUpiSubOption] = useState<UpiSubOption>('APPS');

  // UPI State
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'BHIM' | 'OTHER'>('GPAY');
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Debit Card State
  const [debitCardNumber, setDebitCardNumber] = useState('');
  const [debitCardHolder, setDebitCardHolder] = useState('');
  const [debitExpMonth, setDebitExpMonth] = useState('');
  const [debitExpYear, setDebitExpYear] = useState('');
  const [debitCvv, setDebitCvv] = useState('');
  const [debitBank, setDebitBank] = useState('HDFC Bank');

  // Credit Card State
  const [creditCardNumber, setCreditCardNumber] = useState('');
  const [creditCardHolder, setCreditCardHolder] = useState('');
  const [creditExpMonth, setCreditExpMonth] = useState('');
  const [creditExpYear, setCreditExpYear] = useState('');
  const [creditCvv, setCreditCvv] = useState('');
  const [saveCreditCard, setSaveCreditCard] = useState(true);

  // Derived formatted expiry for live card preview and receipt
  const debitExpiry = debitExpMonth && debitExpYear ? `${debitExpMonth}/${debitExpYear}` : debitExpMonth ? `${debitExpMonth}/YY` : '';
  const creditExpiry = creditExpMonth && creditExpYear ? `${creditExpMonth}/${creditExpYear}` : creditExpMonth ? `${creditExpMonth}/YY` : '';

  // Transaction info for receipt
  const [completedMethodLabel, setCompletedMethodLabel] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err: any) {
        console.error('Failed to fetch booking', err);
        setError('Failed to retrieve booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const departureTime = booking?.schedule?.departureTime;
  const isDeparted = departureTime ? isDepartedTime(departureTime) : false;

  const localDetails = (() => {
    try {
      const stored = localStorage.getItem(`booking_${bookingId}_details`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();
  const stateDetails = (location.state as any) || null;

  const passengerName = booking?.passengerName || stateDetails?.passengerName || localDetails?.passengerName || booking?.user?.name || 'Passenger';
  const passengerPhone = booking?.passengerPhone || stateDetails?.passengerPhone || localDetails?.passengerPhone || booking?.user?.phone || '';
  const passengerEmail = booking?.passengerEmail || stateDetails?.passengerEmail || localDetails?.passengerEmail || booking?.user?.email || '';
  const boardingPoint = booking?.boardingPoint || stateDetails?.boardingPoint || localDetails?.boardingPoint || 'Central Bus Terminal';
  const endingPoint = booking?.endingPoint || booking?.droppingPoint || stateDetails?.endingPoint || stateDetails?.droppingPoint || localDetails?.endingPoint || localDetails?.droppingPoint || 'Destination Central Bus Terminal';
  const emergencyContact = booking?.emergencyContact || stateDetails?.emergencyContact || localDetails?.emergencyContact || '';

  // Prepopulate Cardholder name
  useEffect(() => {
    if (passengerName && !debitCardHolder) {
      setDebitCardHolder(passengerName);
    }
    if (passengerName && !creditCardHolder) {
      setCreditCardHolder(passengerName);
    }
  }, [passengerName]);

  // Card Formatters
  const formatCardNumber = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const detectCardType = (cardNumber: string) => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'VISA';
    if (/^5[1-5]|^2[2-7]/.test(clean)) return 'MASTERCARD';
    if (/^60|^65/.test(clean)) return 'RUPAY';
    if (/^3[47]/.test(clean)) return 'AMEX';
    return 'CARD';
  };

  const validatePayment = (): boolean => {
    const errs: Record<string, string> = {};

    if (selectedMethod === 'UPI') {
      if (upiSubOption === 'APPS') {
        if (selectedUpiApp === 'OTHER') {
          if (!upiId.trim()) {
            errs.upiId = 'Please enter a UPI ID (e.g. mobile@paytm or name@okaxis)';
          } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
            errs.upiId = 'Invalid UPI ID format (e.g. user@okhdfcbank or 9876543210@paytm)';
          }
        }
      }
    } else if (selectedMethod === 'DEBIT_CARD') {
      const cleanNum = debitCardNumber.replace(/\s+/g, '');
      if (!cleanNum || cleanNum.length < 16) {
        errs.debitCardNumber = 'Please enter a valid 16-digit debit card number';
      }
      if (!debitCardHolder.trim() || debitCardHolder.trim().length < 2) {
        errs.debitCardHolder = 'Please enter the cardholder full name';
      }
      const now = new Date();
      const currentYearShort = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (!debitExpMonth) {
        errs.debitExpiry = 'Please select expiry month (01-12)';
      } else if (!debitExpYear) {
        errs.debitExpiry = 'Please select expiry year';
      } else {
        const m = Number(debitExpMonth);
        const y = Number(debitExpYear.length === 4 ? debitExpYear.slice(-2) : debitExpYear);
        if (y < currentYearShort || (y === currentYearShort && m < currentMonth)) {
          errs.debitExpiry = 'Card has expired. Please select a valid future date.';
        }
      }
      if (!debitCvv || debitCvv.length < 3) {
        errs.debitCvv = 'Enter 3-digit CVV';
      }
    } else if (selectedMethod === 'CREDIT_CARD') {
      const cleanNum = creditCardNumber.replace(/\s+/g, '');
      if (!cleanNum || cleanNum.length < 15) {
        errs.creditCardNumber = 'Please enter a valid 16-digit credit card number';
      }
      if (!creditCardHolder.trim() || creditCardHolder.trim().length < 2) {
        errs.creditCardHolder = 'Please enter name as printed on credit card';
      }
      const now = new Date();
      const currentYearShort = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (!creditExpMonth) {
        errs.creditExpiry = 'Please select expiry month (01-12)';
      } else if (!creditExpYear) {
        errs.creditExpiry = 'Please select expiry year';
      } else {
        const m = Number(creditExpMonth);
        const y = Number(creditExpYear.length === 4 ? creditExpYear.slice(-2) : creditExpYear);
        if (y < currentYearShort || (y === currentYearShort && m < currentMonth)) {
          errs.creditExpiry = 'Card has expired. Please select a valid future date.';
        }
      }
      if (!creditCvv || creditCvv.length < 3) {
        errs.creditCvv = 'Enter 3 or 4-digit CVV';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePayNow = async () => {
    if (isDeparted) {
      setError('This bus departure has already elapsed. Tickets can only be booked and paid for future departures.');
      return;
    }

    if (!validatePayment()) {
      return;
    }

    setProcessing(true);
    setError('');

    // Construct descriptive label
    let methodPayload = 'UPI';
    let displayMethod = 'UPI';

    if (selectedMethod === 'UPI') {
      if (upiSubOption === 'QR') {
        methodPayload = 'UPI (QR Code Scan)';
        displayMethod = 'UPI (QR Code Payment)';
      } else {
        const appLabel = selectedUpiApp === 'GPAY' 
          ? 'Google Pay' 
          : selectedUpiApp === 'PHONEPE' 
          ? 'PhonePe' 
          : selectedUpiApp === 'PAYTM' 
          ? 'Paytm' 
          : selectedUpiApp === 'BHIM' 
          ? 'BHIM UPI' 
          : `UPI ID (${upiId.trim()})`;
        methodPayload = `UPI - ${appLabel}`;
        displayMethod = `UPI (${appLabel})`;
      }
    } else if (selectedMethod === 'DEBIT_CARD') {
      const last4 = debitCardNumber.replace(/\s+/g, '').slice(-4) || '4242';
      const cardType = detectCardType(debitCardNumber);
      methodPayload = `DEBIT_CARD - ${cardType} *${last4} (${debitBank})`;
      displayMethod = `Debit Card (${cardType} ending in ${last4} • ${debitBank})`;
    } else if (selectedMethod === 'CREDIT_CARD') {
      const last4 = creditCardNumber.replace(/\s+/g, '').slice(-4) || '8821';
      const cardType = detectCardType(creditCardNumber);
      methodPayload = `CREDIT_CARD - ${cardType} *${last4}`;
      displayMethod = `Credit Card (${cardType} ending in ${last4})`;
    }

    const generatedTxn = 'TXN-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.floor(100000 + Math.random() * 900000);
    setCompletedMethodLabel(displayMethod);
    setTransactionId(generatedTxn);

    try {
      // Step 1: Gateway connection
      setProcessingStage('Connecting to 256-Bit Bank Gateway...');
      await new Promise(r => setTimeout(r, 650));

      // Step 2: Authorizing
      setProcessingStage(`Authorizing ₹${booking?.totalAmount || 0} via ${selectedMethod === 'UPI' ? 'UPI Network' : selectedMethod === 'DEBIT_CARD' ? 'Debit Card Network' : 'Credit Card Network'}...`);
      await new Promise(r => setTimeout(r, 850));

      // Step 3: Approval & Backend API Call
      setProcessingStage('Payment Approved! Generating your confirmed ticket...');
      await api.post(`/bookings/${bookingId}/pay`, { paymentMethod: methodPayload });

      // Sync local storage draft
      try {
        const stored = localStorage.getItem(`booking_${bookingId}_details`);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.status = 'CONFIRMED';
          parsed.paymentMethod = displayMethod;
          parsed.transactionId = generatedTxn;
          localStorage.setItem(`booking_${bookingId}_details`, JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn('Storage sync failed', e);
      }

      setProcessing(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        navigate('/history');
      }, 2800);
    } catch (err: any) {
      console.error('Payment failed', err);
      setProcessing(false);
      setError(err.response?.data?.message || 'Payment processing failed. Please check your payment details and try again.');
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? Reserved seats will be released immediately.')) {
      return;
    }
    setProcessing(true);
    setError('');
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setCancelled(true);
    } catch (err: any) {
      console.error('Failed to cancel booking', err);
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading booking details...</p>
      </div>
    );
  }

  // Booking Cancelled View
  if (cancelled || booking?.status === 'CANCELLED') {
    return (
      <div className="card" style={{ maxWidth: '540px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <XCircle size={48} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#ffffff' }}>Booking Cancelled</h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          This booking (#{bookingId}) has been cancelled and your reserved seats have been released back to the coach.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/search')} className="btn btn-primary btn-md">
            Search Available Buses
          </button>
          <button onClick={() => navigate('/history')} className="btn btn-outline btn-md">
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  // Payment Confirmation View
  if (paymentSuccess) {
    return (
      <div className="card" style={{ maxWidth: '560px', margin: '3.5rem auto', textAlign: 'center', padding: '3rem 2.2rem' }}>
        <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={52} />
        </div>
        <h2 style={{ fontSize: '2.1rem', marginBottom: '0.5rem', color: '#ffffff' }}>Payment Confirmed!</h2>
        <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your ticket reservation has been successfully verified & booked.
        </p>

        <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid var(--border-glass)', padding: '1.4rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Booking Ref:</span>
            <strong style={{ color: '#ffffff' }}>#{bookingId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Transaction ID:</span>
            <strong style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>{transactionId || 'TXN-SUCCESS-98124'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Payment Method:</span>
            <strong style={{ color: 'var(--emerald)' }}>{completedMethodLabel || 'Online Payment'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Passenger:</span>
            <strong style={{ color: '#ffffff' }}>{passengerName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Boarding Point:</span>
            <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{boardingPoint}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Preferred Ending Point:</span>
            <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{endingPoint}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Route:</span>
            <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              {booking?.schedule?.route ? `${booking.schedule.route.source} → ${booking.schedule.route.destination}` : 'Direct Express'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Scheduled Journey:</span>
            <strong style={{ color: 'var(--amber)' }}>
              {departureTime ? formatDateTimeFull(departureTime) : 'Upcoming'}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Seats:</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{booking?.numberOfSeats || 1} Seat(s)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.6rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Amount Paid:</span>
            <strong style={{ color: 'var(--emerald)', fontSize: '1.2rem' }}>₹{booking?.totalAmount || 0}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)' }}>Status:</span>
            <span className="badge badge-emerald" style={{ fontWeight: 700 }}>SUCCESS (CONFIRMED)</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
          Redirecting to your digital boarding pass in 2 seconds...
        </p>

        <button
          onClick={() => navigate('/history')}
          className="btn btn-primary btn-md"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          View My Bookings <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Standard Payment Checkout View
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>
      {/* Top Back Navigation */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontSize: '0.9rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} /> Step 1: Seat Selection
        </div>
        <span style={{ color: 'var(--text-dim)' }}>→</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontSize: '0.9rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} /> Step 2: Passenger Details
        </div>
        <span style={{ color: 'var(--text-dim)' }}>→</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontSize: '0.9rem', fontWeight: 700 }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
            3
          </div>
          Step 3: Online Payment
        </div>
      </div>

      {isDeparted && (
        <div className="card" style={{ borderColor: 'var(--rose)', background: 'rgba(244, 63, 94, 0.12)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
          <AlertCircle size={22} style={{ color: 'var(--rose)' }} />
          <div>
            <strong style={{ color: '#ffffff' }}>Booking Closed — Departure Elapsed</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#fca5a5' }}>
              This bus was scheduled to depart on {formatDateTimeFull(departureTime)}. Payment cannot be accepted for past departures.
            </p>
          </div>
        </div>
      )}

      {/* Main Payment Card */}
      <div className="card" style={{ padding: '2.2rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={22} style={{ color: 'var(--emerald)' }} />
            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Secure Online Payment</h2>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--emerald)', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={14} /> 256-Bit Encrypted
          </span>
        </div>

        {error && (
          <div className="card" style={{ borderColor: 'var(--rose)', background: 'rgba(244, 63, 94, 0.1)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem' }}>
            <AlertCircle size={18} style={{ color: 'var(--rose)' }} />
            <span style={{ fontSize: '0.88rem' }}>{error}</span>
          </div>
        )}

        {/* Primary Passenger Verified Details */}
        <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} /> Traveler & Route Stop Manifest
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <User size={12} style={{ color: 'var(--primary-light)' }} /> Passenger Name
              </span>
              <strong style={{ color: '#ffffff' }}>{passengerName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <Phone size={12} style={{ color: 'var(--cyan)' }} /> Contact Phone
              </span>
              <strong style={{ color: '#ffffff' }}>{passengerPhone || 'Not Specified'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <MapPin size={12} style={{ color: 'var(--emerald)' }} /> Boarding Point
              </span>
              <strong style={{ color: 'var(--emerald)' }}>{boardingPoint}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <MapPin size={12} style={{ color: 'var(--amber)' }} /> Preferred Ending Point
              </span>
              <strong style={{ color: 'var(--amber)' }}>{endingPoint}</strong>
            </div>
            {passengerEmail && (
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <Mail size={12} style={{ color: 'var(--primary-light)' }} /> Email Address
                </span>
                <strong style={{ color: '#ffffff' }}>{passengerEmail}</strong>
              </div>
            )}
            {emergencyContact && (
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <HeartHandshake size={12} style={{ color: 'var(--rose)' }} /> Emergency Contact
                </span>
                <strong style={{ color: '#ffffff' }}>{emergencyContact}</strong>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            ONLINE PAYMENT METHOD SELECTION TABS (UPI / DEBIT CARD / CREDIT CARD)
           ========================================================================= */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={16} style={{ color: 'var(--primary-light)' }} />
            Select Online Payment Method:
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {/* 1. UPI Tab */}
            <button
              type="button"
              onClick={() => { setSelectedMethod('UPI'); setFieldErrors({}); }}
              style={{
                background: selectedMethod === 'UPI' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: selectedMethod === 'UPI' ? '2px solid var(--primary-light)' : '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedMethod === 'UPI' ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              <Smartphone size={24} style={{ color: selectedMethod === 'UPI' ? 'var(--cyan)' : 'var(--text-dim)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: selectedMethod === 'UPI' ? '#ffffff' : 'var(--text-muted)' }}>
                UPI
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 6px', borderRadius: '10px' }}>
                Instant & Free
              </span>
            </button>

            {/* 2. Debit Card Tab */}
            <button
              type="button"
              onClick={() => { setSelectedMethod('DEBIT_CARD'); setFieldErrors({}); }}
              style={{
                background: selectedMethod === 'DEBIT_CARD' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: selectedMethod === 'DEBIT_CARD' ? '2px solid var(--primary-light)' : '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedMethod === 'DEBIT_CARD' ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              <CreditCard size={24} style={{ color: selectedMethod === 'DEBIT_CARD' ? 'var(--emerald)' : 'var(--text-dim)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: selectedMethod === 'DEBIT_CARD' ? '#ffffff' : 'var(--text-muted)' }}>
                Debit Card
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '10px' }}>
                All Major Banks
              </span>
            </button>

            {/* 3. Credit Card Tab */}
            <button
              type="button"
              onClick={() => { setSelectedMethod('CREDIT_CARD'); setFieldErrors({}); }}
              style={{
                background: selectedMethod === 'CREDIT_CARD' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: selectedMethod === 'CREDIT_CARD' ? '2px solid var(--primary-light)' : '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedMethod === 'CREDIT_CARD' ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              <CreditCard size={24} style={{ color: selectedMethod === 'CREDIT_CARD' ? 'var(--amber)' : 'var(--text-dim)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: selectedMethod === 'CREDIT_CARD' ? '#ffffff' : 'var(--text-muted)' }}>
                Credit Card
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 6px', borderRadius: '10px' }}>
                Visa / MC / Amex
              </span>
            </button>
          </div>

          {/* =====================================================================
              METHOD 1: UPI PAYMENT INTERFACE
             ===================================================================== */}
          {selectedMethod === 'UPI' && (
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              {/* UPI Sub-Toggles: Apps vs QR Code */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setUpiSubOption('APPS')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: upiSubOption === 'APPS' ? 'var(--primary)' : 'transparent',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Smartphone size={14} /> UPI Apps & ID
                </button>
                <button
                  type="button"
                  onClick={() => setUpiSubOption('QR')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: upiSubOption === 'QR' ? 'var(--primary)' : 'transparent',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <QrCode size={14} /> Scan UPI QR Code
                </button>
              </div>

              {upiSubOption === 'APPS' ? (
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
                    Choose your UPI Application:
                  </label>

                  {/* UPI Apps Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '1.2rem' }}>
                    {[
                      { id: 'GPAY', label: 'Google Pay', icon: '🟢', color: '#4285F4' },
                      { id: 'PHONEPE', label: 'PhonePe', icon: '🟣', color: '#5f259f' },
                      { id: 'PAYTM', label: 'Paytm', icon: '🔵', color: '#00b9f5' },
                      { id: 'BHIM', label: 'BHIM UPI', icon: '🇮🇳', color: '#0083ca' }
                    ].map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id as any)}
                        style={{
                          border: selectedUpiApp === app.id ? `2px solid ${app.color}` : '1px solid var(--border-glass)',
                          background: selectedUpiApp === app.id ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '8px',
                          padding: '0.65rem 0.4rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{app.icon}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>{app.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Or Enter Custom UPI ID */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        Enter UPI ID / VPA <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Optional for auto-app payment)</span>
                      </label>
                      {upiVerified && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <Check size={12} /> Verified VPA
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="e.g. mobile@paytm or name@oksbi"
                        value={upiId}
                        onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }}
                        className={`input-field ${fieldErrors.upiId ? 'border-rose-500' : ''}`}
                        style={{ flex: 1, fontSize: '0.88rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (upiId.trim() && upiId.includes('@')) {
                            setUpiVerified(true);
                          } else {
                            alert('Please enter a valid format such as username@bank');
                          }
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        Verify
                      </button>
                    </div>

                    {fieldErrors.upiId && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                        {fieldErrors.upiId}
                      </span>
                    )}

                    {/* Suffix Helper chips */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                      {['@okhdfcbank', '@oksbi', '@paytm', '@ybl', '@icici'].map(suffix => (
                        <button
                          key={suffix}
                          type="button"
                          onClick={() => {
                            const base = upiId.split('@')[0] || passengerPhone || 'alex';
                            setUpiId(`${base}${suffix}`);
                            setUpiVerified(true);
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '12px',
                            color: 'var(--text-dim)',
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            cursor: 'pointer'
                          }}
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* QR Code Mode */
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div 
                    style={{ 
                      width: '180px', 
                      height: '180px', 
                      margin: '0 auto 1rem auto', 
                      background: '#ffffff', 
                      padding: '10px', 
                      borderRadius: '12px',
                      boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)' 
                    }}
                  >
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=skybus@icici%26pn=SkyBusExpress%26am=${booking?.totalAmount || 0}%26cu=INR%26tr=${bookingId}`}
                      alt="UPI Payment QR"
                      style={{ width: '100%', height: '100%', display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                    Scan & Pay ₹{booking?.totalAmount || 0}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Scan with Google Pay, PhonePe, Paytm or any BHIM UPI App
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              METHOD 2: DEBIT CARD PAYMENT INTERFACE
             ===================================================================== */}
          {selectedMethod === 'DEBIT_CARD' && (
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.4rem' }}>
              {/* Virtual Debit Card Mockup */}
              <div 
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--emerald)' }}>
                    {debitBank} DEBIT
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                    {detectCardType(debitCardNumber)}
                  </div>
                </div>

                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '1.2rem', color: '#f8fafc' }}>
                  {debitCardNumber || '•••• •••• •••• ••••'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Cardholder Name</div>
                    <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{debitCardHolder || passengerName || 'VALUED TRAVELER'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Expires</div>
                    <div style={{ fontWeight: 600 }}>{debitExpiry || 'MM/YY'}</div>
                  </div>
                </div>
              </div>

              {/* Debit Card Inputs */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Debit Card Number <span style={{ color: 'var(--rose)' }}>*</span></span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>{detectCardType(debitCardNumber)}</span>
                </label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  value={debitCardNumber}
                  onChange={(e) => setDebitCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className={`input-field ${fieldErrors.debitCardNumber ? 'border-rose-500' : ''}`}
                  style={{ width: '100%', fontSize: '0.95rem', fontFamily: 'monospace', marginTop: '4px' }}
                />
                {fieldErrors.debitCardNumber && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.debitCardNumber}
                  </span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Name on Debit Card <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ALEX JOHNSON"
                  value={debitCardHolder}
                  onChange={(e) => setDebitCardHolder(e.target.value)}
                  className={`input-field ${fieldErrors.debitCardHolder ? 'border-rose-500' : ''}`}
                  style={{ width: '100%', textTransform: 'uppercase', marginTop: '4px' }}
                />
                {fieldErrors.debitCardHolder && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.debitCardHolder}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="debit-expiry-month" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Expiry Month <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <select
                    id="debit-expiry-month"
                    name="expiryMonth"
                    data-testid="expiry-month"
                    value={debitExpMonth}
                    onChange={(e) => {
                      setDebitExpMonth(e.target.value);
                      if (fieldErrors.debitExpiry) setFieldErrors(prev => ({ ...prev, debitExpiry: '' }));
                    }}
                    className={`input-field ${fieldErrors.debitExpiry ? 'border-rose-500' : ''}`}
                    style={{ width: '100%', marginTop: '4px', fontSize: '0.88rem' }}
                  >
                    <option value="">Month</option>
                    {EXPIRY_MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="debit-expiry-year" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Expiry Year <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <select
                    id="debit-expiry-year"
                    name="expiryYear"
                    data-testid="expiry-year"
                    value={debitExpYear}
                    onChange={(e) => {
                      setDebitExpYear(e.target.value);
                      if (fieldErrors.debitExpiry) setFieldErrors(prev => ({ ...prev, debitExpiry: '' }));
                    }}
                    className={`input-field ${fieldErrors.debitExpiry ? 'border-rose-500' : ''}`}
                    style={{ width: '100%', marginTop: '4px', fontSize: '0.88rem' }}
                  >
                    <option value="">Year</option>
                    {EXPIRY_YEARS.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    CVV <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={debitCvv}
                    onChange={(e) => setDebitCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                    className={`input-field ${fieldErrors.debitCvv ? 'border-rose-500' : ''}`}
                    style={{ width: '100%', marginTop: '4px', letterSpacing: '2px' }}
                  />
                  {fieldErrors.debitCvv && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--rose)', marginTop: '3px', display: 'block' }}>
                      {fieldErrors.debitCvv}
                    </span>
                  )}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Bank
                  </label>
                  <select
                    value={debitBank}
                    onChange={(e) => setDebitBank(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', marginTop: '4px', fontSize: '0.85rem' }}
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">SBI</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Bank">Kotak Bank</option>
                    <option value="Other Bank">Other Bank</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              METHOD 3: CREDIT CARD PAYMENT INTERFACE
             ===================================================================== */}
          {selectedMethod === 'CREDIT_CARD' && (
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.4rem' }}>
              {/* Virtual Credit Card Mockup */}
              <div 
                style={{
                  background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--amber)' }}>
                    PLATINUM CREDIT
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--cyan)' }}>
                    {detectCardType(creditCardNumber)}
                  </div>
                </div>

                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '1.2rem', color: '#f8fafc' }}>
                  {creditCardNumber || '•••• •••• •••• ••••'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Cardholder Name</div>
                    <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{creditCardHolder || passengerName || 'VALUED TRAVELER'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Expires</div>
                    <div style={{ fontWeight: 600 }}>{creditExpiry || 'MM/YY'}</div>
                  </div>
                </div>
              </div>

              {/* Credit Card Inputs */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Credit Card Number <span style={{ color: 'var(--rose)' }}>*</span></span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--amber)' }}>{detectCardType(creditCardNumber)}</span>
                </label>
                <input
                  type="text"
                  placeholder="5123 4567 8901 2345"
                  value={creditCardNumber}
                  onChange={(e) => setCreditCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className={`input-field ${fieldErrors.creditCardNumber ? 'border-rose-500' : ''}`}
                  style={{ width: '100%', fontSize: '0.95rem', fontFamily: 'monospace', marginTop: '4px' }}
                />
                {fieldErrors.creditCardNumber && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.creditCardNumber}
                  </span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Name on Credit Card <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ALEX JOHNSON"
                  value={creditCardHolder}
                  onChange={(e) => setCreditCardHolder(e.target.value)}
                  className={`input-field ${fieldErrors.creditCardHolder ? 'border-rose-500' : ''}`}
                  style={{ width: '100%', textTransform: 'uppercase', marginTop: '4px' }}
                />
                {fieldErrors.creditCardHolder && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.creditCardHolder}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="credit-expiry-month" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Expiry Month <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <select
                    id="credit-expiry-month"
                    name="expiryMonth"
                    data-testid="expiry-month"
                    value={creditExpMonth}
                    onChange={(e) => {
                      setCreditExpMonth(e.target.value);
                      if (fieldErrors.creditExpiry) setFieldErrors(prev => ({ ...prev, creditExpiry: '' }));
                    }}
                    className={`input-field ${fieldErrors.creditExpiry ? 'border-rose-500' : ''}`}
                    style={{ width: '100%', marginTop: '4px', fontSize: '0.88rem' }}
                  >
                    <option value="">Month</option>
                    {EXPIRY_MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="credit-expiry-year" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Expiry Year <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <select
                    id="credit-expiry-year"
                    name="expiryYear"
                    data-testid="expiry-year"
                    value={creditExpYear}
                    onChange={(e) => {
                      setCreditExpYear(e.target.value);
                      if (fieldErrors.creditExpiry) setFieldErrors(prev => ({ ...prev, creditExpiry: '' }));
                    }}
                    className={`input-field ${fieldErrors.creditExpiry ? 'border-rose-500' : ''}`}
                    style={{ width: '100%', marginTop: '4px', fontSize: '0.88rem' }}
                  >
                    <option value="">Year</option>
                    {EXPIRY_YEARS.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    CVV / CVC <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={creditCvv}
                    onChange={(e) => setCreditCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className={`input-field ${fieldErrors.creditCvv ? 'border-rose-500' : ''}`}
                    style={{ width: '100%', marginTop: '4px', letterSpacing: '2px' }}
                  />
                  {fieldErrors.creditCvv && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--rose)', marginTop: '3px', display: 'block' }}>
                      {fieldErrors.creditCvv}
                    </span>
                  )}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={saveCreditCard}
                  onChange={(e) => setSaveCreditCard(e.target.checked)}
                />
                <span>Save card securely for faster checkout in accordance with RBI tokenization rules</span>
              </label>
            </div>
          )}
        </div>

        {/* Trip Summary Details */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            Fare Breakdown
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Route:</span>
              <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                {booking?.schedule?.route ? `${booking.schedule.route.source} → ${booking.schedule.route.destination}` : 'Direct Express'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} style={{ color: 'var(--amber)' }} /> Journey Date & Day:
              </span>
              <strong style={{ color: 'var(--amber)' }}>
                {departureTime ? formatFullDateWithDay(departureTime) : 'Upcoming Departure'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Reserved Seats:</span>
              <strong style={{ color: '#ffffff' }}>{booking?.numberOfSeats || 1} Seat(s)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Gateway Convenience Fee:</span>
              <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>₹0 (FREE)</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>Total Payable Amount:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald)' }}>
                ₹{booking?.totalAmount || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Payment CTA Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isDeparted ? (
            <button
              type="button"
              disabled
              className="btn btn-outline btn-lg"
              style={{ width: '100%', opacity: 0.55, cursor: 'not-allowed', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            >
              <Clock size={16} /> Cannot Pay — Departure Has Elapsed
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePayNow}
              className="btn btn-primary btn-lg"
              style={{ 
                width: '100%', 
                fontSize: '1.1rem', 
                padding: '1.1rem 1.5rem', 
                justifyContent: 'center', 
                cursor: processing ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
              }}
              disabled={processing}
            >
              <Lock size={18} />
              {processing ? 'Processing Payment...' : `Pay ₹${booking?.totalAmount || 0} via ${selectedMethod === 'UPI' ? 'UPI' : selectedMethod === 'DEBIT_CARD' ? 'Debit Card' : 'Credit Card'}`}
            </button>
          )}

          <button
            type="button"
            onClick={handleCancelBooking}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--rose)', alignSelf: 'center' }}
            disabled={processing}
          >
            Cancel this Booking
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--emerald)' }} />
          <span>PCI-DSS Compliant • 256-Bit SSL Encryption • Instant E-Ticket Delivery</span>
        </div>
      </div>

      {/* =========================================================================
          AUTHENTIC PAYMENT PROCESSING OVERLAY MODAL
         ========================================================================= */}
      {processing && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div 
            className="card" 
            style={{
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              padding: '2.5rem 2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(99, 102, 241, 0.4)'
            }}
          >
            <div style={{ position: 'relative', width: '70px', height: '70px', margin: '0 auto 1.5rem auto' }}>
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '3px solid rgba(99, 102, 241, 0.2)',
                  borderTopColor: 'var(--cyan)',
                  animation: 'spin 1s linear infinite'
                }} 
              />
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan)'
                }}
              >
                <Lock size={26} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#ffffff' }}>
              Processing Transaction
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--cyan)', marginBottom: '1.25rem', fontWeight: 600 }}>
              {processingStage || 'Authorizing with secure banking network...'}
            </p>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Amount: <strong style={{ color: 'var(--emerald)' }}>₹{booking?.totalAmount || 0}</strong> • Method: <strong style={{ color: '#ffffff' }}>{selectedMethod}</strong>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
              ⚠️ Please do not refresh or close the page while transaction is executing.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
