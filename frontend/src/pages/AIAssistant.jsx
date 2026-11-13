import { useEffect, useRef, useState } from 'react';
import { FiSend, FiPlus } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import useChat from '../hooks/useChat';
import ChatMessages from '../components/ChatMessages';
import AIStatusBadge from '../components/AIStatusBadge';
import useAIStatus from '../hooks/useAIStatus';
import { getConversations, getConversation } from '../api/chatbot';

const SUGGESTED = [
  'What are your hours?',
  'What offers do you have right now?',
  'How much is a haircut?',
  'How do I book an appointment?',
  'What is your cancellation policy?',
];

export default function AIAssistant() {
  const { isAuthenticated } = useAuth();
  const { messages, sendMessage, sending, conversationId, startNewChat, loadConversation } = useChat();
  const [input, setInput] = useState('');
  const ai = useAIStatus();
  const canChat = ai.connected && !sending;
  const [conversations, setConversations] = useState([]);
  const scrollRef = useRef(null);

  const refreshConversations = () => {
    if (!isAuthenticated) return;
    getConversations().then(setConversations).catch(() => {});
  };

  useEffect(refreshConversations, [isAuthenticated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (text) => {
    if (!canChat) return;
    setInput('');
    const result = await sendMessage(text);
    if (result && !result.ok && ['not_connected', 'loading', 'disabled'].includes(result.code)) ai.refresh();
    refreshConversations();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSend(input);
  };

  const openConversation = async (id) => {
    const data = await getConversation(id);
    loadConversation(id, data.messages);
  };

  return (
    <section className="py-10">
      <div className="container">
        <span className="eyebrow">AI Salon Assistant</span>
        <h1 className="mb-2">Chat With Us</h1>
        <AIStatusBadge state={ai.state} message={ai.message} className="text-ink-soft mb-8 block" />

        <div className={`grid gap-6 border border-ink/[0.14] bg-paper-dim min-h-[65vh] ${isAuthenticated ? 'md:grid-cols-[240px_1fr]' : 'grid-cols-1'}`}>
          {isAuthenticated && (
            <aside className="border-b md:border-b-0 md:border-r border-ink/[0.14] p-4">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-wider px-3 py-2.5 mb-4 border border-ink/[0.14] rounded-brand hover:border-rose-deep cursor-pointer"
              >
                <FiPlus size={14} /> Start New Chat
              </button>
              <p className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-soft mb-2">History</p>
              <div className="flex flex-col gap-1">
                {conversations.length === 0 && <p className="text-ink-soft text-sm">No conversations yet.</p>}
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    className={`text-left text-sm px-3 py-2 rounded-brand truncate cursor-pointer ${
                      conversationId === c.id ? 'bg-ink text-paper' : 'hover:bg-paper text-ink-soft'
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </aside>
          )}

          <div className="flex flex-col bg-paper">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
              {!isAuthenticated && (
                <p className="text-ink-soft text-xs mb-1">
                  You're chatting as a guest — log in to save your conversation history.
                </p>
              )}
              {messages.length === 0 && (
                <>
                  <div className="bg-paper-dim text-ink text-sm px-4 py-2.5 rounded-brand self-start max-w-[85%]">
                    Hi! I'm the Maison Vera AI Salon Assistant. Ask me anything, or try one of these:
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SUGGESTED.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        disabled={!canChat}
                        className="disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[0.72rem] uppercase tracking-wider text-rose-deep border border-rose-deep/30 rounded-brand px-3 py-2 hover:bg-rose/10 cursor-pointer"
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
              <p className="px-4 py-2 text-sm text-rose-deep border-t border-ink/[0.14]">{ai.message}</p>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-ink/[0.14] p-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={ai.connected ? 'Ask about services, pricing, offers, hours, or booking…' : 'AI assistant not connected'}
                disabled={!ai.connected}
                className="disabled:opacity-50 flex-1 px-4 py-3 text-sm border border-ink/[0.14] rounded-brand bg-paper focus:outline-2 focus:outline-rose-deep"
              />
              <button
                type="submit"
                disabled={!canChat || !input.trim()}
                className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSend size={14} /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
