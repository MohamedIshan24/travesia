import api from './api';

export const getFavorites = async () => {
  const res = await api.get('/favorites');
  return res.data;
};

export const addFavorite = async (placeId) => {
  const res = await api.post(`/favorites/${placeId}`);
  return res.data;
};

export const removeFavorite = async (placeId) => {
  const res = await api.delete(`/favorites/${placeId}`);
  return res.data;
};