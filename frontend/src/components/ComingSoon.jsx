export default function ComingSoon({ eyebrow, title, description }) {
  return (
    <section className="py-24 text-center">
      <div className="max-w-[600px] mx-auto px-7">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p className="text-ink-soft mt-4">{description}</p>}
        <p className="text-ink-soft text-sm mt-8 font-mono uppercase tracking-[0.08em]">
          — this page is a future module —
        </p>
      </div>
    </section>
  );
}
