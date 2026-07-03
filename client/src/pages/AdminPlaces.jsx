import { useState, useEffect } from 'react';
import api from '../services/api';
import { uploadImage } from '../services/uploadService';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['beach', 'historical', 'nature', 'city', 'adventure', 'cultural', 'hotel', 'restaurant', 'cafe', 'shopping'];

export default function AdminPlaces() {
  const { showToast } = useToast();
  const [places, setPlaces] = useState([]);
  const [form, setForm] = useState({
    name: '',
    country: '',
    city: '',
    description: '',
    category: 'cultural',
    latitude: '',
    longitude: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const res = await api.get('/places');
      setPlaces(res.data);
    } catch {
      showToast('Failed to load places.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({ name: '', country: '', city: '', description: '', category: 'cultural', latitude: '', longitude: '' });
    setImageFile(null);
    setImagePreview('');
    setExistingImages([]);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let images = [...existingImages];

      if (imageFile) {
        setUploading(true);
        const newUrl = await uploadImage(imageFile);
        setUploading(false);
        images = [...images, newUrl];
      }

      const payload = {
        name: form.name,
        country: form.country,
        city: form.city,
        description: form.description,
        category: form.category,
        images,
        latitude: form.latitude !== '' ? Number(form.latitude) : '',
        longitude: form.longitude !== '' ? Number(form.longitude) : '',
      };

      if (editingId) {
        await api.put(`/places/${editingId}`, payload);
        showToast('Place updated successfully.');
      } else {
        await api.post('/places', payload);
        showToast('Place added successfully.');
      }

      resetForm();
      fetchPlaces();
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleEdit = (place) => {
    setEditingId(place._id);
    setForm({
      name: place.name,
      country: place.country,
      city: place.city || '',
      description: place.description,
      category: place.category,
      latitude: place.latitude ?? '',
      longitude: place.longitude ?? '',
    });
    setExistingImages(place.images || []);
    setImagePreview(place.images?.[0] || '');
    setImageFile(null);
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    if (index === 0) setImagePreview(existingImages[1] || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this place? This cannot be undone.')) return;
    try {
      await api.delete(`/places/${id}`);
      showToast('Place deleted.');
      fetchPlaces();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete place.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-serif font-bold text-teal mb-5">Manage Places</h1>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-charcoal/10 p-5 rounded-lg mb-8">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          required
        />
        <div className="flex gap-3">
          <input
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
            required
          />
          <input
            name="city"
            placeholder="City (optional)"
            value={form.city}
            onChange={handleChange}
            className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </div>
        <div className="flex gap-3">
          <input
            name="latitude"
            placeholder="Latitude (e.g., 48.8566)"
            type="number"
            step="any"
            value={form.latitude}
            onChange={handleChange}
            className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
          <input
            name="longitude"
            placeholder="Longitude (e.g., 2.3522)"
            type="number"
            step="any"
            value={form.longitude}
            onChange={handleChange}
            className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </div>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border border-warmgray/40 rounded w-full p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          required
        />

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <p className="text-sm text-warmgray mb-1">Current images (click × to remove):</p>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="h-16 w-24 object-cover rounded border border-charcoal/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-red-700 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Image Upload */}
        <div>
          <label className="text-sm text-warmgray block mb-1">
            {existingImages.length > 0 ? 'Add another image' : 'Image'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border border-warmgray/40 rounded w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
          {imageFile && imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 h-32 w-full object-cover rounded-lg border border-charcoal/10"
            />
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="font-medium px-5 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#C2613D', color: '#F0EBE3' }}
          >
            {uploading ? 'Uploading image...' : submitting ? 'Saving...' : editingId ? 'Update Place' : 'Add Place'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-warmgray hover:text-charcoal font-medium px-3 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Places List */}
      {loading ? (
        <p className="text-warmgray">Loading places...</p>
      ) : places.length === 0 ? (
        <p className="text-warmgray">No places yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {places.map((place) => (
            <div key={place._id} className="bg-white border border-charcoal/10 rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {place.images?.[0] && (
                  <img
                    src={place.images[0]}
                    alt={place.name}
                    className="h-12 w-16 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-semibold text-teal">{place.name}</p>
                  <p className="text-sm text-warmgray">
                    {place.city ? `${place.city}, ` : ''}{place.country} · {place.category}
                    {place.images?.length > 1 && (
                      <span className="ml-2 text-xs text-terracotta">{place.images.length} images</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => handleEdit(place)} className="text-teal hover:text-terracotta font-medium transition-colors">Edit</button>
                <button onClick={() => handleDelete(place._id)} className="text-red-700 hover:text-red-900 font-medium transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}