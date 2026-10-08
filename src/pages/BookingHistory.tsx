import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Ticket, Bus, Printer, CheckCircle, RefreshCw, XCircle, AlertTriangle, Clock, CreditCard, ShieldCheck, Check, Calendar, MapPin } from 'lucide-react';
import { formatFullDateWithDay } from '../utils/dateUtils';

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/user');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      await api.post(`/bookings/${cancelModalBooking.id}/cancel`);
      // Update local state to CANCELLED
      setBookings(prev =>
        prev.map(b => (b.id === cancelModalBooking.id ? { ...b, status: 'CANCELLED' } : b))
      );
      setNotification({
        type: 'success',
        message: `Booking #${cancelModalBooking.id} cancelled successfully! 70% refund of ₹${(cancelModalBooking.totalAmount * 0.7).toFixed(2)} has been processed (30% cancellation fee of ₹${(cancelModalBooking.totalAmount * 0.3).toFixed(2)} retained) and coach seats have been released.`
      });
      setCancelModalBooking(null);
    } catch (err: any) {
      console.error('Failed to cancel booking', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel booking. Please try again.'
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>My Bookings & E-Tickets</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            View, print, manage, or cancel your digital intercity bus travel passes with instant seat releases and refunds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchBookings} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => navigate('/search')} className="btn btn-primary btn-sm">
            Book Another Trip
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: notification.type === 'success' ? '#6ee7b7' : '#fca5a5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.95rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {notification.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving your booking history...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
            <Ticket size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Active Bookings Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            You haven't reserved any bus tickets yet. Search our top intercity routes and book your luxury trip in seconds!
          </p>
          <button onClick={() => navigate('/search')} className="btn btn-primary btn-lg">
            Search Available Buses
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {bookings.map((booking) => {
            const route = booking.schedule?.route;
            const bus = booking.schedule?.bus;
            const bookingDate = booking.bookingDate || booking.createdAt;
            const isCancelled = booking.status === 'CANCELLED';
            const isPending = booking.status === 'PENDING';

            return (
              <div
                key={booking.id}
                className="ticket-pass"
                style={{
                  opacity: isCancelled ? 0.85 : 1,
                  filter: isCancelled ? 'grayscale(0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Boarding Pass Header */}
                <div
                  className="ticket-header"
                  style={{
                    background: isCancelled
                      ? 'linear-gradient(135deg, #4b1d1d, #7f1d1d)'
                      : isPending
                      ? 'linear-gradient(135deg, #78350f, #92400e)'
                      : undefined
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bus size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                        SKYBUS LUXE EXPRESS PASS
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                        E-Ticket Ref: #{booking.id} • Registered Fleet
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {isCancelled ? (
                      <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#b91c1c', fontWeight: 800 }}>
                        <XCircle size={13} /> CANCELLED (70% REFUNDED)
                      </span>
                    ) : isPending ? (
                      <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#b45309', fontWeight: 800 }}>
                        <Clock size={13} /> PENDING PAYMENT
                      </span>
                    ) : (
                      <span className="badge badge-emerald" style={{ background: '#ffffff', color: '#047857', fontWeight: 800 }}>
                        <CheckCircle size={12} /> CONFIRMED
                      </span>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={handlePrint}
                        className="btn btn-sm"
                        style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                        title="Print Ticket"
                      >
                        <Printer size={15} /> Print
                      </button>
                    )}

                    {isPending && (
                      <button
                        onClick={() => navigate(`/payment/${booking.id}`)}
                        className="btn btn-sm"
                        style={{ background: '#ffffff', color: '#b45309', fontWeight: 700 }}
                      >
                        <CreditCard size={14} /> Pay Now
                      </button>
                    )}

                    {/* Cancellation Button */}
                    {!isCancelled ? (
                      <button
                        onClick={() => setCancelModalBooking(booking)}
                        className="btn btn-sm"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: '#fecaca',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          fontWeight: 600
                        }}
                        title="Cancel this booking and release seats"
                      >
                        <XCircle size={14} /> Cancel Ticket
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#fecaca', background: 'rgba(0, 0, 0, 0.25)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
                        Seats Released • 70% Refund Processed (30% Retained)
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Ticket Pass Body */}
                <div className="ticket-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.8fr) minmax(180px, 1fr) 140px', gap: '1.5rem', alignItems: 'center' }}>
                    {/* Origin to Destination */}
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em', fontWeight: 700 }}>
                        Journey Itinerary
                      </span>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0' }}>
                        {route ? `${route.source} → ${route.destination}` : 'Direct Coach'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Coach: <strong style={{ color: 'var(--text-main)' }}>{bus?.busNumber || 'DL-01-EXP-1001'}</strong> ({bus?.type || 'AC Sleeper'})
                      </div>
                      {booking.passengerName && (
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '4px' }}>
                          Passenger: <strong style={{ color: '#ffffff' }}>{booking.passengerName}</strong>
                        </div>
                      )}
                      {booking.boardingPoint && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--cyan)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> Boarding: {booking.boardingPoint}
                        </div>
                      )}
                      {(booking.endingPoint || booking.droppingPoint) && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--amber)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> Ending: {booking.endingPoint || booking.droppingPoint}
                        </div>
                      )}
                    </div>

                    {/* Booking Meta Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} style={{ color: 'var(--amber)' }} /> Journey Date & Day
                        </span>
                        <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--amber)' }}>
                          {booking.schedule?.departureTime ? formatFullDateWithDay(booking.schedule.departureTime) : 'Upcoming Departure'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Departure: {booking.schedule?.departureTime ? new Date(booking.schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reserved Seats</span>
                        <div style={{ fontSize: '0.96rem', fontWeight: 700, color: isCancelled ? '#ef4444' : 'var(--primary-light)' }}>
                          {booking.numberOfSeats} Passenger(s) {isCancelled && '(Released)'}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isCancelled ? 'Refund Credited (70%)' : 'Fare Paid'}
                        </span>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isCancelled ? '#6ee7b7' : 'var(--emerald)' }}>
                          {isCancelled ? `₹${(booking.refundAmount ?? (booking.totalAmount * 0.7)).toFixed(0)}` : `₹${booking.totalAmount}`}
                        </div>
                        {isCancelled && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--amber)', marginTop: '2px', fontWeight: 600 }}>
                            30% Fee: ₹{(booking.cancellationFee ?? (booking.totalAmount * 0.3)).toFixed(0)}
                          </div>
                        )}
                        {booking.paymentMethod && !isCancelled && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--cyan)', marginTop: '2px', fontWeight: 600 }}>
                            💳 {booking.paymentMethod}
                          </div>
                        )}
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Booked On</span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          {bookingDate ? formatFullDateWithDay(bookingDate) : 'Today'}
                        </div>
                      </div>
                    </div>

                    {/* QR Code Boarding Stamp */}
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem', position: 'relative' }}>
                      <div
                        style={{
                          width: '90px',
                          height: '90px',
                          margin: '0 auto',
                          background: '#ffffff',
                          padding: '6px',
                          borderRadius: '8px',
                          opacity: isCancelled ? 0.35 : 1,
                          position: 'relative'
                        }}
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=SKYBUS-BOOKING-${booking.id}`}
                          alt="Boarding QR"
                          style={{ width: '100%', height: '100%', display: 'block' }}
                        />
                      </div>
                      {isCancelled ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: '30%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(-15deg)',
                            background: '#ef4444',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          CANCELLED
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                          Scan at Boarding
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Perforated ticket divider */}
                <div className="ticket-divider">
                  <div className="ticket-divider-line" />
                </div>

                {/* Ticket Footer Guidelines */}
                <div style={{ padding: '1rem 2rem 1.5rem', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>Passenger Email: {booking.user?.email || 'Registered User'}</span>
                  <span>
                    {isCancelled ? (
                      <span style={{ color: '#f87171' }}>Booking cancelled • Seats released to public coach</span>
                    ) : (
                      'Direct Customer Support: +91 1800-SKY-BUS'
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => !cancelling && setCancelModalBooking(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(20, 24, 38, 0.95)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>Confirm Ticket Cancellation</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Booking Reference: #{cancelModalBooking.id}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel your journey reservation? Once cancelled, your reserved seats will be immediately released back to the coach for other passengers.
            </p>

            {/* Journey Summary */}
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Route:</span>
                <strong style={{ color: '#ffffff' }}>
                  {cancelModalBooking.schedule?.route
                    ? `${cancelModalBooking.schedule.route.source} → ${cancelModalBooking.schedule.route.destination}`
                    : 'Direct Route'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Journey Date:</span>
                <strong style={{ color: 'var(--amber)' }}>
                  {cancelModalBooking.schedule?.departureTime ? formatFullDateWithDay(cancelModalBooking.schedule.departureTime) : 'Upcoming'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Coach:</span>
                <span style={{ color: 'var(--text-main)' }}>
                  {cancelModalBooking.schedule?.bus?.busNumber || 'Express Coach'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Seats:</span>
                <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                  {cancelModalBooking.numberOfSeats} Seat(s)
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Total Fare Paid:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{cancelModalBooking.totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Cancellation Fee (30% Retained):</span>
                  <span style={{ color: 'var(--amber)', fontWeight: 600 }}>-₹{(cancelModalBooking.totalAmount * 0.3).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-glass)' }}>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>Net Refund (70%):</span>
                  <strong style={{ color: 'var(--emerald)', fontSize: '1.1rem' }}>
                    ₹{(cancelModalBooking.totalAmount * 0.7).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6ee7b7', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.08)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <ShieldCheck size={16} />
              <span>Instant Refund Policy: 70% will be credited to your account. 30% is deducted as cancellation fee.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                disabled={cancelling}
                className="btn btn-outline btn-md"
              >
                Keep My Ticket
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="btn btn-md"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: cancelling ? 'not-allowed' : 'pointer'
                }}
              >
                <XCircle size={16} />
                {cancelling ? 'Cancelling...' : 'Confirm & Cancel Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
