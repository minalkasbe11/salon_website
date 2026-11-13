// Small "Online / Not connected" indicator for the chat header.
const LABELS = {
  connected: 'Online',
  checking: 'Checking…',
  loading: 'Starting up…',
  not_connected: 'Not connected',
  disabled: 'Turned off',
};

export default function AIStatusBadge({ state, message, className = '' }) {
  const color =
    state === 'connected' ? 'bg-green-500' : state === 'checking' || state === 'loading' ? 'bg-amber-400' : 'bg-red-500';
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-wider ${className}`} title={message}>
      <span className={`w-2 h-2 rounded-full ${color}`} aria-hidden="true" />
      {LABELS[state] || 'Not connected'}
    </span>
  );
}