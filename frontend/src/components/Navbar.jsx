import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/offers', label: 'Offers' },
  { to: '/about', label: 'About' },
  { to: '/ai-assistant', label: 'AI Assistant' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-paper/92 backdrop-blur border-b border-ink/[0.14]">
      <div className="container flex items-center justify-between py-5">
        <NavLink to="/" className="font-display text-xl">
          Maison <span className="text-rose-deep">Vera</span>
        </NavLink>

        <ul className="hidden md:flex gap-9 font-mono text-[0.78rem] tracking-[0.06em] uppercase">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative pb-1 hover:text-rose-deep ${isActive ? 'text-rose-deep after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-rose-deep' : ''}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              title={`Logged in as ${user.first_name || user.email}`}
              className="hidden sm:inline font-mono text-[0.78rem] uppercase tracking-[0.06em] hover:text-rose-deep cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <NavLink to="/login" className="hidden sm:inline font-mono text-[0.78rem] uppercase tracking-[0.06em] hover:text-rose-deep">
              Login
            </NavLink>
          )}
          <NavLink to="/booking" className="btn btn-primary">
            Book Appointment
          </NavLink>
          <button
            className="md:hidden flex flex-col gap-1.5 p-1.5"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="w-5.5 h-px bg-ink block" />
            <span className="w-5.5 h-px bg-ink block" />
            <span className="w-5.5 h-px bg-ink block" />
          </button>
        </div>
      </div>

      {open && (
        <ul className="md:hidden flex flex-col gap-4 px-7 pb-6 font-mono text-[0.8rem] uppercase tracking-[0.06em]">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            </li>
          ))}
          {isAuthenticated ? (
            <li><button onClick={handleLogout}>Logout</button></li>
          ) : (
            <>
              <li><NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink></li>
              <li><NavLink to="/register" onClick={() => setOpen(false)}>Register</NavLink></li>
            </>
          )}
        </ul>
      )}
    </header>
  );
}
