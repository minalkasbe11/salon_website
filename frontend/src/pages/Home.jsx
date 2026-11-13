import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getServiceCategories } from '../api/services';
import { getTestimonials } from '../api/website';
import TicketCard from '../components/TicketCard';
import Reveal from '../components/Reveal';
import { swatchGradients } from '../utils/swatchGradients';
import heroHome from '../assets/hero-home.jpg';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    getServiceCategories()
      .then(setCategories)
      .catch(() => setError('Could not load services right now.'))
      .finally(() => setLoading(false));

    getTestimonials()
      .then(setTestimonials)
      .catch(() => setTestimonials([]))
      .finally(() => setTestimonialsLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section
        className="border-b border-ink/[0.14] py-16 sm:py-24 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(244,237,228,0.88), rgba(169,99,109,0.55)), url(${heroHome})` }}
      >
        <div className="container grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <Reveal>
            <span className="eyebrow">Est. 2014 — Bandra, Mumbai</span>
            <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.05] mb-4">
              Hair, skin &amp; beauty,<br />done beautifully.
            </h1>
            <p className="text-ink-soft text-[1.15rem] max-w-115 mb-7">
              Expert stylists, honest pricing and easy online booking. Have a question? Our AI assistant
              answers instantly, any time.
            </p>
            <div className="flex flex-wrap gap-4">
              <NavLink to="/booking" className="btn btn-primary">Book Appointment</NavLink>
              <NavLink to="/services" className="btn btn-outline">Explore Services</NavLink>
              <NavLink to="/ai-assistant" className="btn btn-outline">Ask Our Assistant</NavLink>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <TicketCard
              title="Today at Maison Vera"
              rows={[
                { label: 'Open', value: '10:00 — 20:00' },
                { label: 'Walk-ins', value: 'Welcome' },
                { label: 'Online booking', value: '24 × 7' },
                { label: 'Questions', value: 'Ask our assistant' },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* What we do — live from the Services API */}
      <section className="py-16">
        <div className="container">
          <Reveal>
            <div className="flex justify-between items-end flex-wrap gap-3 mb-9">
              <div>
                <span className="eyebrow">What we do</span>
                <h2>Four disciplines,<br />one standard.</h2>
              </div>
              <NavLink to="/services" className="btn btn-outline">Full price list →</NavLink>
            </div>
          </Reveal>

          {loading && <p className="text-ink-soft">Loading services…</p>}
          {error && <p className="text-rose-deep">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-ink/[0.14] border border-ink/[0.14]">
              {categories.length === 0 && (
                <div className="bg-paper p-8 text-ink-soft text-sm">
                  No service categories yet — add some in the Django admin.
                </div>
              )}
              {categories.map((cat, i) => (
                <Reveal key={cat.id} delay={i * 80} className="card-hover bg-paper p-8 hover:bg-paper-dim relative z-10">
                  <div className={`w-full h-13 rounded-brand mb-4 bg-linear-to-br ${swatchGradients[i % swatchGradients.length]}`} />
                  <span className="font-mono text-[0.7rem] text-rose-deep tracking-[0.08em]">
                    {String(i + 1).padStart(2, '0')} — {cat.name.toUpperCase()}
                  </span>
                  <h3 className="mt-2 mb-2">{cat.name}</h3>
                  <p className="text-sm text-ink-soft mb-0">
                    {cat.services.length} service{cat.services.length !== 1 ? 's' : ''} available
                  </p>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI assistant — a helper for customers, not the main product */}
      <section className="py-16 border-t border-ink/[0.14]">
        <div className="container grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <span className="eyebrow">Need help?</span>
            <h2>Ask our salon<br />assistant anything.</h2>
            <p className="text-ink-soft mb-6">
              Not sure which treatment suits you, or when your next appointment is? Our assistant answers in
              seconds, in English, Hindi or Marathi. Look for the chat button at the bottom-right of every page.
            </p>
            <NavLink to="/ai-assistant" className="btn btn-primary">Chat With Our Assistant</NavLink>
          </Reveal>
          <Reveal delay={150}>
            <TicketCard
              title="Our assistant can help with"
              rows={[
                { label: 'Services & prices', value: '✓' },
                { label: 'Current offers', value: '✓' },
                { label: 'Opening hours & location', value: '✓' },
                { label: 'How to book', value: '✓' },
                { label: 'Your upcoming appointments', value: 'When logged in' },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Membership */}
      <section className="py-16 bg-paper-dim">
        <div className="container grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <span className="eyebrow">Membership</span>
            <h2>Become a regular.<br />Save on every visit.</h2>
            <p className="text-ink-soft mb-6">
              Our membership gives you a flat discount across every service, priority booking on weekends,
              and a complimentary treatment every quarter.
            </p>
            <NavLink to="/contact" className="btn btn-primary">Ask About Membership</NavLink>
          </Reveal>
          <Reveal delay={150}>
            <TicketCard
              title="Membership Card"
              rows={[
                { label: 'Discount on all services', value: '15%' },
                { label: 'Priority weekend slots', value: 'Yes' },
                { label: 'Complimentary treatment', value: '1 / quarter' },
                { label: 'Validity', value: '12 months' },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-ink text-paper">
        <div className="container">
          <Reveal>
            <span className="eyebrow">In their words</span>
            <h2 className="text-paper">Clients who keep<br />coming back.</h2>
          </Reveal>

          {!testimonialsLoading && testimonials.length === 0 && (
            <p className="text-paper/70 mt-6">No testimonials yet — add some in the Django admin.</p>
          )}

          {testimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-paper/18 border border-paper/18 mt-10">
              {testimonials.slice(0, 3).map((t, i) => (
                <Reveal key={t.id} delay={i * 100} className="card-hover bg-ink p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-deep/30 border border-rose/40 flex items-center justify-center font-display text-rose text-sm">
                      {t.customer_name.charAt(0)}
                    </div>
                    <div className="font-mono text-[0.75rem] text-rose uppercase tracking-wider">{t.customer_name}</div>
                  </div>
                  <div className="font-mono text-[0.85rem] text-gold mb-3">{'★'.repeat(t.rating)}</div>
                  <p className="text-paper/85 text-[0.95rem]">"{t.message}"</p>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Ready when you are</span>
            <h2>Your chair is<br />waiting.</h2>
            <NavLink to="/booking" className="btn btn-primary">Book Your Appointment</NavLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
