import axiosClient from './axiosClient';

export const sendChatMessage = ({ message, conversation_id, history }) =>
  axiosClient.post('/chatbot/message/', { message, conversation_id, history }).then((res) => res.data);

export const getConversations = () =>
  axiosClient.get('/chatbot/conversations/').then((res) => res.data);

export const getConversation = (id) =>
  axiosClient.get(`/chatbot/conversations/${id}/`).then((res) => res.data);

// Is the local AI model connected? -> { connected, state, message }
export const getAIStatus = () =>
  axiosClient.get('/chatbot/status/').then((res) => res.data);