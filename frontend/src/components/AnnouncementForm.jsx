import React, { useState } from 'react';
import { createAnnouncement } from '../services/api';

const AnnouncementForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    pet_name: '',
    description: '',
    type: 'perdido',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
          setMessage('Localização obtida com sucesso!');
        },
        (error) => {
          setMessage('Erro ao obter localização. Digite manualmente.');
        }
      );
    } else {
      setMessage('Geolocalização não é suportada neste navegador.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      if (image) {
        submitData.append('image', image);
      }

      await createAnnouncement(submitData);
      setMessage('Anúncio criado com sucesso!');
      
      // Reset form
      setFormData({
        pet_name: '',
        description: '',
        type: 'perdido',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        address: '',
        latitude: '',
        longitude: ''
      });
      setImage(null);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage('Erro ao criar anúncio: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Criar Novo Anúncio</h2>
      {message && (
        <div className={message.includes('sucesso') ? 'success' : 'error'}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nome do Animal:</label>
          <input
            type="text"
            name="pet_name"
            value={formData.pet_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo de Anúncio:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
          >
            <option value="perdido">Animal Perdido</option>
            <option value="encontrado">Animal Encontrado</option>
          </select>
        </div>

        <div className="form-group">
          <label>Descrição:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            placeholder="Descreva o animal, características, quando e onde foi visto..."
            required
          />
        </div>

        <div className="form-group">
          <label>Foto do Animal:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="form-group">
          <label>Nome para Contato:</label>
          <input
            type="text"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Telefone:</label>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Endereço/Local:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Endereço ou descrição do local"
          />
        </div>

        <div className="form-group">
          <label>Localização:</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="Latitude"
              step="any"
              required
              style={{ flex: 1 }}
            />
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="Longitude"
              step="any"
              required
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn"
              style={{ whiteSpace: 'nowrap' }}
            >
              📍 Obter Localização
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar Anúncio'}
        </button>
      </form>
    </div>
  );
};

export default AnnouncementForm;