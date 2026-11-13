import { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../api/chatbot';
import useAuth from './useAuth';

const HISTORY_LIMIT = 8;

export default function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]); // [{ sender: 'user'|'assistant', content }]
  const [conversationId, setConversationId] = useState(null);
  const [sending, setSending] = useState(false);

  // The floating widget (and the public /ai-assistant page) stay mounted across
  // login/logout, since neither is gated behind an auth-redirect. Without this,
  // switching accounts on the same tab could leave the previous user's messages
  // visibly on screen. Reset whenever the logged-in identity actually changes.
  const prevUserIdRef = useRef(user?.id ?? null);
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;
      setMessages([]);
      setConversationId(null);
    }
  }, [user?.id]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Captured before the state update below, so it's everything up to (not
    // including) this new message — guests have no server-side history, so this
    // is what lets the bot resolve follow-ups and answers to clarifying questions.
    // Error notices (AI not connected, busy…) are not part of the conversation, so they
    // are never sent back as history.
    const history = messages
      .filter((m) => !m.error)
      .slice(-HISTORY_LIMIT)
      .map(({ sender, content }) => ({ sender, content }));

    setMessages((prev) => [...prev, { sender: 'user', content: trimmed }]);
    setSending(true);
    try {
      const res = await sendChatMessage({ message: trimmed, conversation_id: conversationId, history });
      setConversationId(res.conversation_id);
      setMessages((prev) => [...prev, { sender: 'assistant', content: res.reply }]);
      return { ok: true };
    } catch (err) {
      // Django sends a customer-friendly reason, e.g. "AI assistant is not connected right now."
      const detail = err.response?.data?.detail;
      const code = err.response?.data?.code || (err.response ? 'error' : 'not_connected');
      const content =
        typeof detail === 'string' ? detail : err.response ? 'Sorry, something went wrong. Please try again.' : 'Cannot reach the server. Please check your connection.';
      setMessages((prev) => [...prev, { sender: 'assistant', content, error: true }]);
      return { ok: false, code };
    } finally {
      setSending(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const loadConversation = (id, loadedMessages) => {
    setConversationId(id);
    setMessages(loadedMessages.map((m) => ({ sender: m.sender, content: m.content })));
  };

  return { messages, sendMessage, sending, conversationId, startNewChat, loadConversation };
}