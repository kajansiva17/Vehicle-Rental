import { Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from './AuthProvider'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import VehiclesPage from './pages/VehiclesPage'
import VehicleDetailsPage from './pages/VehicleDetailsPage'
import BookingPage from './pages/BookingPage'
import MyBookingsPage from './pages/MyBookingsPage'
import DashboardPage from './pages/DashboardPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import AdminVehiclesPage from './pages/AdminVehiclesPage'
import AdminCustomersPage from './pages/AdminCustomersPage'
import './App.css'
export default function App() {
  return <AuthProvider><div className="app-shell bg-light"><Navbar /><main className="main-content container py-4 pb-5"><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/vehicles" element={<VehiclesPage />} />
    <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
    <Route path="/login" element={<AuthPage key="login" />} /><Route path="/register" element={<AuthPage key="register" register />} />
    <Route element={<ProtectedRoute />}><Route path="/profile" element={<ProfilePage />} /><Route path="/dashboard" element={<DashboardPage />} /></Route>
    <Route element={<ProtectedRoute role="customer" />}>
      <Route path="/customer/dashboard" element={<DashboardPage />} /><Route path="/booking" element={<BookingPage />} />
      <Route path="/booking/:id" element={<BookingPage />} /><Route path="/my-bookings" element={<MyBookingsPage />} />
    </Route>
    <Route element={<ProtectedRoute role="admin" />}>
      <Route path="/admin/dashboard" element={<DashboardPage />} /><Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
      <Route path="/admin/bookings" element={<MyBookingsPage admin />} /><Route path="/admin/customers" element={<AdminCustomersPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main></div></AuthProvider>
}
