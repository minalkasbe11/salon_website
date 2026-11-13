import axiosClient from './axiosClient';

export const getTestimonials = () =>
  axiosClient.get('/testimonials/').then((res) => res.data);

export const getOffers = () =>
  axiosClient.get('/offers/').then((res) => res.data);

export const getGallery = (categoryId) =>
  axiosClient
    .get('/gallery/', { params: categoryId ? { category: categoryId } : {} })
    .then((res) => res.data);
