import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getOffers } from '../api/website';
import Reveal from '../components/Reveal';
import { swatchGradients } from '../utils/swatchGradients';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOffers()
      .then(setOffers)
      .catch(() => setError('Could not load offers right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="py-14 border-b border-ink/[0.14]">
        <div className="container">
          <span className="eyebrow">Offers</span>
          <h1>Latest Offers</h1>
          <p className="text-ink-soft text-[1.05rem]">Currently running promotions — no codes needed, just book.</p>
        </div>
      </section>

      <div className="container py-14">
        {loading && <p className="text-ink-soft">Loading…</p>}
        {error && <p className="text-rose-deep">{error}</p>}
        {!loading && !error && offers.length === 0 && (
          <p className="text-ink-soft">No active offers right now — check back soon.</p>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {offers.map((offer, i) => (
            <Reveal key={offer.id} delay={i * 80} className="card-hover border border-ink/[0.14] bg-paper-dim overflow-hidden">
              <div className={`h-2 bg-linear-to-r ${swatchGradients[i % swatchGradients.length]}`} />
              <div className="p-6">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="mb-0">{offer.title}</h3>
                  {offer.discount_percentage && (
                    <span className="shrink-0 font-mono text-[0.8rem] text-rose-deep">{offer.discount_percentage}% off</span>
                  )}
                </div>
                <p className="text-ink-soft text-sm mb-4">{offer.description}</p>
                <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-soft mb-0">
                  Valid until {formatDate(offer.valid_until)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {offers.length > 0 && (
          <div className="text-center mt-14">
            <NavLink to="/booking" className="btn btn-primary">Book Now</NavLink>
          </div>
        )}
      </div>
    </>
  );
}
