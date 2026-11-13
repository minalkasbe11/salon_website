import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../../api/notifications';

const typeLabels = {
  booking_confirmation: 'Booking',
  appointment_reminder: 'Reminder',
  offer: 'Offer',
  announcement: 'Announcement',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch(() => setError('Could not load notifications right now.'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await markNotificationRead(id);
    } catch {
      // revert on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <span className="eyebrow">Stay Updated</span>
      <h1 className="mb-8">Notifications</h1>

      {loading && <p className="text-ink-soft">Loading…</p>}
      {error && <p className="text-rose-deep">{error}</p>}
      {!loading && !error && notifications.length === 0 && (
        <p className="text-ink-soft">You're all caught up — no notifications yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`border border-ink/[0.14] p-5 flex justify-between items-start gap-4 ${n.is_read ? 'bg-paper' : 'bg-paper-dim'}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-rose-deep shrink-0" />}
                <span className="font-mono text-[0.68rem] uppercase tracking-wider text-rose-deep">
                  {typeLabels[n.notification_type] || n.notification_type}
                </span>
              </div>
              <h4 className="font-display text-base mb-1">{n.title}</h4>
              <p className="text-ink-soft text-sm mb-0">{n.message}</p>
            </div>
            {!n.is_read && (
              <button
                onClick={() => handleMarkRead(n.id)}
                className="shrink-0 font-mono text-[0.68rem] uppercase tracking-wider text-rose-deep hover:underline cursor-pointer"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
