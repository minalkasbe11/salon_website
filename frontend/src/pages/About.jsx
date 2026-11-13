import { NavLink } from 'react-router-dom';
import Reveal from '../components/Reveal';
import TicketCard from '../components/TicketCard';
import { swatchGradients } from '../utils/swatchGradients';

const values = [
  { title: 'Real time slots', desc: 'Every service has an honest duration. No overlap, no rushed finishes.' },
  { title: 'One stylist, one client', desc: "Your stylist isn't juggling two chairs during your appointment." },
  { title: 'Transparent pricing', desc: "What's listed is what you pay — no hidden add-ons at checkout." },
];

export default function About() {
  return (
    <>
      <section className="py-14 border-b border-ink/[0.14]">
        <div className="container">
          <span className="eyebrow">Since 2014</span>
          <h1>One studio.<br />No shortcuts.</h1>
          <p className="text-ink-soft text-[1.05rem] max-w-115">
            Maison Vera opened as a single chair in Bandra with one rule: never overbook. A decade later,
            we're six stylists, one studio, and the same rule.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <span className="eyebrow">Our Approach</span>
            <h2>Unhurried, by design.</h2>
            <p className="text-ink-soft">
              We don't run multiple locations and we don't intend to. Every appointment is booked with real slot
              durations, not padded guesses — which means when you arrive, your stylist is actually free.
            </p>
            <p className="text-ink-soft">
              Products used in-studio are also available to buy at the front desk — reserve online, pick up and
              pay in person.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <TicketCard
              title="At a Glance"
              rows={[
                { label: 'Founded', value: '2014' },
                { label: 'Location', value: 'Bandra, Mumbai' },
                { label: 'Chairs', value: '6' },
                { label: 'Stylists', value: '6' },
              ]}
            />
          </Reveal>
        </div>
      </section>

      <section className="py-14 bg-paper-dim">
        <div className="container">
          <Reveal>
            <span className="eyebrow">What Matters to Us</span>
            <h2>Three things we don't compromise on.</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-px bg-ink/[0.14] border border-ink/[0.14] mt-8">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100} className="card-hover bg-paper p-8">
                <div className={`w-full h-13 rounded-brand mb-4 bg-linear-to-br ${swatchGradients[i % swatchGradients.length]}`} />
                <h3>{v.title}</h3>
                <p className="text-ink-soft text-sm mb-0">{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 text-center">
        <div className="container">
          <h2>Come see the studio.</h2>
          <NavLink to="/booking" className="btn btn-primary">Book Appointment</NavLink>
        </div>
      </section>
    </>
  );
}
