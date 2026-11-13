import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiMessageCircle, FiX, FiSend, FiMaximize2 } from 'react-icons/fi';
import useChat from '../hooks/useChat';
import ChatMessages from './ChatMessages';
import AIStatusBadge from './AIStatusBadge';
import useAIStatus from '../hooks/useAIStatus';

const SUGGESTED = ['What are your hours?', 'What offers do you have?', 'How do I book an appointment?'];

export default function ChatWidgetButton() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, sending } = useChat();
  const scrollRef = useRef(null);
  const location = useLocation();

  // The full AI Assistant page already provides this same chat — showing the floating
  // widget on top of it too is redundant (and its `open` state can carry over from before
  // navigating here, e.g. via the widget's own expand icon).
  const onAssistantPage = location.pathname === '/ai-assistant';
  const ai = useAIStatus(open && !onAssistantPage); // only check while the widget is open
  const canChat = ai.connected && !sending;

  // Re-check the status right away if a send failed because the AI went away.
  const send = async (text) => {
    const result = await sendMessage(text);
    if (result && !result.ok && ['not_connected', 'loading', 'disabled'].includes(result.code)) ai.refresh();
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !canChat) return;
    send(input);
    setInput('');
  };

  if (onAssistantPage) return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-88 max-w-[calc(100vw-3rem)] h-120 max-h-[70vh] bg-paper border border-ink/[0.14] shadow-[0_20px_50px_-15px_rgba(43,27,36,0.35)] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 bg-ink text-paper shrink-0">
            <div className="flex flex-col">
              <span className="font-display text-base">AI Salon Assistant</span>
              <AIStatusBadge state={ai.state} message={ai.message} className="text-paper/80" />
            </div>
            <div className="flex items-center gap-3">
              <NavLink to="/ai-assistant" title="Open full page" className="hover:text-rose">
                <FiMaximize2 size={16} />
              </NavLink>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="hover:text-rose cursor-pointer">
                <FiX size={18} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <>
                <div className="bg-paper-dim text-ink text-sm px-4 py-2.5 rounded-brand self-start max-w-[85%]">
                  Hi! Ask me about services, pricing, offers, hours, or booking.
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {SUGGESTED.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      disabled={!canChat}
                      className="disabled:opacity-40 disabled:cursor-not-allowed text-left font-mono text-[0.72rem] uppercase tracking-wider text-rose-deep border border-rose-deep/30 rounded-brand px-3 py-2 hover:bg-rose/10 cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}
            <ChatMessages messages={messages} sending={sending} />
          </div>

          {!ai.connected && ai.state !== 'checking' && (
            <p className="px-4 py-2 text-xs text-rose-deep border-t border-ink/[0.14] shrink-0">{ai.message}</p>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink/[0.14] p-3 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ai.connected ? 'Type a message…' : 'AI assistant not connected'}
              disabled={!ai.connected}
              className="disabled:opacity-50 flex-1 px-3 py-2 text-sm border border-ink/[0.14] rounded-brand bg-paper focus:outline-2 focus:outline-rose-deep"
            />
            <button
              type="submit"
              disabled={!canChat || !input.trim()}
              className="w-9 h-9 shrink-0 flex items-center justify-center bg-ink text-paper rounded-brand disabled:opacity-40 cursor-pointer"
              aria-label="Send"
            >
              <FiSend size={15} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-ink text-paper shadow-lg hover:bg-rose-deep transition-colors cursor-pointer"
        aria-label={open ? 'Close AI Salon Assistant' : 'Open AI Salon Assistant'}
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>
    </>
  );
}
