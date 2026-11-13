import { useCallback, useEffect, useState } from 'react';
import { getAIStatus } from '../api/chatbot';

const POLL_MS = 30000;

// Asks Django whether the local AI model is connected, every 30 s while `enabled`
// and whenever the tab gets focus again. state: 'checking' | 'connected' | 'loading'
// | 'not_connected' | 'disabled'.
export default function useAIStatus(enabled = true) {
  const [status, setStatus] = useState({ connected: false, state: 'checking', message: 'Checking AI assistant…' });

  const refresh = useCallback(async () => {
    try {
      setStatus(await getAIStatus());
    } catch {
      setStatus({ connected: false, state: 'not_connected', message: 'AI assistant is not connected right now. Please try again later.' });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [enabled, refresh]);

  return { ...status, refresh };
}