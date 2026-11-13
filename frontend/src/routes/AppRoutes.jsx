import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Services from '../pages/Services';
import Gallery from '../pages/Gallery';
import Offers from '../pages/Offers';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Stylists from '../pages/Stylists';
import Booking from '../pages/Booking';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import AIAssistant from '../pages/AIAssistant';
import NotFound from '../pages/NotFound';
import DashboardHome from '../pages/dashboard/DashboardHome';
import MyAppointments from '../pages/dashboard/MyAppointments';
import Notifications from '../pages/dashboard/Notifications';
import Profile from '../pages/dashboard/Profile';
import Settings from '../pages/dashboard/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Navigate to="/services" replace />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/stylists" element={<Stylists />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/booking" element={<Booking />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/appointments" element={<MyAppointments />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          {/* Same page components as the public routes above — kept at dashboard-scoped
              paths too so navigating here from the sidebar stays inside the dashboard shell
              instead of dropping back to the public site's navbar/footer. */}
          <Route path="/dashboard/ai-assistant" element={<AIAssistant />} />
          <Route path="/dashboard/booking" element={<Booking />} />
          <Route path="/dashboard/services" element={<Services />} />
        </Route>
      </Route>
    </Routes>
  );
}
