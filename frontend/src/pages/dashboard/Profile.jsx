import useAuth from '../../hooks/useAuth';

const Field = ({ label, value }) => (
  <div className="mb-5">
    <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-rose-deep mb-1.5">{label}</p>
    <p className="text-ink mb-0">{value || '—'}</p>
  </div>
);

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-10 max-w-lg">
      <span className="eyebrow">Your Account</span>
      <h1 className="mb-8">Profile</h1>

      <div className="border border-ink/[0.14] bg-paper-dim p-7">
        <div className="grid grid-cols-2 gap-x-6">
          <Field label="First Name" value={user?.first_name} />
          <Field label="Last Name" value={user?.last_name} />
        </div>
        <Field label="Email" value={user?.email} />
        <Field label="Phone" value={user?.phone} />
        <Field label="Loyalty Points" value={user?.loyalty_points} />
      </div>

      <p className="text-ink-soft text-sm mt-6">
        Editing your details and setting a preferred stylist is coming in a future update.
      </p>
    </div>
  );
}
