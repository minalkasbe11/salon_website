import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyAppointments, cancelAppointment } from '../../api/appointments';

const statusStyles = {
  pending: 'bg-gold/20 text-gold',
  confirmed: 'bg-rose-deep/20 text-rose-deep',
  completed: 'bg-ink/10 text-ink-soft',
  cancelled: 'bg-ink/10 text-ink-soft line-through',
};

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;
const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function MyAppointments() {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const load = () => {
    setLoading(true);
    getMyAppointments()
      .then(setAppointments)
      .catch(() => setError('Could not load your appointments right now.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      setError('Could not cancel that appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <span className="eyebrow">Your Bookings</span>
      <h1 className="mb-6">My Appointments</h1>

      {location.state?.justBooked && (
        <div className="border border-rose-deep/40 bg-rose/15 text-ink p-4 mb-6 text-sm">
          Your appointment has been booked — you'll find it below.
        </div>
      )}

      {loading && <p className="text-ink-soft">Loading…</p>}
      {error && <p className="text-rose-deep">{error}</p>}
      {!loading && !error && appointments.length === 0 && (
        <p className="text-ink-soft">You haven't booked anything yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {appointments.map((a) => (
          <div key={a.id} className="border border-ink/[0.14] bg-paper-dim p-5">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                <h4 className="font-display text-base mb-1">{a.service.name}</h4>
                <p className="text-ink-soft text-sm mb-0">
                  {formatDate(a.appointment_date)} at {a.start_time.slice(0, 5)} · {a.staff ? a.staff.name : 'Any available'}
                </p>
              </div>
              <span className={`shrink-0 font-mono text-[0.7rem] uppercase tracking-wider px-2.5 py-1 rounded-brand ${statusStyles[a.status]}`}>
                {a.status}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-mono text-[0.85rem] text-rose-deep">{formatPrice(a.service.price)}</span>
              {(a.status === 'pending' || a.status === 'confirmed') && (
                <button
                  onClick={() => handleCancel(a.id)}
                  disabled={cancellingId === a.id}
                  className="font-mono text-[0.72rem] uppercase tracking-wider text-ink-soft hover:text-rose-deep disabled:opacity-50 cursor-pointer"
                >
                  {cancellingId === a.id ? 'Cancelling…' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
