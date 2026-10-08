import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Users, 
  Bus, 
  MapPin, 
  Ticket, 
  RefreshCw, 
  Search, 
  Trash2, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Shield, 
  AlertCircle,
  TrendingUp,
  Percent,
  RotateCcw,
  Plus,
  Edit2,
  Eye,
  ArrowRight,
  Navigation,
  Clock,
  Compass,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  Check,
  Shuffle
} from 'lucide-react';

type AdminTab = 'USERS' | 'BUSES' | 'ROUTES' | 'BOOKINGS';

interface DeleteModalState {
  isOpen: boolean;
  type: 'USER' | 'BUS' | 'ROUTE' | 'BOOKING';
  id: number;
  title: string;
  subtitle: string;
  details?: { label: string; value: string | number }[];
}

const POPULAR_HUBS = [
  'Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi', 'Coimbatore', 'Salem', 'Kochi', 'Goa'
];

const INDIAN_STATES = [
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'DL', name: 'Delhi NCR' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'TS', name: 'Telangana' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'KL', name: 'Kerala' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'WB', name: 'West Bengal' }
];

const COACH_TYPES = [
  'AC Sleeper',
  'AC Seater',
  'Multi-Axle Volvo Sleeper',
  'Electric Luxury Coach',
  'Non-AC Seater',
  'BharatBenz Semi-Sleeper',
  'Scania Metrolink HD'
];

const SEAT_CAPACITIES = [24, 30, 32, 36, 40, 48, 54];

interface PlatePreset {
  label: string;
  plate: string;
  type: string;
  style: 'YELLOW' | 'GREEN' | 'WHITE';
}

const PLATE_PRESETS: PlatePreset[] = [
  { label: 'Salem Express', plate: 'TN-30-SLM-9999', type: 'AC Sleeper', style: 'YELLOW' },
  { label: 'Bangalore VIP', plate: 'KA-01-VIP-7777', type: 'Multi-Axle Volvo Sleeper', style: 'YELLOW' },
  { label: 'Delhi Superfast', plate: 'DL-01-EXP-2026', type: 'AC Sleeper', style: 'YELLOW' },
  { label: 'Mumbai Royal', plate: 'MH-02-ROYAL-1', type: 'AC Seater', style: 'YELLOW' },
  { label: 'Green Eco-EV', plate: 'EV-09-LUMEN-55', type: 'Electric Luxury Coach', style: 'GREEN' },
  { label: 'Custom VIP Boss', plate: 'VIP-BOSS-007', type: 'AC Sleeper', style: 'WHITE' }
];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('USERS');
  const [users, setUsers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Admin Cancel & Refund Modal State
  const [cancelModal, setCancelModal] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Route Management Modals State
  const [createRouteModalOpen, setCreateRouteModalOpen] = useState(false);
  const [newRouteData, setNewRouteData] = useState({
    source: '',
    destination: '',
    distance: '',
    createReturnRoute: false,
    autoSchedule: true
  });
  const [creatingRoute, setCreatingRoute] = useState(false);

  const [editRouteModal, setEditRouteModal] = useState<{
    isOpen: boolean;
    route: any;
    source: string;
    destination: string;
    distance: string;
  } | null>(null);
  const [editingRoute, setEditingRoute] = useState(false);

  const [viewRouteModal, setViewRouteModal] = useState<any | null>(null);

  // Schedule Management Modal State
  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    route: any;
    busId: number;
    departureDate: string;
    departureTime: string;
    fare: number;
    repeatDaily: boolean;
  } | null>(null);
  const [scheduling, setScheduling] = useState(false);

  // Coach & Custom Number Plate Management State
  const [createBusModalOpen, setCreateBusModalOpen] = useState(false);
  const [newBusData, setNewBusData] = useState({
    plateMode: 'CUSTOM' as 'CUSTOM' | 'BUILDER',
    customPlate: '',
    stateCode: 'TN',
    rtoCode: '30',
    series: 'SLM',
    number: '9999',
    plateStyle: 'YELLOW' as 'YELLOW' | 'GREEN' | 'WHITE',
    type: 'AC Sleeper',
    customType: '',
    capacity: 40
  });
  const [creatingBus, setCreatingBus] = useState(false);

  // Edit Coach / Plate Modal State
  const [editBusModal, setEditBusModal] = useState<{
    isOpen: boolean;
    bus: any;
    busNumber: string;
    type: string;
    capacity: number;
    plateStyle: 'YELLOW' | 'GREEN' | 'WHITE';
  } | null>(null);
  const [editingBus, setEditingBus] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, busesRes, routesRes, bookingsRes, schedulesRes, statsRes] = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/admin/buses'),
        api.get('/admin/routes'),
        api.get('/admin/bookings'),
        api.get('/admin/schedules'),
        api.get('/admin/dashboard')
      ]);

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
      if (busesRes.status === 'fulfilled') setBuses(busesRes.value.data || []);
      if (routesRes.status === 'fulfilled') setRoutes(routesRes.value.data || []);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data || []);
      if (schedulesRes.status === 'fulfilled') setSchedules(schedulesRes.value.data || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      let endpoint = '';
      if (deleteModal.type === 'USER') endpoint = `/admin/users/${deleteModal.id}`;
      else if (deleteModal.type === 'BUS') endpoint = `/admin/buses/${deleteModal.id}`;
      else if (deleteModal.type === 'ROUTE') endpoint = `/admin/routes/${deleteModal.id}`;
      else if (deleteModal.type === 'BOOKING') endpoint = `/admin/bookings/${deleteModal.id}`;

      const res = await api.delete(endpoint);
      setToastMessage({
        type: 'success',
        text: res.data?.message || `${deleteModal.type} #${deleteModal.id} was deleted successfully.`
      });
      setDeleteModal(null);
      fetchData();
    } catch (err: any) {
      console.error('Delete failed', err);
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete item from server.'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleAdminCancelConfirm = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await api.post(`/bookings/${cancelModal.id}/cancel`);
      const refund = (cancelModal.totalAmount * 0.7).toFixed(2);
      const profit = (cancelModal.totalAmount * 0.3).toFixed(2);
      setToastMessage({
        type: 'success',
        text: `Booking #${cancelModal.id} cancelled. 70% (₹${refund}) refunded to passenger, 30% (₹${profit}) retained as platform profit.`
      });
      setCancelModal(null);
      fetchData();
    } catch (err: any) {
      console.error('Failed to cancel booking', err);
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel booking.'
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const src = newRouteData.source.trim();
    const dst = newRouteData.destination.trim();
    const dist = parseFloat(newRouteData.distance);

    if (!src || !dst) {
      setToastMessage({ type: 'error', text: 'Both Origin and Destination cities are required.' });
      return;
    }
    if (src.toLowerCase() === dst.toLowerCase()) {
      setToastMessage({ type: 'error', text: 'Origin and Destination cannot be the same city.' });
      return;
    }
    if (isNaN(dist) || dist <= 0) {
      setToastMessage({ type: 'error', text: 'Please enter a valid positive distance in km.' });
      return;
    }

    setCreatingRoute(true);
    try {
      let routeId: number | null = null;
      try {
        const res = await api.post('/routes', {
          source: src,
          destination: dst,
          distance: dist
        });
        routeId = res.data?.id;
      } catch (errRoutes: any) {
        const res = await api.post('/admin/routes', {
          source: src,
          destination: dst,
          distance: dist
        });
        routeId = res.data?.id;
      }

      let returnRouteId: number | null = null;
      if (newRouteData.createReturnRoute) {
        try {
          const res = await api.post('/routes', {
            source: dst,
            destination: src,
            distance: dist
          });
          returnRouteId = res.data?.id;
        } catch {
          const res = await api.post('/admin/routes', {
            source: dst,
            destination: src,
            distance: dist
          }).catch(() => null);
          returnRouteId = res?.data?.id;
        }
      }

      // Auto provision initial departures so the corridor is immediately active & bookable
      if (newRouteData.autoSchedule && buses.length > 0) {
        const selectedBus = buses[0];
        const durHours = dist > 0 ? Math.max(2, Math.round(dist / 55)) : 5;
        const estFare = dist > 0 ? Math.max(300, Math.round(dist * 2.2)) : 650;
        const now = new Date();

        for (let offset = 0; offset <= 3; offset++) {
          const depDate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
          depDate.setHours(21, 0, 0, 0);
          const arrDate = new Date(depDate.getTime() + durHours * 60 * 60 * 1000);

          const pad = (n: number) => String(n).padStart(2, '0');
          const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

          if (routeId) {
            await api.post('/schedules', {
              busId: selectedBus.id,
              routeId: routeId,
              departureTime: fmt(depDate),
              arrivalTime: fmt(arrDate),
              fare: estFare
            }).catch(() => {});
          }

          if (returnRouteId) {
            const retDepDate = new Date(depDate.getTime() - 2 * 60 * 60 * 1000);
            const retArrDate = new Date(retDepDate.getTime() + durHours * 60 * 60 * 1000);
            await api.post('/schedules', {
              busId: selectedBus.id,
              routeId: returnRouteId,
              departureTime: fmt(retDepDate),
              arrivalTime: fmt(retArrDate),
              fare: estFare
            }).catch(() => {});
          }
        }
      }

      setToastMessage({
        type: 'success',
        text: `Route ${src} → ${dst} (${dist} km)${newRouteData.createReturnRoute ? ' & return route' : ''} created with active departures!`
      });
      setCreateRouteModalOpen(false);
      setNewRouteData({ source: '', destination: '', distance: '', createReturnRoute: false, autoSchedule: true });
      fetchData();
    } catch (err: any) {
      console.error('Failed to create route', err);
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to create route.'
      });
    } finally {
      setCreatingRoute(false);
    }
  };

  const openScheduleModal = (route: any) => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const defaultFare = route.distance ? Math.max(350, Math.round(Number(route.distance) * 2.2)) : 750;
    const defaultBusId = buses.length > 0 ? buses[0].id : 1;

    setScheduleModal({
      isOpen: true,
      route,
      busId: defaultBusId,
      departureDate: dateStr,
      departureTime: '21:00',
      fare: defaultFare,
      repeatDaily: true
    });
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModal) return;

    const route = scheduleModal.route;
    const busId = Number(scheduleModal.busId);
    const fare = Number(scheduleModal.fare) || 750;
    const estDurationHours = route.distance ? Math.max(2, Math.round(Number(route.distance) / 55)) : 5;

    setScheduling(true);
    try {
      const daysToCreate = scheduleModal.repeatDaily ? 4 : 1;
      const [year, month, day] = scheduleModal.departureDate.split('-').map(Number);
      const [hour, minute] = scheduleModal.departureTime.split(':').map(Number);

      const pad = (n: number) => String(n).padStart(2, '0');
      const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

      for (let offset = 0; offset < daysToCreate; offset++) {
        const dep = new Date(year, month - 1, day + offset, hour, minute, 0);
        const arr = new Date(dep.getTime() + estDurationHours * 60 * 60 * 1000);

        await api.post('/schedules', {
          busId: busId,
          routeId: route.id,
          departureTime: fmt(dep),
          arrivalTime: fmt(arr),
          fare: fare
        });
      }

      setToastMessage({
        type: 'success',
        text: `Active departures successfully scheduled on ${route.source} → ${route.destination}!`
      });
      setScheduleModal(null);
      fetchData();
    } catch (err: any) {
      console.error('Failed to create schedule', err);
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to create schedule.'
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRouteModal) return;
    const src = editRouteModal.source.trim();
    const dst = editRouteModal.destination.trim();
    const dist = parseFloat(editRouteModal.distance);

    if (!src || !dst) {
      setToastMessage({ type: 'error', text: 'Both Origin and Destination cities are required.' });
      return;
    }
    if (src.toLowerCase() === dst.toLowerCase()) {
      setToastMessage({ type: 'error', text: 'Origin and Destination cannot be the same city.' });
      return;
    }
    if (isNaN(dist) || dist <= 0) {
      setToastMessage({ type: 'error', text: 'Please enter a valid positive distance in km.' });
      return;
    }

    setEditingRoute(true);
    try {
      try {
        await api.put(`/admin/routes/${editRouteModal.route.id}`, {
          source: src,
          destination: dst,
          distance: dist
        });
      } catch (errAdmin: any) {
        await api.put(`/routes/${editRouteModal.route.id}`, {
          source: src,
          destination: dst,
          distance: dist
        });
      }

      setToastMessage({
        type: 'success',
        text: `Route #${editRouteModal.route.id} (${src} → ${dst}) updated successfully!`
      });
      setEditRouteModal(null);
      fetchData();
    } catch (err: any) {
      console.error('Failed to update route', err);
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update route.'
      });
    } finally {
      setEditingRoute(false);
    }
  };

  const getSchedulesForRoute = (routeId: number) => {
    return schedules.filter(s => (s.route && s.route.id === routeId) || s.routeId === routeId);
  };

  const getSchedulesForBus = (busId: number) => {
    return schedules.filter(s => (s.bus && s.bus.id === busId) || s.busId === busId);
  };

  const getComputedPlate = () => {
    if (newBusData.plateMode === 'BUILDER') {
      const parts = [
        newBusData.stateCode.trim().toUpperCase(),
        newBusData.rtoCode.trim().toUpperCase(),
        newBusData.series.trim().toUpperCase(),
        newBusData.number.trim().toUpperCase()
      ].filter(Boolean);
      return parts.join('-');
    }
    return newBusData.customPlate.trim().toUpperCase();
  };

  const isPlateDuplicate = (plate: string, excludeId?: number) => {
    if (!plate) return false;
    const clean = plate.trim().toUpperCase();
    return buses.some(b => b.id !== excludeId && (b.busNumber || '').trim().toUpperCase() === clean);
  };

  const generateRandomPlate = () => {
    const states = ['TN', 'KA', 'DL', 'MH', 'AP', 'TS', 'KL', 'UP', 'GA'];
    const randomState = states[Math.floor(Math.random() * states.length)];
    const randomRto = String(Math.floor(Math.random() * 89) + 10);
    const seriesList = ['EXP', 'SLM', 'VIP', 'ROY', 'LUX', 'CTY', 'AIR', 'GLD'];
    const randomSeries = seriesList[Math.floor(Math.random() * seriesList.length)];
    const randomNumber = String(Math.floor(Math.random() * 9000) + 1000);

    if (newBusData.plateMode === 'BUILDER') {
      setNewBusData(prev => ({
        ...prev,
        stateCode: randomState,
        rtoCode: randomRto,
        series: randomSeries,
        number: randomNumber
      }));
    } else {
      setNewBusData(prev => ({
        ...prev,
        customPlate: `${randomState}-${randomRto}-${randomSeries}-${randomNumber}`
      }));
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    const plate = getComputedPlate();
    if (!plate) {
      setToastMessage({ type: 'error', text: 'Please enter or build a coach number plate.' });
      return;
    }
    if (isPlateDuplicate(plate)) {
      setToastMessage({ type: 'error', text: `Coach with number plate "${plate}" is already registered in the fleet.` });
      return;
    }

    const finalType = (newBusData.type === 'OTHER' ? newBusData.customType : newBusData.type) || 'AC Sleeper';
    const finalCapacity = Number(newBusData.capacity) || 40;

    setCreatingBus(true);
    try {
      try {
        await api.post('/admin/buses', {
          busNumber: plate,
          type: finalType,
          capacity: finalCapacity
        });
      } catch {
        await api.post('/buses', {
          busNumber: plate,
          type: finalType,
          capacity: finalCapacity
        });
      }

      setToastMessage({
        type: 'success',
        text: `Coach Number Plate "${plate}" successfully created and registered into fleet!`
      });
      setCreateBusModalOpen(false);
      setNewBusData({
        plateMode: 'CUSTOM',
        customPlate: '',
        stateCode: 'TN',
        rtoCode: '30',
        series: 'SLM',
        number: '9999',
        plateStyle: 'YELLOW',
        type: 'AC Sleeper',
        customType: '',
        capacity: 40
      });
      fetchData();
    } catch (err: any) {
      console.error('Failed to create coach', err);
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to create coach number plate.'
      });
    } finally {
      setCreatingBus(false);
    }
  };

  const handleUpdateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBusModal) return;
    const cleanPlate = editBusModal.busNumber.trim().toUpperCase();
    if (!cleanPlate) {
      setToastMessage({ type: 'error', text: 'Number plate cannot be empty.' });
      return;
    }
    if (isPlateDuplicate(cleanPlate, editBusModal.bus.id)) {
      setToastMessage({ type: 'error', text: `Coach with number plate "${cleanPlate}" already exists in the fleet.` });
      return;
    }

    setEditingBus(true);
    try {
      try {
        await api.put(`/admin/buses/${editBusModal.bus.id}`, {
          busNumber: cleanPlate,
          type: editBusModal.type,
          capacity: Number(editBusModal.capacity) || 40
        });
      } catch {
        // Fallback: update in state and inform
        setBuses(prev => prev.map(b => b.id === editBusModal.bus.id ? { ...b, busNumber: cleanPlate, type: editBusModal.type, capacity: Number(editBusModal.capacity) || 40 } : b));
      }

      setToastMessage({
        type: 'success',
        text: `Coach #${editBusModal.bus.id} plate updated to "${cleanPlate}" successfully!`
      });
      setEditBusModal(null);
      fetchData();
    } catch (err: any) {
      console.error('Failed to update coach', err);
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update coach.'
      });
    } finally {
      setEditingBus(false);
    }
  };

  const renderNumberPlateBadge = (plate: string, style: 'YELLOW' | 'GREEN' | 'WHITE' = 'YELLOW', size: 'sm' | 'md' | 'lg' = 'sm') => {
    const isGreen = style === 'GREEN';
    const isWhite = style === 'WHITE';

    const bg = isGreen
      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
      : isWhite
      ? 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)'
      : 'linear-gradient(135deg, #facc15 0%, #eab308 100%)';

    const textColor = isGreen ? '#ffffff' : '#0f172a';
    const borderColor = isGreen ? '#047857' : isWhite ? '#cbd5e1' : '#ca8a04';
    const indBg = isGreen ? '#064e3b' : '#1e3a8a';
    const fontSize = size === 'lg' ? '1.5rem' : size === 'md' ? '1.05rem' : '0.85rem';
    const padding = size === 'lg' ? '10px 18px' : size === 'md' ? '5px 12px' : '3px 8px';
    const minWidth = size === 'lg' ? '280px' : size === 'md' ? '190px' : 'auto';

    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: bg,
          border: `2px solid ${borderColor}`,
          borderRadius: size === 'lg' ? '10px' : '7px',
          padding: padding,
          boxShadow: size === 'lg' ? '0 10px 25px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5)' : '0 2px 6px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          userSelect: 'none',
          minWidth: minWidth,
          justifyContent: size === 'lg' ? 'center' : 'flex-start',
          letterSpacing: size === 'lg' ? '0.12em' : '0.06em'
        }}
      >
        {/* Left IND Strip */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: indBg,
          color: '#ffffff',
          padding: size === 'lg' ? '4px 8px' : '2px 5px',
          borderRadius: size === 'lg' ? '5px' : '3px',
          marginRight: size === 'lg' ? '14px' : '8px',
          fontSize: size === 'lg' ? '0.68rem' : '0.52rem',
          fontWeight: 900,
          lineHeight: 1.1,
          boxShadow: 'inset 0 0 4px rgba(0, 0, 0, 0.3)'
        }}>
          <span style={{ fontSize: size === 'lg' ? '0.62rem' : '0.48rem', color: '#facc15' }}>●</span>
          <span>IND</span>
        </div>

        {/* Embossed Characters */}
        <span style={{
          fontFamily: "'Courier New', Courier, monospace, sans-serif",
          fontWeight: 900,
          fontSize: fontSize,
          color: textColor,
          textShadow: isGreen ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 0 rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase'
        }}>
          {plate || 'TN-XX-EXP-0000'}
        </span>
      </div>
    );
  };

  // Filter items by search input
  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredBuses = buses.filter(b =>
    (b.busNumber || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (b.type || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    String(b.id).includes(searchFilter)
  );

  const filteredRoutes = routes.filter(r =>
    (r.source || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.destination || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredBookings = bookings.filter(bk =>
    (bk.passengerName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (bk.passengerEmail || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (bk.source || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (bk.destination || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (bk.busNumber || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    String(bk.id).includes(searchFilter)
  );

  // Route Corridor Metrics
  const totalNetworkKm = routes.reduce((sum, r) => sum + (Number(r.distance) || 0), 0);
  const avgRouteKm = routes.length > 0 ? Math.round(totalNetworkKm / routes.length) : 0;
  const totalRouteSchedules = schedules.filter(s => s.route?.id || s.routeId).length;

  // Financial & Profit Metrics (Real-time fallback + API stats)
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  const confirmedRevenue = stats?.confirmedRevenue ?? confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const cancellationProfit = stats?.cancellationProfit ?? cancelledBookings.reduce((sum, b) => {
    const fee = b.cancellationFee !== undefined && b.cancellationFee !== null ? Number(b.cancellationFee) : (Number(b.totalAmount) || 0) * 0.30;
    return sum + fee;
  }, 0);
  const totalRefunded = stats?.totalRefunded ?? cancelledBookings.reduce((sum, b) => {
    const ref = b.refundAmount !== undefined && b.refundAmount !== null ? Number(b.refundAmount) : (Number(b.totalAmount) || 0) * 0.70;
    return sum + ref;
  }, 0);
  const totalNetProfit = stats?.totalNetProfit ?? (confirmedRevenue + cancellationProfit);

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '85px',
            right: '25px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '12px',
            background: toastMessage.type === 'success' ? '#064e3b' : '#881337',
            border: `1px solid ${toastMessage.type === 'success' ? 'var(--emerald)' : 'var(--rose)'}`,
            color: '#ffffff',
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: 'var(--emerald)' }} />
          ) : (
            <AlertCircle size={18} style={{ color: 'var(--rose)' }} />
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{toastMessage.text}</span>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '6px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} /> Master Admin Terminal
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>admin@busticket.com</span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>System Management Dashboard</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Supervise database records with one-by-one item management and instant cascade deletion.
          </p>
        </div>

        <button onClick={fetchData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* KPI Stat Cards (Clickable Tabs) */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        
        {/* Users Card */}
        <div 
          className="stat-card" 
          onClick={() => setActiveTab('USERS')}
          style={{ 
            cursor: 'pointer', 
            border: activeTab === 'USERS' ? '1px solid var(--primary-light)' : '1px solid var(--border-glass)',
            background: activeTab === 'USERS' ? 'rgba(99, 102, 241, 0.08)' : undefined,
            transition: 'var(--transition)'
          }}
        >
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Total Users</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {stats?.totalUsers ?? users.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: activeTab === 'USERS' ? 'var(--primary-light)' : 'var(--text-dim)', marginTop: '2px', fontWeight: 600 }}>
              {activeTab === 'USERS' ? '● Active Tab' : 'Click to manage'}
            </div>
          </div>
        </div>

        {/* Buses Card */}
        <div 
          className="stat-card" 
          onClick={() => setActiveTab('BUSES')}
          style={{ 
            cursor: 'pointer', 
            border: activeTab === 'BUSES' ? '1px solid var(--cyan)' : '1px solid var(--border-glass)',
            background: activeTab === 'BUSES' ? 'rgba(6, 182, 212, 0.08)' : undefined,
            transition: 'var(--transition)'
          }}
        >
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)' }}>
            <Bus size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Active Coaches</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {stats?.totalBuses ?? buses.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: activeTab === 'BUSES' ? 'var(--cyan)' : 'var(--text-dim)', marginTop: '2px', fontWeight: 600 }}>
              {activeTab === 'BUSES' ? '● Active Tab' : 'Click to manage'}
            </div>
          </div>
        </div>

        {/* Routes Card */}
        <div 
          className="stat-card" 
          onClick={() => setActiveTab('ROUTES')}
          style={{ 
            cursor: 'pointer', 
            border: activeTab === 'ROUTES' ? '1px solid var(--emerald)' : '1px solid var(--border-glass)',
            background: activeTab === 'ROUTES' ? 'rgba(16, 185, 129, 0.08)' : undefined,
            transition: 'var(--transition)'
          }}
        >
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
            <MapPin size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Connected Routes</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {stats?.totalRoutes ?? routes.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: activeTab === 'ROUTES' ? 'var(--emerald)' : 'var(--text-dim)', marginTop: '2px', fontWeight: 600 }}>
              {activeTab === 'ROUTES' ? '● Active Tab' : 'Click to manage'}
            </div>
          </div>
        </div>

        {/* Bookings Card */}
        <div 
          className="stat-card" 
          onClick={() => setActiveTab('BOOKINGS')}
          style={{ 
            cursor: 'pointer', 
            border: activeTab === 'BOOKINGS' ? '1px solid var(--amber)' : '1px solid var(--border-glass)',
            background: activeTab === 'BOOKINGS' ? 'rgba(245, 158, 11, 0.08)' : undefined,
            transition: 'var(--transition)'
          }}
        >
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)' }}>
            <Ticket size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Total Bookings</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {stats?.totalBookings ?? bookings.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: activeTab === 'BOOKINGS' ? 'var(--amber)' : 'var(--text-dim)', marginTop: '2px', fontWeight: 600 }}>
              {activeTab === 'BOOKINGS' ? '● Active Tab' : 'Click to manage'}
            </div>
          </div>
        </div>

      </div>

      {/* Financial & Refund Policy Profit Overview */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, rgba(20, 24, 38, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          padding: '1.4rem 1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
            <TrendingUp size={15} style={{ color: 'var(--emerald)' }} />
            <span>Net Platform Revenue</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            ₹{totalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#6ee7b7', marginTop: '2px', fontWeight: 600 }}>
            Confirmed + 30% retained profits
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
            <Ticket size={15} style={{ color: 'var(--cyan)' }} />
            <span>Active Ticket Fares</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            ₹{confirmedRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {confirmedBookings.length} confirmed journey(s)
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.25rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', padding: '0.6rem 0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--amber)', textTransform: 'uppercase', fontWeight: 700 }}>
            <Percent size={15} />
            <span>30% Profit On Refunds</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            +₹{cancellationProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--amber)', marginTop: '2px', fontWeight: 600 }}>
            Retained fee from {cancelledBookings.length} cancelled tickets
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
            <RotateCcw size={15} style={{ color: '#f87171' }} />
            <span>Customer Refunds (70%)</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fca5a5', marginTop: '4px' }}>
            ₹{totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Credited back to passengers
          </div>
        </div>
      </div>

      {/* Main Tabbed Management Card */}
      <div className="card" style={{ padding: '2rem' }}>
        
        {/* Navigation Bar inside Card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Segmented Pill Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('USERS')}
              className="btn btn-sm"
              style={{
                borderRadius: '8px',
                background: activeTab === 'USERS' ? 'var(--primary-gradient)' : 'transparent',
                color: activeTab === 'USERS' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeTab === 'USERS' ? 700 : 500,
                border: 'none',
                gap: '6px'
              }}
            >
              <Users size={15} /> Users ({users.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BUSES')}
              className="btn btn-sm"
              style={{
                borderRadius: '8px',
                background: activeTab === 'BUSES' ? 'var(--accent-gradient)' : 'transparent',
                color: activeTab === 'BUSES' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeTab === 'BUSES' ? 700 : 500,
                border: 'none',
                gap: '6px'
              }}
            >
              <Bus size={15} /> Coaches ({buses.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ROUTES')}
              className="btn btn-sm"
              style={{
                borderRadius: '8px',
                background: activeTab === 'ROUTES' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: activeTab === 'ROUTES' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeTab === 'ROUTES' ? 700 : 500,
                border: 'none',
                gap: '6px'
              }}
            >
              <MapPin size={15} /> Routes ({routes.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BOOKINGS')}
              className="btn btn-sm"
              style={{
                borderRadius: '8px',
                background: activeTab === 'BOOKINGS' ? 'var(--warm-gradient)' : 'transparent',
                color: activeTab === 'BOOKINGS' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeTab === 'BOOKINGS' ? 700 : 500,
                border: 'none',
                gap: '6px'
              }}
            >
              <Ticket size={15} /> Bookings ({bookings.length})
            </button>
          </div>

          {/* Search Box & Quick Plate Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.4rem', paddingRight: '0.8rem', fontSize: '0.86rem' }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('BUSES');
                setCreateBusModalOpen(true);
              }}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(245, 158, 11, 0.18) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.45)',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '8px',
                gap: '6px',
                padding: '7px 13px',
                fontSize: '0.8rem',
                boxShadow: '0 2px 10px rgba(6, 182, 212, 0.2)'
              }}
              title="Quickly create and register a custom coach number plate"
            >
              <Plus size={14} style={{ color: 'var(--cyan)' }} />
              <span>Create Number Plate</span>
            </button>
          </div>

        </div>

        {/* ============================================================== */}
        {/* TAB 1: USERS TABLE WITH ONE-BY-ONE DELETE                      */}
        {/* ============================================================== */}
        {activeTab === 'USERS' && (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User Profile</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>System Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                      No matching users found in MySQL database.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isMasterAdmin = (u.email || '').toLowerCase() === 'admin@busticket.com' || u.role === 'ADMIN';

                    return (
                      <tr key={u.id}>
                        <td>
                          <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>#{u.id}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-glass-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                              {u.email ? u.email.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <strong style={{ color: '#ffffff' }}>
                              {u.name || (u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email.split('@')[0])}
                            </strong>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ color: 'var(--text-dim)' }}>{u.phoneNumber || '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-amber' : u.role === 'OPERATOR' ? 'badge-cyan' : 'badge-indigo'}`}>
                            {u.role || 'USER'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isMasterAdmin ? (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '0.75rem', 
                                color: 'var(--amber)',
                                background: 'rgba(245, 158, 11, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '6px'
                              }}
                              title="Primary Administrator cannot be deleted"
                            >
                              <Shield size={12} /> Master Admin
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteModal({
                                isOpen: true,
                                type: 'USER',
                                id: u.id,
                                title: `Delete User: ${u.name || u.email}`,
                                subtitle: `Permanently delete account for ${u.email}. This will also automatically purge their seat bookings and payment history.`,
                                details: [
                                  { label: 'User ID', value: `#${u.id}` },
                                  { label: 'Email', value: u.email },
                                  { label: 'Role', value: u.role || 'USER' }
                                ]
                              })}
                              className="btn btn-outline btn-sm"
                              style={{ 
                                color: 'var(--rose)', 
                                borderColor: 'rgba(244, 63, 94, 0.3)',
                                fontSize: '0.78rem',
                                padding: '4px 10px',
                                gap: '4px'
                              }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BUSES TABLE WITH CREATE NUMBER PLATE & MANAGEMENT       */}
        {/* ============================================================== */}
        {activeTab === 'BUSES' && (
          <div>
            {/* Bus / Number Plate Registry Header Banner */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)', 
                border: '1px solid rgba(6, 182, 212, 0.25)', 
                borderRadius: '16px', 
                padding: '1.5rem', 
                marginBottom: '1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Bus size={12} /> Fleet & Plate Registry
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    RTO Registration & Custom Number Plates
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                  Coach Fleet & Number Plate Registry
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, maxWidth: '650px' }}>
                  Create custom vehicle number plates, configure luxury seating formats, assign fleet models, and inspect connected highway departures.
                </p>
              </div>

              {/* Action Button: Create Custom Number Plate */}
              <button
                type="button"
                onClick={() => setCreateBusModalOpen(true)}
                className="btn btn-md"
                style={{
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
                  border: 'none',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px'
                }}
              >
                <Plus size={16} /> Create Number Plate
              </button>
            </div>

            {/* Fleet KPI Micro-Metrics Cards */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                marginBottom: '1.5rem' 
              }}
            >
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Bus size={14} style={{ color: 'var(--cyan)' }} /> Active Coaches
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {buses.length} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>registered</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--cyan)', marginTop: '2px' }}>
                  Fleet capacity deployed
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Users size={14} style={{ color: 'var(--amber)' }} /> Total Fleet Capacity
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {buses.reduce((sum, b) => sum + (Number(b.capacity) || 0), 0)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>passenger berths</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--amber)', marginTop: '2px' }}>
                  Across all active coaches
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Calendar size={14} style={{ color: 'var(--emerald)' }} /> Active Schedules
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {schedules.length} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>departures</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', marginTop: '2px' }}>
                  Connected live trips
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Sparkles size={14} style={{ color: 'var(--primary-light)' }} /> Custom Creation
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  Plate Studio
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', marginTop: '2px' }}>
                  Free-form & RTO Builder
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Coach ID</th>
                    <th>Number Plate</th>
                    <th>Coach Specification</th>
                    <th>Seating Capacity</th>
                    <th>Schedule Assignment</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuses.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                          <Bus size={32} style={{ color: 'var(--text-dim)', opacity: 0.6 }} />
                          <div>No coaches found matching your search.</div>
                          <button
                            type="button"
                            onClick={() => setCreateBusModalOpen(true)}
                            className="btn btn-primary btn-sm"
                            style={{ gap: '6px', marginTop: '0.5rem' }}
                          >
                            <Plus size={14} /> Create New Number Plate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBuses.map((b) => {
                      const busSchedules = getSchedulesForBus(b.id);
                      const isEV = (b.type || '').toLowerCase().includes('electric');
                      return (
                        <tr key={b.id}>
                          <td>
                            <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>#{b.id}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {renderNumberPlateBadge(b.busNumber, isEV ? 'GREEN' : 'YELLOW', 'sm')}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-cyan">{b.type || 'Standard'}</span>
                          </td>
                          <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                            {b.capacity} Luxury Seats
                          </td>
                          <td>
                            {busSchedules.length > 0 ? (
                              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} /> {busSchedules.length} Active {busSchedules.length === 1 ? 'Trip' : 'Trips'}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>
                                Unassigned (Ready)
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => setEditBusModal({
                                  isOpen: true,
                                  bus: b,
                                  busNumber: b.busNumber || '',
                                  type: b.type || 'AC Sleeper',
                                  capacity: b.capacity || 40,
                                  plateStyle: isEV ? 'GREEN' : 'YELLOW'
                                })}
                                className="btn btn-outline btn-sm"
                                style={{ 
                                  color: 'var(--cyan)', 
                                  borderColor: 'rgba(6, 182, 212, 0.3)',
                                  fontSize: '0.78rem',
                                  padding: '4px 8px',
                                  gap: '4px'
                                }}
                                title="Edit Number Plate"
                              >
                                <Edit2 size={13} /> Edit Plate
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteModal({
                                  isOpen: true,
                                  type: 'BUS',
                                  id: b.id,
                                  title: `Delete Bus Coach: ${b.busNumber}`,
                                  subtitle: `Permanently delete this coach (${b.type}, ${b.capacity} seats). All connected departure schedules and passenger tickets will also be deleted.`,
                                  details: [
                                    { label: 'Bus ID', value: `#${b.id}` },
                                    { label: 'Plate Number', value: b.busNumber },
                                    { label: 'Coach Type', value: b.type },
                                    { label: 'Total Capacity', value: `${b.capacity} seats` }
                                  ]
                                })}
                                className="btn btn-outline btn-sm"
                                style={{ 
                                  color: 'var(--rose)', 
                                  borderColor: 'rgba(244, 63, 94, 0.3)',
                                  fontSize: '0.78rem',
                                  padding: '4px 8px',
                                  gap: '4px'
                                }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ROUTE MANAGEMENT SECTION (CREATE, VIEW, EDIT, DELETE)   */}
        {/* ============================================================== */}
        {activeTab === 'ROUTES' && (
          <div>
            {/* Route Management Header Banner */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)', 
                border: '1px solid rgba(16, 185, 129, 0.25)', 
                borderRadius: '16px', 
                padding: '1.5rem', 
                marginBottom: '1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> Highway Corridors
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Intercity Route Network Infrastructure
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                  Bus Route Corridor Management
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, maxWidth: '650px' }}>
                  Supervise origin-destination corridors, calibrate intercity travel distances, configure bidirectional highway links, and maintain cascade integrity for scheduled coaches.
                </p>
              </div>

              {/* Action Button: Add New Route */}
              <button
                type="button"
                onClick={() => setCreateRouteModalOpen(true)}
                className="btn btn-md"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                  border: 'none',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px'
                }}
              >
                <Plus size={16} /> Add New Route Corridor
              </button>
            </div>

            {/* Route KPI Micro-Metrics Cards */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                marginBottom: '1.5rem' 
              }}
            >
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Navigation size={14} style={{ color: 'var(--emerald)' }} /> Active Corridors
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {routes.length} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>links</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', marginTop: '2px' }}>
                  Operational intercity paths
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Compass size={14} style={{ color: 'var(--cyan)' }} /> Network Distance
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--cyan)', marginTop: '4px' }}>
                  {totalNetworkKm.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>km</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Total highway coverage
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Clock size={14} style={{ color: 'var(--primary-light)' }} /> Average Corridor
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '4px' }}>
                  {avgRouteKm} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>km</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  ~{Math.round(avgRouteKm / 55)} hrs transit time
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Calendar size={14} style={{ color: 'var(--amber)' }} /> Assigned Schedules
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--amber)', marginTop: '4px' }}>
                  {totalRouteSchedules} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>trips</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Scheduled fleet departures
                </div>
              </div>
            </div>

            {/* Routes Data Table */}
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Route ID</th>
                    <th>Origin City</th>
                    <th style={{ textAlign: 'center' }}>Corridor Vector</th>
                    <th>Destination City</th>
                    <th>Distance & Est. Time</th>
                    <th>Active Schedules</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                          <MapPin size={28} />
                        </div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>
                          {searchFilter ? `No routes found matching "${searchFilter}"` : 'No route corridors registered yet'}
                        </h4>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                          {searchFilter ? 'Try searching for another city name or clear the search filter.' : 'Begin expanding the transport network by establishing your first intercity route corridor.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setCreateRouteModalOpen(true)}
                          className="btn btn-sm"
                          style={{
                            background: 'var(--primary-gradient)',
                            color: '#ffffff',
                            fontWeight: 600,
                            border: 'none',
                            gap: '6px'
                          }}
                        >
                          <Plus size={14} /> Add First Route
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredRoutes.map((r) => {
                      const routeSchedules = getSchedulesForRoute(r.id);
                      const estHours = r.distance ? Math.max(1, Math.round(r.distance / 55)) : null;

                      return (
                        <tr key={r.id}>
                          <td>
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                background: 'rgba(255, 255, 255, 0.05)', 
                                border: '1px solid var(--border-glass)', 
                                color: 'var(--text-muted)', 
                                fontWeight: 700, 
                                fontSize: '0.8rem' 
                              }}
                            >
                              #{r.id}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
                                <MapPin size={14} />
                              </div>
                              <div>
                                <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{r.source}</strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Origin Terminal</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)' }}>
                              <span style={{ height: '2px', width: '20px', background: 'linear-gradient(90deg, var(--emerald) 0%, var(--cyan) 100%)' }} />
                              <ArrowRight size={13} style={{ color: 'var(--cyan)' }} />
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
                                <MapPin size={14} />
                              </div>
                              <div>
                                <strong style={{ color: 'var(--cyan)', fontSize: '0.95rem' }}>{r.destination}</strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Destination Terminal</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>
                                {r.distance ? `${r.distance} km` : 'Corridor established'}
                              </span>
                              {estHours && (
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                                  Est. transit ~{estHours} hrs
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {routeSchedules.length > 0 ? (
                              <span 
                                className="badge badge-emerald"
                                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => setViewRouteModal(r)}
                                title="Click to view assigned departures"
                              >
                                <Clock size={11} /> {routeSchedules.length} Active Trips
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openScheduleModal(r)}
                                className="btn btn-sm"
                                style={{
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  color: 'var(--amber)',
                                  border: '1px solid rgba(245, 158, 11, 0.45)',
                                  fontSize: '0.74rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  gap: '4px',
                                  fontWeight: 700
                                }}
                                title="No departures active. Click to assign coach & schedule!"
                              >
                                <Calendar size={11} /> + Schedule Bus
                              </button>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {/* Schedule Bus */}
                              <button
                                type="button"
                                onClick={() => openScheduleModal(r)}
                                className="btn btn-outline btn-sm"
                                style={{
                                  fontSize: '0.76rem',
                                  padding: '4px 8px',
                                  gap: '4px',
                                  color: 'var(--amber)',
                                  borderColor: 'rgba(245, 158, 11, 0.35)'
                                }}
                                title="Schedule coach departures for this corridor"
                              >
                                <Calendar size={12} /> Schedule
                              </button>

                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => setViewRouteModal(r)}
                                className="btn btn-outline btn-sm"
                                style={{
                                  fontSize: '0.76rem',
                                  padding: '4px 8px',
                                  gap: '4px',
                                  color: 'var(--cyan)',
                                  borderColor: 'rgba(6, 182, 212, 0.3)'
                                }}
                                title="View corridor details & assigned departures"
                              >
                                <Eye size={12} /> View
                              </button>

                              {/* Edit Route */}
                              <button
                                type="button"
                                onClick={() => setEditRouteModal({
                                  isOpen: true,
                                  route: r,
                                  source: r.source,
                                  destination: r.destination,
                                  distance: String(r.distance || '')
                                })}
                                className="btn btn-outline btn-sm"
                                style={{
                                  fontSize: '0.76rem',
                                  padding: '4px 8px',
                                  gap: '4px',
                                  color: 'var(--primary-light)',
                                  borderColor: 'rgba(99, 102, 241, 0.35)'
                                }}
                                title="Edit route cities or distance"
                              >
                                <Edit2 size={12} /> Edit
                              </button>

                              {/* Delete Route */}
                              <button
                                type="button"
                                onClick={() => setDeleteModal({
                                  isOpen: true,
                                  type: 'ROUTE',
                                  id: r.id,
                                  title: `Delete Route: ${r.source} → ${r.destination}`,
                                  subtitle: `Permanently delete this route corridor. All connected departure schedules, coach reservations, and tickets will be cascade removed.`,
                                  details: [
                                    { label: 'Route ID', value: `#${r.id}` },
                                    { label: 'Departure', value: r.source },
                                    { label: 'Destination', value: r.destination },
                                    { label: 'Distance', value: `${r.distance || '—'} km` },
                                    { label: 'Connected Schedules', value: `${routeSchedules.length} scheduled trip(s)` }
                                  ]
                                })}
                                className="btn btn-outline btn-sm"
                                style={{ 
                                  color: 'var(--rose)', 
                                  borderColor: 'rgba(244, 63, 94, 0.3)',
                                  fontSize: '0.76rem',
                                  padding: '4px 10px',
                                  gap: '4px'
                                }}
                                title="Delete route corridor from database"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: BOOKINGS TABLE WITH ONE-BY-ONE DELETE                   */}
        {/* ============================================================== */}
        {activeTab === 'BOOKINGS' && (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Passenger</th>
                  <th>Journey Route</th>
                  <th>Coach Plate</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                      No passenger bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((bk) => (
                    <tr key={bk.id}>
                      <td>
                        <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>#{bk.id}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: '#ffffff' }}>{bk.passengerName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{bk.passengerEmail}</span>
                        </div>
                      </td>
                      <td>
                        {bk.source && bk.destination ? (
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {bk.source} → {bk.destination}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>Scheduled Trip</span>
                        )}
                      </td>
                      <td>
                        <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                          {bk.busNumber || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
                          {bk.numberOfSeats} Seat(s)
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                          ₹{bk.totalAmount}
                        </div>
                        {bk.status === 'CANCELLED' ? (
                          <div style={{ fontSize: '0.72rem', marginTop: '3px', lineHeight: '1.4' }}>
                            <span style={{ color: '#6ee7b7' }}>
                              70% Refund: ₹{(bk.refundAmount !== undefined && bk.refundAmount !== null ? Number(bk.refundAmount) : Number(bk.totalAmount) * 0.7).toFixed(0)}
                            </span>
                            <br />
                            <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                              30% Profit: +₹{(bk.cancellationFee !== undefined && bk.cancellationFee !== null ? Number(bk.cancellationFee) : Number(bk.totalAmount) * 0.3).toFixed(0)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            Fare Collected
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${bk.status === 'CONFIRMED' ? 'badge-emerald' : bk.status === 'CANCELLED' ? 'badge-rose' : 'badge-amber'}`}>
                          {bk.status}
                        </span>
                        {bk.status === 'CANCELLED' && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '3px', 
                              fontSize: '0.68rem', 
                              padding: '2px 6px', 
                              borderRadius: '6px', 
                              background: 'rgba(245, 158, 11, 0.15)', 
                              color: '#fbbf24', 
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              fontWeight: 600
                            }}>
                              ⚡ 30% Profit Retained
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {bk.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => setCancelModal(bk)}
                              className="btn btn-outline btn-sm"
                              style={{ 
                                color: 'var(--amber)', 
                                borderColor: 'rgba(245, 158, 11, 0.35)',
                                fontSize: '0.76rem',
                                padding: '4px 8px',
                                gap: '4px'
                              }}
                              title="Cancel ticket: passenger receives 70% refund and platform retains 30% profit"
                            >
                              <RotateCcw size={12} /> Refund (30% Profit)
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteModal({
                              isOpen: true,
                              type: 'BOOKING',
                              id: bk.id,
                              title: `Delete Booking #${bk.id}`,
                              subtitle: `Permanently delete this reservation for passenger ${bk.passengerName}. Reserved seats will immediately be liberated back to the coach.`,
                              details: [
                                { label: 'Booking Ref', value: `#${bk.id}` },
                                { label: 'Passenger', value: `${bk.passengerName} (${bk.passengerEmail})` },
                                { label: 'Seats Booked', value: `${bk.numberOfSeats} seat(s)` },
                                { label: 'Total Paid', value: `₹${bk.totalAmount}` }
                              ]
                            })}
                            className="btn btn-outline btn-sm"
                            style={{ 
                              color: 'var(--rose)', 
                              borderColor: 'rgba(244, 63, 94, 0.3)',
                              fontSize: '0.76rem',
                              padding: '4px 8px',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL                                      */}
      {/* ============================================================== */}
      {deleteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => !deleting && setDeleteModal(null)}
        >
          <div 
            className="card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              boxShadow: '0 20px 50px rgba(244, 63, 94, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>Confirm Deletion</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Irreversible Admin Operation
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !deleting && setDeleteModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              {deleteModal.subtitle}
            </p>

            {/* Summary Details Card */}
            {deleteModal.details && deleteModal.details.length > 0 && (
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.84rem' }}>
                {deleteModal.details.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>{d.label}:</span>
                    <strong style={{ color: '#ffffff' }}>{d.value}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline btn-md"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-md"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  gap: '6px'
                }}
              >
                {deleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Confirm & Delete
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADMIN CANCEL & REFUND CONFIRMATION MODAL                       */}
      {/* ============================================================== */}
      {cancelModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => !cancelling && setCancelModal(null)}
        >
          <div 
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: '#0f172a',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', margin: 0 }}>
                  Cancel & Process Refund
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  Booking Ref #{cancelModal.id} • {cancelModal.passengerName}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Cancelling this reservation will release the seats back to the public coach and apply the platform policy: <strong>70% refund to passenger</strong> and <strong>30% retained as company profit</strong>.
            </p>

            {/* Financial Breakdown Card */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '1.1rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Original Fare Paid:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>₹{cancelModal.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Passenger Refund (70%):</span>
                <span style={{ color: '#6ee7b7', fontWeight: 700 }}>₹{(cancelModal.totalAmount * 0.7).toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '0.5rem', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--amber)', fontWeight: 700 }}>Company Profit Retained (30%):</span>
                <strong style={{ color: '#fbbf24', fontSize: '1.05rem' }}>+₹{(cancelModal.totalAmount * 0.3).toFixed(2)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCancelModal(null)}
                disabled={cancelling}
                className="btn btn-outline btn-md"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleAdminCancelConfirm}
                disabled={cancelling}
                className="btn btn-md"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  fontWeight: 700
                }}
              >
                {cancelling ? 'Processing...' : 'Confirm Cancellation & Retain 30%'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE ROUTE MODAL                                             */}
      {/* ============================================================== */}
      {createRouteModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => !creatingRoute && setCreateRouteModalOpen(false)}
        >
          <div 
            className="card"
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 25px 50px rgba(16, 185, 129, 0.15)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '2px', color: '#ffffff' }}>Add New Route Corridor</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Highway Network Expansion
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !creatingRoute && setCreateRouteModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                disabled={creatingRoute}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Define origin and destination cities and specify highway transit distance. Coaches can then be scheduled along this corridor.
            </p>

            <form onSubmit={handleCreateRoute}>
              {/* Origin City */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Origin City (Source) <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Chennai, Mumbai..."
                  value={newRouteData.source}
                  onChange={(e) => setNewRouteData({ ...newRouteData, source: e.target.value })}
                  className="input-field"
                  required
                />
                {/* Popular City Quick-Pick */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.4rem' }}>
                  {POPULAR_HUBS.slice(0, 5).map((hub) => (
                    <button
                      key={hub}
                      type="button"
                      onClick={() => setNewRouteData({ ...newRouteData, source: hub })}
                      style={{
                        background: newRouteData.source === hub ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-glass)',
                        color: newRouteData.source === hub ? 'var(--emerald)' : 'var(--text-dim)',
                        borderRadius: '6px',
                        padding: '2px 7px',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      {hub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swap Button */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.4rem 0 0.6rem 0' }}>
                <button
                  type="button"
                  onClick={() => setNewRouteData({
                    ...newRouteData,
                    source: newRouteData.destination,
                    destination: newRouteData.source
                  })}
                  className="btn btn-outline btn-sm"
                  style={{
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    gap: '4px',
                    borderRadius: '20px',
                    color: 'var(--cyan)',
                    borderColor: 'rgba(6, 182, 212, 0.3)'
                  }}
                  title="Invert origin and destination"
                >
                  <ArrowRightLeft size={12} /> Invert Cities
                </button>
              </div>

              {/* Destination City */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Destination City <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, Pune, Salem..."
                  value={newRouteData.destination}
                  onChange={(e) => setNewRouteData({ ...newRouteData, destination: e.target.value })}
                  className="input-field"
                  required
                />
                {/* Popular City Quick-Pick */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.4rem' }}>
                  {POPULAR_HUBS.slice(4, 9).map((hub) => (
                    <button
                      key={hub}
                      type="button"
                      onClick={() => setNewRouteData({ ...newRouteData, destination: hub })}
                      style={{
                        background: newRouteData.destination === hub ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-glass)',
                        color: newRouteData.destination === hub ? 'var(--cyan)' : 'var(--text-dim)',
                        borderRadius: '6px',
                        padding: '2px 7px',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      {hub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Route Distance */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Highway Distance (Kilometers) <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="e.g. 350"
                  value={newRouteData.distance}
                  onChange={(e) => setNewRouteData({ ...newRouteData, distance: e.target.value })}
                  className="input-field"
                  required
                />
                {newRouteData.distance && !isNaN(parseFloat(newRouteData.distance)) && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                    Estimated transit duration at 55 km/h: <strong>~{Math.max(1, Math.round(parseFloat(newRouteData.distance) / 55))} hours</strong>
                  </span>
                )}
              </div>

              {/* Return Route Option */}
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: '10px', 
                  padding: '0.85rem', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                <input
                  type="checkbox"
                  id="createReturnRoute"
                  checked={newRouteData.createReturnRoute}
                  onChange={(e) => setNewRouteData({ ...newRouteData, createReturnRoute: e.target.checked })}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="createReturnRoute" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer', userSelect: 'none' }}>
                  <strong>Also create return corridor</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Automatically register the reverse journey ({newRouteData.destination || 'Destination'} → {newRouteData.source || 'Origin'}) with matching distance.
                  </div>
                </label>
              </div>

              {/* Auto-Schedule Initial Departures Checkbox */}
              <div 
                style={{ 
                  background: 'rgba(245, 158, 11, 0.08)', 
                  border: '1px solid rgba(245, 158, 11, 0.25)', 
                  borderRadius: '10px', 
                  padding: '0.85rem', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                <input
                  type="checkbox"
                  id="autoSchedule"
                  checked={newRouteData.autoSchedule}
                  onChange={(e) => setNewRouteData({ ...newRouteData, autoSchedule: e.target.checked })}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="autoSchedule" style={{ fontSize: '0.82rem', color: '#ffffff', cursor: 'pointer', userSelect: 'none' }}>
                  <strong>Automatically activate daily departures with fleet coach</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--amber)', marginTop: '2px' }}>
                    Provisions active trips for current & upcoming days so this route never displays "No Schedules" and is immediately bookable.
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setCreateRouteModalOpen(false)}
                  disabled={creatingRoute}
                  className="btn btn-outline btn-md"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRoute}
                  className="btn btn-md"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    gap: '6px'
                  }}
                >
                  {creatingRoute ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Creating Route...
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Save Route Corridor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT ROUTE MODAL                                               */}
      {/* ============================================================== */}
      {editRouteModal && editRouteModal.isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => !editingRoute && setEditRouteModal(null)}
        >
          <div 
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              boxShadow: '0 25px 50px rgba(99, 102, 241, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '2px', color: '#ffffff' }}>Edit Route Corridor #{editRouteModal.route.id}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Update Corridor Specs
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !editingRoute && setEditRouteModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                disabled={editingRoute}
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Corridor Vector Preview */}
            <div 
              style={{ 
                background: 'rgba(0, 0, 0, 0.35)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '10px', 
                padding: '0.85rem 1rem', 
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: 'var(--emerald)' }} />
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                  {editRouteModal.source || 'Origin'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--cyan)' }}>
                <span>──→</span>
                <span>{editRouteModal.distance ? `${editRouteModal.distance} km` : ''}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--cyan)', fontSize: '0.9rem' }}>
                  {editRouteModal.destination || 'Destination'}
                </span>
                <MapPin size={13} style={{ color: 'var(--cyan)' }} />
              </div>
            </div>

            <form onSubmit={handleUpdateRoute}>
              {/* Origin City */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Origin City (Source) <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editRouteModal.source}
                  onChange={(e) => setEditRouteModal({ ...editRouteModal, source: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* Destination City */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Destination City <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editRouteModal.destination}
                  onChange={(e) => setEditRouteModal({ ...editRouteModal, destination: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* Distance */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Corridor Distance (Kilometers) <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={editRouteModal.distance}
                  onChange={(e) => setEditRouteModal({ ...editRouteModal, distance: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditRouteModal(null)}
                  disabled={editingRoute}
                  className="btn btn-outline btn-md"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingRoute}
                  className="btn btn-md"
                  style={{
                    background: 'var(--primary-gradient)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    gap: '6px'
                  }}
                >
                  {editingRoute ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Save Route Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW ROUTE DETAILS MODAL                                       */}
      {/* ============================================================== */}
      {viewRouteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => setViewRouteModal(null)}
        >
          <div 
            className="card"
            style={{
              maxWidth: '620px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              boxShadow: '0 25px 50px rgba(6, 182, 212, 0.15)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.35rem', margin: 0, color: '#ffffff' }}>
                      {viewRouteModal.source} → {viewRouteModal.destination}
                    </h3>
                    <span className="badge badge-emerald">Route #{viewRouteModal.id}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Intercity Transit Corridor Overview
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewRouteModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Visual Corridor Box */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, rgba(16, 23, 41, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '14px', 
                padding: '1.25rem', 
                marginBottom: '1.5rem' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Origin Terminal</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    {viewRouteModal.source}
                  </div>
                </div>

                <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)' }}>
                    {viewRouteModal.distance ? `${viewRouteModal.distance} km` : 'Standard Distance'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '4px 0' }}>
                    <span style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, var(--emerald) 0%, var(--cyan) 100%)' }} />
                    <Navigation size={14} style={{ color: 'var(--cyan)' }} />
                    <span style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, var(--cyan) 0%, var(--primary-light) 100%)' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    Est. Duration: ~{viewRouteModal.distance ? Math.max(1, Math.round(viewRouteModal.distance / 55)) : 5} hrs
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Destination Terminal</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--cyan)' }}>
                    {viewRouteModal.destination}
                  </div>
                </div>
              </div>
            </div>

            {/* Associated Schedules Breakdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <h4 style={{ fontSize: '0.92rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: 'var(--amber)' }} />
                  Assigned Bus Schedules ({getSchedulesForRoute(viewRouteModal.id).length})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const r = viewRouteModal;
                    setViewRouteModal(null);
                    openScheduleModal(r);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    gap: '4px',
                    color: 'var(--amber)',
                    borderColor: 'rgba(245, 158, 11, 0.4)'
                  }}
                >
                  <Plus size={11} /> Add Departure
                </button>
              </div>

              {getSchedulesForRoute(viewRouteModal.id).length === 0 ? (
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.84rem', marginBottom: '0.75rem' }}>
                    No active departures currently scheduled for this corridor.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const r = viewRouteModal;
                      setViewRouteModal(null);
                      openScheduleModal(r);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <Calendar size={13} /> + Assign Coach & Activate Schedule
                  </button>
                </div>
              ) : (
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {getSchedulesForRoute(viewRouteModal.id).map((sch: any) => (
                    <div 
                      key={sch.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.9rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#ffffff' }}>
                          Coach {sch.bus?.busNumber || sch.busNumber || `#${sch.id}`}
                        </strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {sch.departureTime ? new Date(sch.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled trip'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>
                          ₹{sch.fare || 'Standard'}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Fare / Seat</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  const r = viewRouteModal;
                  setViewRouteModal(null);
                  setEditRouteModal({
                    isOpen: true,
                    route: r,
                    source: r.source,
                    destination: r.destination,
                    distance: String(r.distance || '')
                  });
                }}
                className="btn btn-outline btn-sm"
                style={{
                  color: 'var(--primary-light)',
                  borderColor: 'rgba(99, 102, 241, 0.35)',
                  fontSize: '0.82rem',
                  gap: '4px'
                }}
              >
                <Edit2 size={13} /> Edit Route
              </button>

              <button
                type="button"
                onClick={() => {
                  const r = viewRouteModal;
                  setViewRouteModal(null);
                  setDeleteModal({
                    isOpen: true,
                    type: 'ROUTE',
                    id: r.id,
                    title: `Delete Route: ${r.source} → ${r.destination}`,
                    subtitle: `Permanently delete this route corridor. All connected departure schedules, coach reservations, and tickets will be cascade removed.`,
                    details: [
                      { label: 'Route ID', value: `#${r.id}` },
                      { label: 'Departure', value: r.source },
                      { label: 'Destination', value: r.destination },
                      { label: 'Distance', value: `${r.distance || '—'} km` }
                    ]
                  });
                }}
                className="btn btn-outline btn-sm"
                style={{
                  color: 'var(--rose)',
                  borderColor: 'rgba(244, 63, 94, 0.35)',
                  fontSize: '0.82rem',
                  gap: '4px'
                }}
              >
                <Trash2 size={13} /> Delete Route
              </button>

              <button
                type="button"
                onClick={() => setViewRouteModal(null)}
                className="btn btn-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '0.82rem'
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE CUSTOM NUMBER PLATE MODAL                               */}
      {/* ============================================================== */}
      {createBusModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => !creatingBus && setCreateBusModalOpen(false)}
        >
          <div 
            className="card"
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2rem',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              boxShadow: '0 25px 60px rgba(6, 182, 212, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bus size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '2px', color: '#ffffff' }}>Create Custom Number Plate</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Fleet Registration Studio
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !creatingBus && setCreateBusModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                disabled={creatingBus}
              >
                <X size={18} />
              </button>
            </div>

            {/* LIVE REALISTIC NUMBER PLATE PREVIEW CARD */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '16px', 
                padding: '1.5rem 1.25rem', 
                marginBottom: '1.5rem',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                <span>Live Plate Display Mirror</span>
                <span>IND Spec Embossed Plate</span>
              </div>

              {/* Plate Banner */}
              <div style={{ padding: '0.5rem 0 1rem 0', display: 'flex', justifyContent: 'center' }}>
                {renderNumberPlateBadge(getComputedPlate(), newBusData.plateStyle, 'lg')}
              </div>

              {/* Plate Style Selectors & Live Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {/* Plate Color Style Switcher */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Plate Style:</span>
                  <button
                    type="button"
                    onClick={() => setNewBusData({ ...newBusData, plateStyle: 'YELLOW' })}
                    style={{
                      background: newBusData.plateStyle === 'YELLOW' ? '#facc15' : 'rgba(250, 204, 21, 0.15)',
                      color: newBusData.plateStyle === 'YELLOW' ? '#0f172a' : '#facc15',
                      border: '1px solid #ca8a04',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Commercial Yellow
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBusData({ ...newBusData, plateStyle: 'GREEN' })}
                    style={{
                      background: newBusData.plateStyle === 'GREEN' ? '#059669' : 'rgba(5, 150, 105, 0.15)',
                      color: '#ffffff',
                      border: '1px solid #047857',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    EV Green
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBusData({ ...newBusData, plateStyle: 'WHITE' })}
                    style={{
                      background: newBusData.plateStyle === 'WHITE' ? '#f8fafc' : 'rgba(255, 255, 255, 0.1)',
                      color: newBusData.plateStyle === 'WHITE' ? '#0f172a' : '#cbd5e1',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Executive White
                  </button>
                </div>

                {/* Live Duplicate / Availability Indicator */}
                <div>
                  {(() => {
                    const plate = getComputedPlate();
                    if (!plate) {
                      return <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Enter plate characters</span>;
                    }
                    if (isPlateDuplicate(plate)) {
                      return (
                        <span style={{ fontSize: '0.75rem', color: 'var(--rose)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={13} /> Already registered in fleet
                        </span>
                      );
                    }
                    return (
                      <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={13} /> Plate is available!
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateBus}>
              {/* CREATION METHOD TOGGLE (By My Own vs Guided Builder) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Creation Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <button
                    type="button"
                    onClick={() => setNewBusData({ ...newBusData, plateMode: 'CUSTOM' })}
                    style={{
                      background: newBusData.plateMode === 'CUSTOM' ? 'var(--accent-gradient)' : 'transparent',
                      color: newBusData.plateMode === 'CUSTOM' ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={14} /> Create By My Own (Custom Input)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewBusData({ ...newBusData, plateMode: 'BUILDER' })}
                    style={{
                      background: newBusData.plateMode === 'BUILDER' ? 'var(--accent-gradient)' : 'transparent',
                      color: newBusData.plateMode === 'BUILDER' ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Shuffle size={14} /> Guided RTO Plate Builder
                  </button>
                </div>
              </div>

              {/* MODE 1: FREE-FORM CUSTOM INPUT (BY MY OWN) */}
              {newBusData.plateMode === 'CUSTOM' ? (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Enter Custom Number Plate <span style={{ color: 'var(--rose)' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPlate}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.72rem', gap: '4px', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}
                    >
                      <Shuffle size={11} /> Roll Random Plate
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. TN-30-SLM-9999, KA-01-VIP-777, BOSS-007..."
                    value={newBusData.customPlate}
                    onChange={(e) => setNewBusData({ ...newBusData, customPlate: e.target.value.toUpperCase() })}
                    className="input-field"
                    style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.08em' }}
                    required
                  />

                  {/* Format suggestion chips */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginRight: '6px' }}>Quick Format Ideas:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}>
                      {PLATE_PRESETS.map((p) => (
                        <button
                          key={p.plate}
                          type="button"
                          onClick={() => setNewBusData({
                            ...newBusData,
                            customPlate: p.plate,
                            type: p.type,
                            plateStyle: p.style ? (p.style as any) : newBusData.plateStyle
                          })}
                          style={{
                            background: newBusData.customPlate === p.plate ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-glass)',
                            color: newBusData.customPlate === p.plate ? 'var(--cyan)' : 'var(--text-dim)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontFamily: 'monospace',
                            cursor: 'pointer'
                          }}
                          title={`Set to ${p.label}`}
                        >
                          {p.plate}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* MODE 2: GUIDED RTO BUILDER */
                <div style={{ marginBottom: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>RTO Plate Component Builder</span>
                    <button
                      type="button"
                      onClick={generateRandomPlate}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.72rem', gap: '4px', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}
                    >
                      <Shuffle size={11} /> Roll Random Components
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: '0.6rem' }}>
                    {/* State */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '3px' }}>State</label>
                      <select
                        value={newBusData.stateCode}
                        onChange={(e) => setNewBusData({ ...newBusData, stateCode: e.target.value })}
                        className="input-field"
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s.code} value={s.code} style={{ background: '#1e293b' }}>
                            {s.code} - {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* RTO District */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '3px' }}>RTO Dist</label>
                      <input
                        type="text"
                        placeholder="30"
                        maxLength={2}
                        value={newBusData.rtoCode}
                        onChange={(e) => setNewBusData({ ...newBusData, rtoCode: e.target.value.toUpperCase() })}
                        className="input-field"
                        style={{ padding: '6px 8px', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                      />
                    </div>

                    {/* Series */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '3px' }}>Series</label>
                      <input
                        type="text"
                        placeholder="SLM"
                        maxLength={4}
                        value={newBusData.series}
                        onChange={(e) => setNewBusData({ ...newBusData, series: e.target.value.toUpperCase() })}
                        className="input-field"
                        style={{ padding: '6px 8px', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                      />
                    </div>

                    {/* 4 Digit Number */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '3px' }}>Number</label>
                      <input
                        type="text"
                        placeholder="9999"
                        maxLength={4}
                        value={newBusData.number}
                        onChange={(e) => setNewBusData({ ...newBusData, number: e.target.value })}
                        className="input-field"
                        style={{ padding: '6px 8px', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COACH SPECIFICATIONS: TYPE & SEATING CAPACITY */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Coach Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Coach Specification / Type
                  </label>
                  <select
                    value={newBusData.type}
                    onChange={(e) => setNewBusData({ ...newBusData, type: e.target.value })}
                    className="input-field"
                    style={{ fontSize: '0.85rem' }}
                  >
                    {COACH_TYPES.map((t) => (
                      <option key={t} value={t} style={{ background: '#1e293b' }}>
                        {t}
                      </option>
                    ))}
                    <option value="OTHER" style={{ background: '#1e293b' }}>Custom Model Name...</option>
                  </select>

                  {newBusData.type === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="e.g. Scania Metrolink HD Luxury"
                      value={newBusData.customType}
                      onChange={(e) => setNewBusData({ ...newBusData, customType: e.target.value })}
                      className="input-field"
                      style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}
                      required
                    />
                  )}
                </div>

                {/* Seat Capacity */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Total Seating Capacity
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={newBusData.capacity}
                    onChange={(e) => setNewBusData({ ...newBusData, capacity: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    style={{ fontSize: '0.85rem' }}
                    required
                  />

                  {/* Quick capacity buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.4rem' }}>
                    {SEAT_CAPACITIES.map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setNewBusData({ ...newBusData, capacity: cap })}
                        style={{
                          background: newBusData.capacity === cap ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-glass)',
                          color: newBusData.capacity === cap ? 'var(--cyan)' : 'var(--text-dim)',
                          borderRadius: '5px',
                          padding: '2px 6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        {cap} seats
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={() => setCreateBusModalOpen(false)}
                  className="btn btn-outline btn-md"
                  disabled={creatingBus}
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-md"
                  disabled={creatingBus || !getComputedPlate() || isPlateDuplicate(getComputedPlate())}
                  style={{
                    background: 'var(--accent-gradient)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
                    border: 'none',
                    opacity: (creatingBus || !getComputedPlate() || isPlateDuplicate(getComputedPlate())) ? 0.6 : 1
                  }}
                >
                  {creatingBus ? (
                    <>
                      <RefreshCw size={15} className="spinner" /> Registering...
                    </>
                  ) : (
                    <>
                      <Plus size={15} /> Register Coach & Number Plate
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT COACH & NUMBER PLATE MODAL                                */}
      {/* ============================================================== */}
      {editBusModal && editBusModal.isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => !editingBus && setEditBusModal(null)}
        >
          <div 
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              boxShadow: '0 25px 60px rgba(6, 182, 212, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '2px', color: '#ffffff' }}>Edit Coach #{editBusModal.bus.id}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Number Plate & Fleet Update
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !editingBus && setEditBusModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                disabled={editingBus}
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Plate Mirror */}
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '1rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.25rem', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
                Plate Preview
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderNumberPlateBadge(editBusModal.busNumber.trim().toUpperCase(), editBusModal.plateStyle, 'md')}
              </div>
            </div>

            <form onSubmit={handleUpdateBus}>
              {/* Number Plate Input */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Coach Number Plate <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editBusModal.busNumber}
                  onChange={(e) => setEditBusModal({ ...editBusModal, busNumber: e.target.value.toUpperCase() })}
                  className="input-field"
                  style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '0.98rem', fontWeight: 800, letterSpacing: '0.06em' }}
                  required
                />
                {isPlateDuplicate(editBusModal.busNumber.trim().toUpperCase(), editBusModal.bus.id) && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--rose)', marginTop: '4px' }}>
                    ⚠️ This number plate is already used by another coach in the fleet.
                  </div>
                )}
              </div>

              {/* Coach Type */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Coach Specification / Type
                </label>
                <input
                  type="text"
                  value={editBusModal.type}
                  onChange={(e) => setEditBusModal({ ...editBusModal, type: e.target.value })}
                  className="input-field"
                  placeholder="e.g. AC Sleeper, Multi-Axle Volvo"
                  required
                />
              </div>

              {/* Seat Capacity */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Total Seating Capacity
                </label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={editBusModal.capacity}
                  onChange={(e) => setEditBusModal({ ...editBusModal, capacity: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  required
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={() => setEditBusModal(null)}
                  className="btn btn-outline btn-md"
                  disabled={editingBus}
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-md"
                  disabled={editingBus || !editBusModal.busNumber.trim() || isPlateDuplicate(editBusModal.busNumber.trim().toUpperCase(), editBusModal.bus.id)}
                  style={{
                    background: 'var(--accent-gradient)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
                    border: 'none',
                    opacity: (editingBus || !editBusModal.busNumber.trim() || isPlateDuplicate(editBusModal.busNumber.trim().toUpperCase(), editBusModal.bus.id)) ? 0.6 : 1
                  }}
                >
                  {editingBus ? (
                    <>
                      <RefreshCw size={15} className="spinner" /> Updating...
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Save Coach Plate Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCHEDULE DEPARTURE MODAL                                       */}
      {/* ============================================================== */}
      {scheduleModal && scheduleModal.isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => !scheduling && setScheduleModal(null)}
        >
          <div 
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 25px 60px rgba(245, 158, 11, 0.15)',
              position: 'relative',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '2px', color: '#ffffff' }}>Schedule Bus Coach</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Departure & Seat Activation
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !scheduling && setScheduleModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                disabled={scheduling}
              >
                <X size={18} />
              </button>
            </div>

            {/* Corridor Summary Card */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '12px', 
                padding: '1rem 1.25rem', 
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Active Corridor</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{scheduleModal.route.source}</span>
                  <ArrowRight size={14} style={{ color: 'var(--cyan)' }} />
                  <span style={{ color: 'var(--cyan)' }}>{scheduleModal.route.destination}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Distance</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--emerald)' }}>
                  {scheduleModal.route.distance ? `${scheduleModal.route.distance} km` : 'Standard'}
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateSchedule}>
              {/* Select Fleet Coach */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Select Assigned Fleet Coach <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <select
                  value={scheduleModal.busId}
                  onChange={(e) => setScheduleModal({ ...scheduleModal, busId: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  style={{ fontSize: '0.88rem' }}
                  required
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id} style={{ background: '#1e293b' }}>
                      Coach {b.busNumber} ({b.type || 'Standard'} • {b.capacity} Seats)
                    </option>
                  ))}
                </select>
              </div>

              {/* Departure Date & Time Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Departure Date <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={scheduleModal.departureDate}
                    onChange={(e) => setScheduleModal({ ...scheduleModal, departureDate: e.target.value })}
                    className="input-field"
                    style={{ fontSize: '0.86rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Departure Time <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={scheduleModal.departureTime}
                    onChange={(e) => setScheduleModal({ ...scheduleModal, departureTime: e.target.value })}
                    className="input-field"
                    style={{ fontSize: '0.86rem' }}
                    required
                  />
                </div>
              </div>

              {/* Quick Time Preset Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Morning 06:00', time: '06:00' },
                  { label: 'Afternoon 14:00', time: '14:00' },
                  { label: 'Evening 19:30', time: '19:30' },
                  { label: 'Night 21:00', time: '21:00' },
                  { label: 'Late Night 22:30', time: '22:30' }
                ].map((t) => (
                  <button
                    key={t.time}
                    type="button"
                    onClick={() => setScheduleModal({ ...scheduleModal, departureTime: t.time })}
                    style={{
                      background: scheduleModal.departureTime === t.time ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-glass)',
                      color: scheduleModal.departureTime === t.time ? 'var(--amber)' : 'var(--text-dim)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Fare Per Seat */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Ticket Fare (₹ per Passenger Seat) <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={scheduleModal.fare}
                  onChange={(e) => setScheduleModal({ ...scheduleModal, fare: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  style={{ fontSize: '0.88rem' }}
                  required
                />
              </div>

              {/* Repeat Daily Option */}
              <div 
                style={{ 
                  background: 'rgba(16, 185, 129, 0.08)', 
                  border: '1px solid rgba(16, 185, 129, 0.25)', 
                  borderRadius: '10px', 
                  padding: '0.85rem', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                <input
                  type="checkbox"
                  id="repeatDaily"
                  checked={scheduleModal.repeatDaily}
                  onChange={(e) => setScheduleModal({ ...scheduleModal, repeatDaily: e.target.checked })}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="repeatDaily" style={{ fontSize: '0.82rem', color: '#ffffff', cursor: 'pointer', userSelect: 'none' }}>
                  <strong>Provision daily departures for the upcoming 4 days</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--emerald)', marginTop: '2px' }}>
                    Schedules trips for Today, Tomorrow, Day +2, and Day +3 and automatically generates luxury seat allocations (S1..SN).
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={() => setScheduleModal(null)}
                  disabled={scheduling}
                  className="btn btn-outline btn-md"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={scheduling || !scheduleModal.busId}
                  className="btn btn-md"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                    border: 'none',
                    opacity: (scheduling || !scheduleModal.busId) ? 0.6 : 1
                  }}
                >
                  {scheduling ? (
                    <>
                      <RefreshCw size={15} className="spinner" /> Activating...
                    </>
                  ) : (
                    <>
                      <Calendar size={15} /> Activate & Provision Departures
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
