import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiMessageCircle, FiCalendar, FiClock, FiTag,
  FiBell, FiUser, FiSettings, FiLogOut, FiMenu,
} from 'react-icons/fi';
import useAuth from '../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/dashboard/ai-assistant', label: 'AI Assistant', icon: FiMessageCircle },
  { to: '/dashboard/booking', label: 'Book Appointment', icon: FiCalendar },
  { to: '/dashboard/appointments', label: 'My Appointments', icon: FiClock },
  { to: '/dashboard/services', label: 'Services', icon: FiTag },
  { to: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  { to: '/dashboard/profile', label: 'Profile', icon: FiUser },
  { to: '/dashboard/settings', label: 'Settings', icon: FiSettings },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper-dim">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-ink text-paper">
        <NavLink to="/" className="font-display text-lg">Maison <span className="text-rose">Vera</span></NavLink>
        <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" className="p-1.5">
          <FiMenu size={22} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${mobileOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 shrink-0 bg-ink text-paper md:min-h-screen`}>
        <div className="hidden md:block px-6 py-6 border-b border-paper/12">
          <NavLink to="/" className="font-display text-lg">Maison <span className="text-rose">Vera</span></NavLink>
        </div>

        <div className="flex items-center gap-3 px-6 py-5 border-b border-paper/12">
          <div className="w-10 h-10 rounded-full bg-rose-deep/40 border border-rose/50 flex items-center justify-center font-display text-rose shrink-0">
            {(user?.first_name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[0.68rem] uppercase tracking-wider text-rose mb-0.5">Welcome back</p>
            <p className="font-display text-base truncate">{user?.first_name || user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 font-mono text-[0.8rem] uppercase tracking-wider transition-colors border-l-2 ${
                  isActive
                    ? 'bg-paper/8 text-paper border-rose'
                    : 'text-paper/60 border-transparent hover:bg-paper/5 hover:text-paper'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 font-mono text-[0.8rem] uppercase tracking-wider text-paper/60 hover:text-rose border-t border-paper/12 cursor-pointer"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </aside>

      <main className="flex-1 min-w-0 bg-paper">
        <Outlet />
      </main>
    </div>
  );
}
