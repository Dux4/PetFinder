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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Criar Novo Anúncio
        </h2>
        
        {message && (
          <div className={`p-4 rounded-lg mb-6 text-center ${
            message.includes('sucesso') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-600">
                Nome do Animal:
              </label>
              <input
                type="text"
                name="pet_name"
                value={formData.pet_name}
                onChange={handleInputChange}
                required
                placeholder="Ex: Rex, Mimi, Buddy..."
                className="p-4 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-600">
                Tipo de Anúncio:
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="p-4 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="perdido">🔍 Animal Perdido</option>
                <option value="encontrado">🏠 Animal Encontrado</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-600">
              Descrição:
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              required
              placeholder="Descreva o animal: porte, cor, características, onde foi visto pela última vez..."
              className="p-4 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-500 resize-vertical"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-600">
              Foto do Animal:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="p-2 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-500"
            />
            {image && (
              <div className="mt-2 p-2 bg-gray-50 rounded border text-gray-600 text-sm">
                📸 {image.name}
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
              <label className="font-semibold text-gray-600">
                Localização em Salvador:
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-0.5 text-sm md:w-auto w-full"
              >
                {gettingLocation ? '🔄 Obtendo...' : '📍 Obter Localização'}
              </button>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-600">
                Bairro:
              </label>
              <select
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                required
                className="p-4 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-500"
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
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl text-lg mt-4"
            disabled={loading}
          >
            {loading ? 'Criando Anúncio...' : 'Criar Anúncio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementForm;