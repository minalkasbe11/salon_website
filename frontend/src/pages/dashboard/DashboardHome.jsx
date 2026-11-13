import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMessageCircle, FiCalendar, FiTag, FiBell } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { getOffers } from '../../api/website';
import TicketCard from '../../components/TicketCard';
import { swatchGradients } from '../../utils/swatchGradients';

const quickActions = [
  { to: '/dashboard/ai-assistant', label: 'Start AI Chat', icon: FiMessageCircle },
  { to: '/dashboard/booking', label: 'Book Appointment', icon: FiCalendar },
  { to: '/dashboard/services', label: 'View Services', icon: FiTag },
  { to: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
];

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';

export default function DashboardHome() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);

  useEffect(() => {
    getOffers()
      .then(setOffers)
      .catch(() => setOffers([]))
      .finally(() => setOffersLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <span className="eyebrow">Dashboard</span>
      <h1 className="mb-8">Welcome back, {user?.first_name || 'there'}.</h1>

      <div className="grid md:grid-cols-[1fr_auto] gap-6 mb-10 items-start">
        <div className="border border-ink/[0.14] bg-paper-dim p-6">
          <h3 className="mb-2">Upcoming Appointment</h3>
          <p className="text-ink-soft text-sm mb-0">
            You don't have any upcoming appointments yet.{' '}
            <NavLink to="/dashboard/booking" className="text-rose-deep underline">Book one now</NavLink>.
          </p>
        </div>
        <TicketCard
          title="Account Summary"
          rows={[
            { label: 'Loyalty Points', value: user?.loyalty_points ?? 0 },
            { label: 'Member Since', value: formatDate(user?.date_joined) },
            { label: 'Role', value: user?.role || 'customer' },
          ]}
        />
      </div>

      {/* Quick actions */}
      <h3 className="mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {quickActions.map(({ to, label, icon: Icon }, i) => (
          <NavLink
            key={to}
            to={to}
            className="card-hover flex flex-col items-center text-center gap-3 border border-ink/[0.14] bg-paper-dim p-5"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center bg-linear-to-br ${swatchGradients[i % swatchGradients.length]}`}>
              <Icon size={18} className="text-paper" />
            </div>
            <span className="font-mono text-[0.72rem] uppercase tracking-wider">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Recent activity */}
      <h3 className="mb-4">Recent Activity</h3>
      <div className="border border-ink/[0.14] bg-paper-dim p-6 mb-10">
        <p className="text-ink-soft text-sm mb-0">No recent activity yet.</p>
      </div>

      {/* Latest offers — live from the Offers API */}
      <h3 className="mb-4">Latest Offers</h3>
      {offersLoading && <p className="text-ink-soft text-sm">Loading offers…</p>}
      {!offersLoading && offers.length === 0 && (
        <p className="text-ink-soft text-sm">No active offers right now.</p>
      )}
      {offers.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {offers.map((offer, i) => (
            <div key={offer.id} className="card-hover flex gap-4 border border-ink/[0.14] bg-paper-dim p-5">
              <div className={`w-1.5 shrink-0 rounded-full bg-linear-to-b ${swatchGradients[i % swatchGradients.length]}`} />
              <div>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="font-display text-base">{offer.title}</h4>
                  {offer.discount_percentage && (
                    <span className="font-mono text-[0.75rem] text-rose-deep shrink-0">{offer.discount_percentage}% off</span>
                  )}
                </div>
                <p className="text-ink-soft text-sm mb-0">{offer.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
