import axiosClient from './axiosClient';

export const getAvailableSlots = ({ service, date, staff }) =>
  axiosClient
    .get('/appointments/available-slots/', { params: { service, date, ...(staff ? { staff } : {}) } })
    .then((res) => res.data);

export const createAppointment = (data) =>
  axiosClient.post('/appointments/', data).then((res) => res.data);

export const getMyAppointments = () =>
  axiosClient.get('/appointments/').then((res) => res.data);

export const cancelAppointment = (id) =>
  axiosClient.post(`/appointments/${id}/cancel/`).then((res) => res.data);
