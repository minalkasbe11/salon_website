export default function ChatMessages({ messages, sending }) {
  return (
    <>
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-line rounded-brand ${
              m.sender === 'user'
                ? 'bg-ink text-paper'
                : m.error
                  ? 'bg-paper-dim text-rose-deep italic border border-rose-deep/30'
                  : 'bg-paper-dim text-ink'
            }`}
          >
            {m.content}
          </div>
        </div>
      ))}
      {sending && (
        <div className="flex justify-start">
          <div className="bg-paper-dim text-ink-soft px-4 py-2.5 text-sm rounded-brand">Typing…</div>
        </div>
      )}
    </>
  );
}
