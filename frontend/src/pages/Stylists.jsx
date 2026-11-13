import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getStaff } from '../api/staff';
import Reveal from '../components/Reveal';
import { swatchGradients } from '../utils/swatchGradients';

export default function Stylists() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStaff()
      .then(setStaff)
      .catch(() => setError('Could not load our stylists right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="py-14 border-b border-ink/[0.14]">
        <div className="container">
          <span className="eyebrow">Meet the Team</span>
          <h1>Our Stylists</h1>
          <p className="text-ink-soft text-[1.05rem]">
            Pick a stylist by name at booking, or choose "Any Available" and we'll match you with the next free chair.
          </p>
        </div>
      </section>

      <div className="container py-14">
        {loading && <p className="text-ink-soft">Loading…</p>}
        {error && <p className="text-rose-deep">{error}</p>}
        {!loading && !error && staff.length === 0 && (
          <p className="text-ink-soft">No stylists listed yet — add some in the Django admin.</p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {staff.map((s, i) => (
            <Reveal key={s.id} delay={i * 80} className="card-hover border border-ink/[0.14] bg-paper-dim">
              {s.profile_image ? (
                <img src={s.profile_image} alt={s.name} className="aspect-3/4 w-full object-cover" />
              ) : (
                <div className={`aspect-3/4 flex items-end p-4.5 bg-linear-to-br ${swatchGradients[i % swatchGradients.length]}`}>
                  <span className="font-mono text-paper text-[0.72rem] uppercase tracking-wider">{s.specialty}</span>
                </div>
              )}
              <div className="p-5.5">
                <span className="font-mono text-[0.75rem] text-rose-deep uppercase tracking-wider">{s.specialty}</span>
                <h3 className="mt-1 mb-1.5">{s.name}</h3>
                <p className="text-sm text-ink-soft mb-0">{s.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <section className="py-14 bg-paper-dim text-center">
        <div className="container">
          <h2>Have a favourite stylist?</h2>
          <p className="text-ink-soft">Request them by name at checkout — or let us auto-assign the next available chair.</p>
          <NavLink to="/booking" className="btn btn-primary">Book Appointment</NavLink>
        </div>
      </section>
    </>
  );
}
