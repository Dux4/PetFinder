import React, { useState, useEffect } from 'react';
import { createAnnouncement, getNeighborhoods } from '../services/api';
import LocationPickerModal from '../modal/LocationPickerModal';

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
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  const handleLocationConfirm = (position) => {
    setSelectedLocation(position);
    setFormData(prev => ({
      ...prev,
      latitude: position[0].toString(),
      longitude: position[1].toString()
    }));
    setMessage(`Localização selecionada: Lat ${position[0].toFixed(4)}, Lng ${position[1].toFixed(4)}`);
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
      setSelectedLocation(null);
      
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
    <>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Criar Novo Anúncio
          </h2>
          
          {message && (
            <div className={`p-4 rounded-lg mb-6 text-center ${
              message.includes('sucesso') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : message.includes('Erro')
                ? 'bg-red-50 text-red-700 border border-red-200'
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

            {/* Seção de Localização */}
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
              <h3 className="font-semibold text-gray-700 mb-4 text-lg">📍 Localização</h3>
              
              {/* Campo do Bairro */}
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-600">
                  Bairro (para exibição):
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Barra, Ondina, Rio Vermelho..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Seleção de Coordenadas */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold text-gray-600 mb-2">
                      Localização no Mapa:
                    </label>
                    {selectedLocation ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <span className="text-green-500">✓</span>
                          <span className="font-medium">Localização selecionada</span>
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          Coordenadas: {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <span className="text-yellow-500">⚠</span>
                          <span className="font-medium">Localização não selecionada</span>
                        </div>
                        <div className="text-sm text-yellow-600 mt-1">
                          Clique no botão abaixo para escolher o local no mapa
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    🗺️ {selectedLocation ? 'Alterar Local' : 'Escolher no Mapa'}
                  </button>
                </div>
              </div>
            </div>

            {/* Campos ocultos para coordenadas */}
            <input type="hidden" name="latitude" value={formData.latitude} />
            <input type="hidden" name="longitude" value={formData.longitude} />

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl text-lg mt-4"
              disabled={loading || !formData.latitude || !formData.longitude}
            >
              {loading ? 'Criando Anúncio...' : 'Criar Anúncio'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Localização */}
      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
        currentPosition={selectedLocation}
      />
    </>
  );
};

export default AnnouncementForm;