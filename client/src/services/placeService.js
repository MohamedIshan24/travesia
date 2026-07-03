import api from './api';

export const getPlaces = async (params = {}) => {
  // params can include { search, page, limit, etc. }
  const res = await api.get('/places', { params });
  return res.data;
};

export const getPlaceById = async (id) => {
  const res = await api.get(`/places/${id}`);
  return res.data;
};

export const createPlace = async (placeData) => {
  const res = await api.post('/places', placeData);
  return res.data;
};

export const updatePlace = async (id, placeData) => {
  const res = await api.put(`/places/${id}`, placeData);
  return res.data;
};

export const deletePlace = async (id) => {
  const res = await api.delete(`/places/${id}`);
  return res.data;
};