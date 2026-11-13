import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getServiceCategories } from '../api/services';
import { swatchGradients } from '../utils/swatchGradients';
import Reveal from '../components/Reveal';
import heroServices from '../assets/hero-services.jpg';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function Services() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServiceCategories()
      .then(setCategories)
      .catch(() => setError('Could not load services right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="py-16 border-b border-ink/[0.14]">
        <div className="container grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <Reveal>
            <span className="eyebrow">Price List</span>
            <h1>Services &amp; Pricing</h1>
            <p className="text-ink-soft text-[1.05rem] max-w-115">
              All prices are per session, payable at the salon. Duration includes consultation time.
            </p>
          </Reveal>
          <Reveal delay={150} className="hidden md:block">
            <img
              src={heroServices}
              alt="Haircut styling at Maison Vera"
              className="w-full h-auto max-h-135 object-cover object-top rounded-brand card-hover"
            />
          </Reveal>
        </div>
      </section>

      <div className="container">
        {loading && <p className="text-ink-soft py-16">Loading services…</p>}
        {error && <p className="text-rose-deep py-16">{error}</p>}

        {!loading && !error && categories.length === 0 && (
          <p className="text-ink-soft py-16">No services yet — add some in the Django admin.</p>
        )}

        {categories.map((cat, i) => (
          <Reveal key={cat.id} className="py-12 border-b border-ink/[0.14] last:border-b-0">
            <div className="flex items-center gap-4 mb-7">
              <div className={`w-8.5 h-8.5 rounded-full shrink-0 bg-linear-to-br ${swatchGradients[i % swatchGradients.length]}`} />
              <div>
                <span className="eyebrow !mb-0">{String(i + 1).padStart(2, '0')} — {cat.name}</span>
                <h2 className="mt-1">{cat.name}</h2>
              </div>
            </div>

            {cat.services.length === 0 && (
              <p className="text-ink-soft text-sm">No services in this category yet.</p>
            )}

            {cat.services.map((service) => (
              <div
                key={service.id}
                className="flex justify-between items-baseline gap-5 py-4.5 px-3 -mx-3 rounded-brand border-b border-dotted border-ink/[0.14] last:border-b-0 hover:bg-paper-dim transition-colors"
              >
                <div>
                  <div className="font-display text-[1.15rem]">{service.name}</div>
                  {service.description && (
                    <p className="text-[0.88rem] text-ink-soft mt-1 mb-0">{service.description}</p>
                  )}
                </div>
                <div className="font-mono text-[0.85rem] whitespace-nowrap text-right text-rose-deep">
                  {formatPrice(service.price)}
                  <small className="block text-ink-soft text-[0.72rem] mt-0.5">{service.duration_minutes} min</small>
                </div>
              </div>
            ))}
          </Reveal>
        ))}
      </div>

      <section className="py-16 text-center">
        <div className="container">
          <Reveal>
            <h2>Not sure what you need?</h2>
            <p className="text-ink-soft">Book a consultation slot — no charge, no commitment.</p>
            <NavLink to="/booking" className="btn btn-primary">Book Appointment</NavLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
