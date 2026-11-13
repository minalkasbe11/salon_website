import axiosClient from './axiosClient';

export const getNotifications = () =>
  axiosClient.get('/notifications/').then((res) => res.data);

export const markNotificationRead = (id) =>
  axiosClient.patch(`/notifications/${id}/`, { is_read: true }).then((res) => res.data);
