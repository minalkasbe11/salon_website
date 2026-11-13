import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FormField, { inputClass } from '../components/FormField';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      setErrors(data && typeof data === 'object' ? data : { non_field_errors: ['Something went wrong. Please try again.'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-105 mx-auto px-7">
        <span className="eyebrow">Join Us</span>
        <h1 className="mb-8">Register</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" error={errors.first_name?.[0]}>
              <input name="first_name" className={inputClass} value={form.first_name} onChange={handleChange} />
            </FormField>
            <FormField label="Last Name" error={errors.last_name?.[0]}>
              <input name="last_name" className={inputClass} value={form.last_name} onChange={handleChange} />
            </FormField>
          </div>
          <FormField label="Email" error={errors.email?.[0]}>
            <input type="email" name="email" required className={inputClass} value={form.email} onChange={handleChange} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.[0]}>
            <input type="tel" name="phone" className={inputClass} value={form.phone} onChange={handleChange} />
          </FormField>
          <FormField label="Password" error={errors.password?.[0]}>
            <input type="password" name="password" required minLength={8} className={inputClass} value={form.password} onChange={handleChange} />
          </FormField>

          {errors.non_field_errors && <p className="text-rose-deep text-sm mb-4">{errors.non_field_errors[0]}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full justify-center disabled:opacity-50">
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm font-mono uppercase tracking-wider">
          <NavLink to="/login" className="text-rose-deep hover:underline">Already have an account? Login</NavLink>
        </div>
      </div>
    </section>
  );
}
