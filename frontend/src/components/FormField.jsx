export default function FormField({ label, error, children }) {
  return (
    <div className="mb-5">
      <label className="block font-mono text-[0.72rem] uppercase tracking-[0.08em] text-rose-deep mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-rose-deep text-sm mt-1.5">{error}</p>}
    </div>
  );
}

export const inputClass =
  'w-full px-3.5 py-3 border border-ink/[0.14] bg-paper font-body text-[0.95rem] text-ink rounded-brand focus:outline-2 focus:outline-rose-deep focus:outline-offset-1';
