import { NavLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="py-24 text-center">
      <div className="max-w-[500px] mx-auto px-7">
        <span className="eyebrow">404</span>
        <h1>Chair not found.</h1>
        <p className="text-ink-soft mt-4 mb-8">The page you're looking for doesn't exist.</p>
        <NavLink to="/" className="btn btn-primary">Back Home</NavLink>
      </div>
    </section>
  );
}
