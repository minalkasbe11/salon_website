import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FormField, { inputClass } from '../components/FormField';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      setError(data?.non_field_errors?.[0] || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-105 mx-auto px-7">
        <span className="eyebrow">Welcome Back</span>
        <h1 className="mb-8">Login</h1>

        <form onSubmit={handleSubmit}>
          <FormField label="Email">
            <input
              type="email" name="email" required className={inputClass}
              value={form.email} onChange={handleChange}
            />
          </FormField>
          <FormField label="Password">
            <input
              type="password" name="password" required className={inputClass}
              value={form.password} onChange={handleChange}
            />
          </FormField>

          {error && <p className="text-rose-deep text-sm mb-4">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full justify-center disabled:opacity-50">
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="flex justify-between mt-6 text-sm font-mono uppercase tracking-wider">
          <NavLink to="/forgot-password" className="text-ink-soft hover:text-rose-deep">Forgot password?</NavLink>
          <NavLink to="/register" className="text-rose-deep hover:underline">Create account</NavLink>
        </div>
      </div>
    </section>
  );
}

// Sample logins (password for all: Test@1234)
