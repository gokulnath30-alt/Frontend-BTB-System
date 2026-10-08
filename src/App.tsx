import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchBuses from './pages/SearchBuses';
import BusDetails from './pages/BusDetails';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import BookingHistory from './pages/BookingHistory';
import MyProfile from './pages/MyProfile';
import AdminDashboard from './pages/AdminDashboard';
import OperatorDashboard from './pages/OperatorDashboard';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main className="container" style={{ flex: 1, padding: '2rem 1rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login defaultModule="USER" />} />
              <Route path="/login/passenger" element={<Login defaultModule="USER" />} />
              <Route path="/operator/login" element={<Login defaultModule="OPERATOR" />} />
              <Route path="/login/operator" element={<Login defaultModule="OPERATOR" />} />
              <Route path="/admin/login" element={<Login defaultModule="ADMIN" />} />
              <Route path="/login/admin" element={<Login defaultModule="ADMIN" />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchBuses />} />
              <Route path="/bus/:id" element={<BusDetails />} />
              
              <Route path="/seats/:busId" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
              <Route path="/passenger-details" element={<ProtectedRoute><PassengerDetails /></ProtectedRoute>} />
              <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/operator" element={<ProtectedRoute allowedRoles={['OPERATOR']}><OperatorDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
