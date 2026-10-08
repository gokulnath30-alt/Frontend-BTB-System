import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRightLeft, 
  Sparkles, 
  Shield, 
  Wifi, 
  Zap, 
  Coffee, 
  ChevronRight, 
  Star, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Compass
} from 'lucide-react';
import { getTodayDateString, formatShortDateWithDay, isPastDate } from '../utils/dateUtils';

const POPULAR_ROUTES = [
  { source: 'Salem', destination: 'Chennai', fare: '₹450', time: '6h 00m', coach: 'AC Sleeper / Seater' },
  { source: 'Salem', destination: 'Bangalore', fare: '₹380', time: '4h 45m', coach: 'AC Sleeper / Seater' },
  { source: 'Delhi', destination: 'Jaipur', fare: '₹750', time: '5h 30m', coach: 'AC Sleeper' },
  { source: 'Mumbai', destination: 'Pune', fare: '₹450', time: '3h 30m', coach: 'AC Seater' },
  { source: 'Bangalore', destination: 'Chennai', fare: '₹950', time: '6h 30m', coach: 'AC Sleeper' },
  { source: 'Hyderabad', destination: 'Bangalore', fare: '₹650', time: '9h 00m', coach: 'Executive Seater' }
];

const FAQS = [
  {
    q: 'How does the live seat selection and booking work?',
    a: 'Once you choose your desired route and date, you can view the exact upper and lower deck sleeper layout. Clicking an available seat locks it in real time, preventing other users from selecting it while you complete your reservation.'
  },
  {
    q: 'What amenities are included in SkyBus Luxe coaches?',
    a: 'All our executive sleeper and seater coaches include high-speed satellite Wi-Fi, individual 45W USB-C charging points, plush memory foam mattresses, freshly sanitized bedding, ambient cabin lighting, and complimentary bottled water.'
  },
  {
    q: 'Can I cancel or modify my booking if my plans change?',
    a: 'Yes, cancellations are 100% self-service through your Booking History dashboard. Confirmed bookings can be cancelled with one click, with seats immediately released back to the fleet and 70% instant refund processing (30% cancellation fee retained).'
  },
  {
    q: 'How is passenger safety and on-time arrival guaranteed?',
    a: 'All long-distance departures operate with two certified senior drivers on rotation. Coaches are monitored 24/7 via live GPS telemetry and automated speed limiters to guarantee safe and on-time arrivals.'
  }
];

const Home: React.FC = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'SLEEPER' | 'EXPRESS'>('ALL');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dateError, setDateError] = useState('');
  const navigate = useNavigate();

  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPastDate(date)) {
      setDateError('Booking is strictly prohibited for past dates or years. Please select today or a future date.');
      setDate(getTodayDateString());
      return;
    }
    setDateError('');
    navigate(`/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`);
  };

  const selectQuickRoute = (from: string, to: string) => {
    setSource(from);
    setDestination(to);
    const validDate = isPastDate(date) ? getTodayDateString() : date;
    navigate(`/search?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${encodeURIComponent(validDate)}`);
  };

  const setRelativeDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + Math.max(0, daysAhead));
    const dt = d.toISOString().split('T')[0];
    setDate(dt);
    setDateError('');
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Background ambient lighting */}
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />

      {/* ==================================================================== */}
      {/* 1. HERO SECTION                                                      */}
      {/* ==================================================================== */}
      <section style={{ textAlign: 'center', padding: '3.5rem 0 2.5rem', position: 'relative', zIndex: 1 }}>
        
        {/* Top Announcement Pill */}
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 16px', 
            background: 'rgba(99, 102, 241, 0.12)', 
            border: '1px solid rgba(99, 102, 241, 0.35)', 
            borderRadius: '9999px', 
            marginBottom: '1.5rem',
            boxShadow: '0 0 20px -3px var(--primary-glow)'
          }}
        >
          <Sparkles size={15} style={{ color: 'var(--primary-light)' }} />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-light)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            The Gold Standard in Highway Intercity Travel
          </span>
        </div>

        {/* Master Headline */}
        <h1 
          style={{ 
            fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)', 
            fontWeight: 800, 
            maxWidth: '920px', 
            margin: '0 auto 1.25rem', 
            letterSpacing: '-0.03em',
            lineHeight: 1.15
          }}
        >
          Travel Beyond First Class Across{' '}
          <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Every Destination
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          style={{ 
            fontSize: '1.15rem', 
            maxWidth: '680px', 
            margin: '0 auto 2.75rem', 
            color: 'var(--text-muted)',
            lineHeight: 1.6
          }}
        >
          Individual sleeper suites, guaranteed zero double-bookings, real-time GPS telemetry, and seamless digital boarding passes.
        </p>

        {/* ==================================================================== */}
        {/* 2. THE LUXURY SEARCH CONSOLE (PERFECT PIXEL ALIGNMENT)              */}
        {/* ==================================================================== */}
        <div style={{ maxWidth: '1060px', margin: '0 auto', textAlign: 'left' }}>
          <div className="luxury-search-console">
            
            {/* Search Top Filter Tabs & Quick Date Selectors */}
            <div className="search-console-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveCategory('ALL')} 
                  className={`search-tab-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
                >
                  <Compass size={15} /> All Coaches
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveCategory('SLEEPER')} 
                  className={`search-tab-pill ${activeCategory === 'SLEEPER' ? 'active' : ''}`}
                >
                  <Coffee size={15} /> AC Sleeper Berths
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveCategory('EXPRESS')} 
                  className={`search-tab-pill ${activeCategory === 'EXPRESS' ? 'active' : ''}`}
                >
                  <Zap size={15} /> Same-Day Express
                </button>
              </div>

              {/* Quick Date Presets on the Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Quick Date:</span>
                <button
                  type="button"
                  onClick={() => setRelativeDate(0)}
                  className="search-tab-pill"
                  style={{
                    background: date === getTodayDateString() ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: date === getTodayDateString() ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.1)',
                    color: date === getTodayDateString() ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    padding: '4px 10px'
                  }}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDate(1)}
                  className="search-tab-pill"
                  style={{
                    fontSize: '0.78rem',
                    padding: '4px 10px',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Tomorrow
                </button>
              </div>
            </div>

            {/* Main Form Fields Row */}
            {dateError && (
              <div style={{ padding: '0.6rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠️ {dateError}</span>
              </div>
            )}
            <form onSubmit={handleSearchSubmit}>
              <div className="search-form-row">
                
                {/* 1. Origin Field */}
                <div className="search-field-box">
                  <div className="search-field-label">
                    <MapPin size={13} style={{ color: 'var(--cyan)' }} /> Departure City
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Salem, Bangalore, Delhi"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="search-field-input"
                    list="home-source-cities"
                    required
                  />
                  <datalist id="home-source-cities">
                    <option value="Salem" />
                    <option value="Bangalore" />
                    <option value="Chennai" />
                    <option value="Delhi" />
                    <option value="Mumbai" />
                    <option value="Hyderabad" />
                    <option value="Pune" />
                  </datalist>
                </div>

                {/* 2. Centered Swap Button */}
                <button 
                  type="button" 
                  onClick={handleSwap} 
                  className="search-swap-circle" 
                  title="Swap Origin and Destination"
                >
                  <ArrowRightLeft size={16} />
                </button>

                {/* 3. Destination Field */}
                <div className="search-field-box">
                  <div className="search-field-label">
                    <MapPin size={13} style={{ color: 'var(--primary-light)' }} /> Destination City
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Chennai, Bangalore, Jaipur"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="search-field-input"
                    list="home-dest-cities"
                    required
                  />
                  <datalist id="home-dest-cities">
                    <option value="Chennai" />
                    <option value="Bangalore" />
                    <option value="Jaipur" />
                    <option value="Pune" />
                    <option value="Salem" />
                    <option value="Delhi" />
                  </datalist>
                </div>

                {/* 4. Journey Date Field - Perfect Clean 2-Row Alignment */}
                <div className="search-field-box date-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="search-field-label" style={{ margin: 0 }}>
                      <Calendar size={13} style={{ color: 'var(--amber)' }} /> Journey Date
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--amber)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {formatShortDateWithDay(date)}
                    </span>
                  </div>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={date}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isPastDate(val)) {
                        setDateError('Booking is strictly prohibited for past dates or years. Please select today or a future date.');
                        setDate(getTodayDateString());
                        return;
                      }
                      setDateError('');
                      setDate(val);
                    }}
                    className="search-field-input"
                    required
                  />
                </div>

                {/* 5. Search Action Button */}
                <div className="submit-box">
                  <button type="submit" className="search-submit-btn" style={{ width: '100%' }}>
                    <Search size={18} />
                    <span>Find Buses</span>
                  </button>
                </div>

              </div>
            </form>

            {/* Quick Popular Route Chips */}
            <div className="quick-routes-container">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                High-Demand Express Routes:
              </span>
              {POPULAR_ROUTES.map((route, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectQuickRoute(route.source, route.destination)}
                  className="route-pill-btn"
                >
                  <span>{route.source} → {route.destination}</span>
                  <span className="route-pill-fare">{route.fare}</span>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Trust Proof Badges */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2.5rem', 
            marginTop: '2.5rem', 
            flexWrap: 'wrap',
            color: 'var(--text-muted)',
            fontSize: '0.88rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={16} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
            <strong style={{ color: '#ffffff' }}>4.9/5 Rating</strong> (12,800+ Verified Passengers)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} style={{ color: 'var(--cyan)' }} />
            <strong style={{ color: '#ffffff' }}>99.8% On-Time</strong> Departures & Arrivals
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} style={{ color: 'var(--emerald)' }} />
            <strong style={{ color: '#ffffff' }}>Zero Double-Booking</strong> Guaranteed
          </div>
        </div>

      </section>

      {/* ==================================================================== */}
      {/* 3. FLEET SHOWCASE SECTION (PHOTOREALISTIC GENERATED ASSETS)          */}
      {/* ==================================================================== */}
      <section style={{ padding: '3.5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            <Award size={14} /> Certified Luxury Fleet Standards
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Travel In Unrivaled Architectural Comfort</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted)' }}>
            Each multi-axle coach is precision-engineered with noise-isolated cabins, memory foam mattresses, and panoramic highway views.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          
          {/* Coach 1: Volvo 9600 Exterior */}
          <div className="fleet-card">
            <div className="fleet-image-wrap">
              <img 
                src="/assets/luxury-coach.jpg" 
                alt="SkyBus Luxe Volvo 9600 Multi-Axle Luxury Sleeper Coach" 
              />
              <div className="fleet-image-badge">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
                <span>Volvo 9600 Multi-Axle • Live Telemetry</span>
              </div>
            </div>
            
            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Executive Multi-Axle Cruiser</h3>
                <span className="badge badge-cyan">Flagship Model</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Equipped with pneumatic multi-stage air suspension, electronic stability controls, and Euro-VI ultra-quiet acoustic insulation.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> Air Suspension
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> Dual Senior Pilots
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> Speed-Limiter Protected
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> 24/7 CCTV Camera Security
                </div>
              </div>

              <button 
                type="button"
                onClick={() => navigate('/search')}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
              >
                Browse Coach Schedules <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Coach 2: Sleeper Cabin Suite Interior */}
          <div className="fleet-card">
            <div className="fleet-image-wrap">
              <img 
                src="/assets/luxury-cabin.jpg" 
                alt="First-Class Private Sleeper Suite Interior" 
              />
              <div className="fleet-image-badge">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block' }} />
                <span>Private Berth Suite • 6.5ft Berth</span>
              </div>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>First-Class Private Suites</h3>
                <span className="badge badge-indigo">Sleeper Suite</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Individual private cabins enclosed with velvet blackout curtains, full-flat memory foam mattresses, and warm LED ambient mood lighting.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> 45W Type-C Fast Charge
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> Starlink Gigabit Wi-Fi
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> Sanitized Clean Duvets
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> Individual AC Nozzles
                </div>
              </div>

              <button 
                type="button"
                onClick={() => navigate('/search')}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
              >
                Select Your Private Berth <ChevronRight size={15} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. POPULAR CORRIDORS TABLE (ONE-CLICK BOOKING)                      */}
      {/* ==================================================================== */}
      <section style={{ padding: '2.5rem 0 3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>Daily Departures</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Popular Express Corridors</h2>
            <p style={{ color: 'var(--text-muted)' }}>Daily fixed departures with verified live seat tracking.</p>
          </div>

          <button onClick={() => navigate('/search')} className="btn btn-outline btn-sm">
            View All Corridors <ChevronRight size={14} />
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Corridor</th>
                  <th>Coach Category</th>
                  <th>Journey Duration</th>
                  <th>Starting Fare</th>
                  <th style={{ textAlign: 'right' }}>Direct Booking</th>
                </tr>
              </thead>
              <tbody>
                {POPULAR_ROUTES.map((r, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Compass size={16} />
                        </div>
                        <div>
                          <strong style={{ color: '#ffffff', fontSize: '0.96rem' }}>{r.source} → {r.destination}</strong>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Intercity Highway Express</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-indigo">{r.coach}</span>
                    </td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--cyan)' }} /> {r.time}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald)' }}>
                        {r.fare}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => selectQuickRoute(r.source, r.destination)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                      >
                        Book Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. SIX CORE PILLARS MATRIX (WHY DISCERNING TRAVELERS CHOOSE US)       */}
      {/* ==================================================================== */}
      <section style={{ padding: '3rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-amber" style={{ marginBottom: '0.4rem' }}>Engineered For Excellence</span>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Why Discerning Travelers Choose SkyBus Luxe</h2>
          <p style={{ color: 'var(--text-muted)' }}>Advanced technology and white-glove hospitality combined.</p>
        </div>

        <div className="features-grid-3">
          
          <div className="feature-box-luxe">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Live Interactive Deck Selection</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Visual seat maps displaying real-time availability for both upper and lower sleeper decks. Pick window or aisle berths with instant seat lock.
            </p>
          </div>

          <div className="feature-box-luxe">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Zero Double-Booking Guarantee</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Our Spring Boot and MySQL transactional isolation guarantees that no two travelers can ever book the same seat at the same time.
            </p>
          </div>

          <div className="feature-box-luxe">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Wifi size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>High-Speed Starlink Wi-Fi</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Complimentary gigabit satellite internet lets you stream HD movies, attend video conferences, or work uninterrupted throughout your journey.
            </p>
          </div>

          <div className="feature-box-luxe">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Instant QR Boarding Passes</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              No printed paper tickets needed. Walk straight to your assigned coach, flash your smartphone QR pass, and settle into your suite.
            </p>
          </div>

          <div className="feature-box-luxe">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <PhoneCall size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>24/7 Verified Pilots & SOS</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Dual background-checked senior drivers on every express route with dedicated rest shifts and 24/7 live telemetry speed supervision.
            </p>
          </div>

          <div className="feature-box-luxe">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ArrowRightLeft size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>1-Click Instant Refunds</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Travel plans change. Enjoy zero-hassle self-service cancellation with immediate seat liberation and automated banking refunds.
            </p>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. VERIFIED PASSENGER TESTIMONIALS                                  */}
      {/* ==================================================================== */}
      <section style={{ padding: '3rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '0.4rem' }}>Verified Reviews</span>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Loved by 12,000+ Frequent Travelers</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real feedback from corporate commuters and weekend vacationers.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem', color: 'var(--amber)' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="var(--amber)" />)}
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              "The Volvo 9600 sleeper berth between Salem and Chennai was quieter and cleaner than most 4-star hotels. The Wi-Fi stayed solid the entire night. Will never fly this route again."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                K
              </div>
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Karthik Ramanathan</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Frequent Salem → Chennai Commuter</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem', color: 'var(--amber)' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="var(--amber)" />)}
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              "Selecting my private upper sleeper deck on the web app took literally 30 seconds. Punctual departure right on the dot and zero double-booking issues. Super impressive UX."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                P
              </div>
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Pooja Sharma</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tech Consultant • Bangalore → Chennai</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem', color: 'var(--amber)' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="var(--amber)" />)}
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              "The individual 45W Type-C fast charger kept my MacBook powered throughout the Delhi to Jaipur trip. The memory foam berth is truly first-class comfort."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                A
              </div>
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Aditya Verma</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Business Traveler • Delhi → Jaipur</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)                       */}
      {/* ==================================================================== */}
      <section style={{ padding: '3rem 0', maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            <HelpCircle size={14} /> Clear & Transparent
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--text-muted)' }}>Everything you need to know about booking with SkyBus Luxe.</p>
        </div>

        <div>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="faq-accordion-item">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="faq-question-btn"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} style={{ color: 'var(--primary-light)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-dim)' }} />}
                </button>
                {isOpen && (
                  <div className="faq-answer-panel">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. MASTER BOTTOM CALL TO ACTION                                      */}
      {/* ==================================================================== */}
      <section 
        className="glass-panel" 
        style={{ 
          padding: '3.5rem 2.5rem', 
          margin: '2rem 0 4rem', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 20px 60px -10px var(--primary-glow)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '650px', margin: '0 auto' }}>
          <div className="badge badge-amber" style={{ marginBottom: '1rem' }}>Instant Seat Lock Ready</div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready for First-Class Highway Travel?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Reserve your private sleeper berth or executive luxury seat in seconds. Real-time availability from our live database.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => navigate('/search')} 
              className="btn btn-primary btn-lg"
              style={{ gap: '8px' }}
            >
              <Search size={18} /> Search Available Departures
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              className="btn btn-outline btn-lg"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
