import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import BusCard from '../components/BusCard';
import { Search, MapPin, Calendar, ArrowRightLeft, SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { getTodayDateString, formatFullDateWithDay, formatShortDateWithDay, isPastDate } from '../utils/dateUtils';

const SearchBuses: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [source, setSource] = useState(queryParams.get('source') || '');
  const [destination, setDestination] = useState(queryParams.get('destination') || '');
  const [date, setDate] = useState(queryParams.get('date') || getTodayDateString());
  const [busTypeFilter, setBusTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBuses = async (src = source, dst = destination, dt = date) => {
    if (isPastDate(dt)) {
      setError('Bookings are not available for past dates or years. Please choose today or a future departure date.');
      setBuses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/buses/search', {
        params: { source: src, destination: dst, date: dt }
      });
      setBuses(res.data);
    } catch (err: any) {
      console.error('Failed to search buses', err);
      setError(err.response?.data?.message || 'Failed to load buses from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const s = queryParams.get('source') || '';
    const d = queryParams.get('destination') || '';
    let dt = queryParams.get('date') || getTodayDateString();
    if (isPastDate(dt)) {
      dt = getTodayDateString();
    }
    setSource(s);
    setDestination(d);
    setDate(dt);
    fetchBuses(s, d, dt);
  }, [location.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPastDate(date)) {
      setError('Bookings are strictly prohibited for past dates or years. Please choose today or a future date.');
      setDate(getTodayDateString());
      return;
    }
    setError('');
    fetchBuses(source, destination, date);
  };

  const handleSwap = () => {
    setError('');
    setSource(destination);
    setDestination(source);
  };

  const selectQuickRoute = (src: string, dst: string) => {
    setError('');
    setSource(src);
    setDestination(dst);
    fetchBuses(src, dst, date);
  };

  const filteredBuses = buses.filter(bus => {
    if (busTypeFilter === 'ALL') return true;
    const type = (bus.busType || bus.type || '').toUpperCase();
    return type.includes(busTypeFilter);
  }).sort((a, b) => {
    if (sortBy === 'PRICE_LOW') return (a.fare || 0) - (b.fare || 0);
    if (sortBy === 'PRICE_HIGH') return (b.fare || 0) - (a.fare || 0);
    return 0;
  });

  return (
    <div>
      {/* Top Filter and Search Bar */}
      <div className="search-widget" style={{ marginBottom: '2.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <label><MapPin size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--cyan)' }} /> Origin</label>
            <input
              type="text"
              placeholder="e.g. Salem, Bangalore, Delhi"
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                if (error) setError('');
              }}
              className="input-field"
              list="search-origin-cities"
            />
            <datalist id="search-origin-cities">
              <option value="Salem" />
              <option value="Bangalore" />
              <option value="Chennai" />
              <option value="Delhi" />
              <option value="Mumbai" />
              <option value="Hyderabad" />
              <option value="Pune" />
            </datalist>
          </div>

          <button type="button" onClick={handleSwap} className="swap-btn" title="Swap Source & Destination">
            <ArrowRightLeft size={16} />
          </button>

          <div className="form-group" style={{ margin: 0 }}>
            <label><MapPin size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-light)' }} /> Destination</label>
            <input
              type="text"
              placeholder="e.g. Chennai, Bangalore, Jaipur"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (error) setError('');
              }}
              className="input-field"
              list="search-dest-cities"
            />
            <datalist id="search-dest-cities">
              <option value="Chennai" />
              <option value="Bangalore" />
              <option value="Jaipur" />
              <option value="Pune" />
              <option value="Salem" />
              <option value="Delhi" />
            </datalist>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label><Calendar size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--amber)' }} /> Journey Date</label>
              <span style={{ fontSize: '0.72rem', color: 'var(--amber)', fontWeight: 700 }}>
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
                  setError('Bookings are strictly prohibited for past dates or years. Please choose today or a future date.');
                  setDate(getTodayDateString());
                  return;
                }
                setError('');
                setDate(val);
              }}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ height: '48px' }}>
            <Search size={18} /> Search
          </button>
        </form>

        {/* Quick Popular Routes */}
        <div className="city-chips" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.8rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Quick Routes:</span>
          <button type="button" onClick={() => selectQuickRoute('Salem', 'Chennai')} className="city-chip">
            Salem → Chennai
          </button>
          <button type="button" onClick={() => selectQuickRoute('Salem', 'Bangalore')} className="city-chip">
            Salem → Bangalore
          </button>
          <button type="button" onClick={() => selectQuickRoute('Bangalore', 'Chennai')} className="city-chip">
            Bangalore → Chennai
          </button>
          <button type="button" onClick={() => selectQuickRoute('Delhi', 'Jaipur')} className="city-chip">
            Delhi → Jaipur
          </button>
          <button type="button" onClick={() => selectQuickRoute('Mumbai', 'Pune')} className="city-chip">
            Mumbai → Pune
          </button>
        </div>
      </div>

      {/* Filter Options Strip */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.75rem',
        padding: '0.8rem 1.2rem',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SlidersHorizontal size={14} /> Filter Coach:
          </span>
          {['ALL', 'SLEEPER', 'SEATER'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setBusTypeFilter(type)}
              className={`btn btn-sm ${busTypeFilter === type ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {type === 'ALL' ? 'All Coaches' : type === 'SLEEPER' ? 'AC Sleeper' : 'AC Seater'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="DEFAULT">Recommended</option>
            <option value="PRICE_LOW">Price: Low to High</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div
          className="card"
          style={{
            borderColor: 'var(--rose)',
            background: 'rgba(244, 63, 94, 0.1)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
            <AlertCircle size={20} style={{ color: 'var(--rose)', flexShrink: 0 }} />
            <span style={{ color: '#ffffff', fontSize: '0.92rem' }}>{error}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => fetchBuses(source, destination, date)}
              className="btn btn-sm"
              style={{
                background: 'var(--rose)',
                color: '#ffffff',
                border: 'none',
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Retry
            </button>
            <button
              type="button"
              onClick={() => setError('')}
              className="btn btn-sm btn-ghost"
              style={{
                color: 'var(--text-muted)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
            Available Departures <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 500 }}>({filteredBuses.length} buses found)</span>
          </h2>
          <div style={{ fontSize: '0.86rem', color: 'var(--cyan)', fontWeight: 600, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> Scheduled Date: <strong style={{ color: '#ffffff' }}>{formatFullDateWithDay(date)}</strong>
          </div>
        </div>
        <button
          onClick={() => fetchBuses(source, destination, date)}
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="float-anim" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <div style={{ width: '50px', height: '50px', border: '3px solid var(--primary-glow)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Searching live departures in MySQL database...</p>
        </div>
      ) : filteredBuses.length > 0 ? (
        <div>
          {filteredBuses.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
            <Search size={28} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No buses found for this route</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', color: 'var(--text-dim)' }}>
            We could not find any scheduled trips matching your criteria. Try searching without city filters to explore all available trips in the database.
          </p>
          <button
            onClick={() => {
              setSource('');
              setDestination('');
              fetchBuses('', '', date);
            }}
            className="btn btn-primary"
          >
            View All Available Trips
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBuses;
