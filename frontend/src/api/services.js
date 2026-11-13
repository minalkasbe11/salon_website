import axiosClient from './axiosClient';

export const getServiceCategories = () =>
  axiosClient.get('/service-categories/').then((res) => res.data);

export const getServices = () =>
  axiosClient.get('/services/').then((res) => res.data);
