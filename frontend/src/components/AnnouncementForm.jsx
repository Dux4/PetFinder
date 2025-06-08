import React, { useState, useEffect } from 'react';
import { createAnnouncement, getNeighborhoods, getLocationFromCoords } from '../services/api';

const AnnouncementForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    pet_name: '',
    description: '',
    type: 'perdido',
    neighborhood: '',
    latitude: '',
    longitude: ''
  });
  const [image, setImage] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    loadNeighborhoods();
  }, []);

  const loadNeighborhoods = async () => {
    try {
      const data = await getNeighborhoods();
      setNeighborhoods(data);
    } catch (error) {
      console.error('Erro ao carregar bairros:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Simular geocodificação reversa
            const locationData = await getLocationFromCoords(latitude, longitude);
            setFormData(prev => ({
              ...prev,
              neighborhood: locationData.neighborhood,
              latitude: latitude.toString(),
              longitude: longitude.toString()
            }));
            setMessage(`Localização detectada: ${locationData.neighborhood}`);
          } catch (error) {
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString()
            }));
            setMessage('Localização obtida! Selecione o bairro manualmente.');
          }
          setGettingLocation(false);
        },
        (error) => {
          setMessage('Erro ao obter localização. Selecione o bairro manualmente.');
          setGettingLocation(false);
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
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
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
        neighborhood: '',
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

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="announcement-form-container">
      <div className="form-card">
        <h2>Criar Novo Anúncio</h2>
        
        {message && (
          <div className={message.includes('sucesso') ? 'success' : 'info'}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="announcement-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Animal:</label>
              <input
                type="text"
                name="pet_name"
                value={formData.pet_name}
                onChange={handleInputChange}
                required
                placeholder="Ex: Rex, Mimi, Buddy..."
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
                <option value="perdido">🔍 Animal Perdido</option>
                <option value="encontrado">🏠 Animal Encontrado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descrição:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              required
              placeholder="Descreva o animal: porte, cor, características, onde foi visto pela última vez..."
            />
          </div>

          <div className="form-group">
            <label>Foto do Animal:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="file-input"
            />
            {image && (
              <div className="image-preview">
                <span>📸 {image.name}</span>
              </div>
            )}
          </div>

          <div className="location-section">
            <div className="location-header">
              <label>Localização em Salvador:</label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="btn btn-location"
              >
                {gettingLocation ? '🔄 Obtendo...' : '📍 Obter Localização'}
              </button>
            </div>

            <div className="form-group">
              <label>Bairro:</label>
              <select
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione o bairro</option>
                {neighborhoods.map(neighborhood => (
                  <option key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={loading}
          >
            {loading ? 'Criando Anúncio...' : 'Criar Anúncio'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .announcement-form-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .form-card h2 {
          color: #333;
          margin-bottom: 2rem;
          text-align: center;
          font-size: 1.8rem;
        }

        .announcement-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #555;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .file-input {
          padding: 0.5rem !important;
        }

        .image-preview {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 4px;
          color: #666;
          font-size: 0.9rem;
        }

        .location-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px dashed #dee2e6;
        }

        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .location-header label {
          font-weight: 600;
          color: #555;
          margin: 0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .btn-location {
          background: #28a745;
          color: white;
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
        }

        .btn-location:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
        }

        .btn-location:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 1.1rem;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }

        .btn-submit {
          margin-top: 1rem;
          padding: 1rem 2rem;
        }

        .success, .info {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .success {
          background: #dcfce7;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .info {
          background: #dbeafe;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .location-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .btn-location {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementForm;