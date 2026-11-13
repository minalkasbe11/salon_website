import { useState } from 'react';
import FormField, { inputClass } from '../components/FormField';
import TicketCard from '../components/TicketCard';
import Reveal from '../components/Reveal';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // No message-storage backend yet — this confirms receipt client-side only.
    setSubmitted(true);
  };

  return (
    <>
      <section className="py-14 border-b border-ink/[0.14]">
        <div className="container">
          <span className="eyebrow">Get in Touch</span>
          <h1>Contact Us</h1>
          <p className="text-ink-soft text-[1.05rem]">
            Questions about services, membership, or a booking you already made — reach us any of these ways.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container grid md:grid-cols-2 gap-14">
          <Reveal>
            {submitted ? (
              <div className="border border-rose-deep/40 bg-rose/15 p-6">
                <h3 className="mb-2">Message received.</h3>
                <p className="text-ink-soft mb-0">Thanks, {form.name.split(' ')[0] || 'there'} — we'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <FormField label="Full Name">
                  <input name="name" required className={inputClass} value={form.name} onChange={handleChange} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Phone">
                    <input type="tel" name="phone" required className={inputClass} value={form.phone} onChange={handleChange} />
                  </FormField>
                  <FormField label="Email">
                    <input type="email" name="email" className={inputClass} value={form.email} onChange={handleChange} />
                  </FormField>
                </div>
                <FormField label="Message">
                  <textarea name="message" rows={5} required className={inputClass} value={form.message} onChange={handleChange} />
                </FormField>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
            )}
          </Reveal>

          <Reveal delay={150}>
            <TicketCard
              title="Visit Us"
              rows={[
                { label: 'Address', value: '14 Chapel Road, Bandra West, Mumbai' },
                { label: 'Phone', value: '+91 98200 00000' },
                { label: 'Email', value: 'hello@maisonvera.in' },
                { label: 'Mon–Sat', value: '10:00–20:00' },
                { label: 'Sunday', value: '11:00–18:00' },
              ]}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
