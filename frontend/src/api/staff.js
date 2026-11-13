import axiosClient from './axiosClient';

export const getStaff = (serviceId) =>
  axiosClient
    .get('/staff/', { params: serviceId ? { service: serviceId } : {} })
    .then((res) => res.data);
