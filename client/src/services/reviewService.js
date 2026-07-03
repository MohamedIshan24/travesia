import api from './api';

export const getReviewsForPlace = async (placeId) => {
  const res = await api.get(`/reviews/place/${placeId}`);
  return res.data;
};

export const getMyReviews = async () => {
  const res = await api.get('/reviews/my');
  return res.data;
};

export const createReview = async (placeId, rating, comment) => {
  const res = await api.post(`/reviews/place/${placeId}`, { rating, comment });
  return res.data;
};

export const updateReview = async (reviewId, rating, comment) => {
  const res = await api.put(`/reviews/${reviewId}`, { rating, comment });
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
};