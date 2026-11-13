export default function TicketCard({ title, rows }) {
  return (
    <div className="border border-ink/[0.14] bg-paper-dim p-6.5 font-mono text-[0.85rem]">
      <div className="font-display text-lg mb-3.5 text-ink">{title}</div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex justify-between py-2.5 ${i < rows.length - 1 ? 'border-b border-dashed border-ink/[0.14]' : ''}`}
        >
          <span>{row.label}</span>
          <span className="text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
