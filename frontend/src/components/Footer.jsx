import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink text-paper pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.08em] mb-4 text-paper">Maison Vera</h4>
            <p className="text-paper/70 text-sm mb-2">14 Chapel Road, Bandra West,<br />Mumbai 400050</p>
            <p className="text-paper/70 text-sm">+91 98200 00000</p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.08em] mb-4 text-paper">Explore</h4>
            <NavLink to="/services" className="block text-paper/70 text-sm mb-2 hover:text-rose">Services</NavLink>
            <NavLink to="/stylists" className="block text-paper/70 text-sm mb-2 hover:text-rose">Stylists</NavLink>
            <NavLink to="/about" className="block text-paper/70 text-sm hover:text-rose">About</NavLink>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.08em] mb-4 text-paper">Visit</h4>
            <NavLink to="/booking" className="block text-paper/70 text-sm mb-2 hover:text-rose">Book Appointment</NavLink>
            <NavLink to="/contact" className="block text-paper/70 text-sm hover:text-rose">Contact</NavLink>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.08em] mb-4 text-paper">Hours</h4>
            <p className="text-paper/70 text-sm mb-2">Mon–Sat, 10:00–20:00</p>
            <p className="text-paper/70 text-sm">Sunday, 11:00–18:00</p>
          </div>
        </div>
        <div className="border-t border-paper/18 pt-6 flex flex-wrap justify-between gap-2 font-mono text-[0.72rem] text-paper/50">
          <span>© 2026 Maison Vera Salon &amp; Spa</span>
          <span>AI Salon Assistant</span>
        </div>
      </div>
    </footer>
  );
}
