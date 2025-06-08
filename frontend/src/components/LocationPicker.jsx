import React, { useState, useEffect } from 'react';
import { getNeighborhoods, geocodeAddress } from '../services/api';

const LocationPicker = ({ onLocationChange, initialAddress = '', initialLat = '', initialLng = '' }) => {
  const [address, setAddress] = useState(initialAddress);
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLng);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNeighborhoods();
  }, []);

  useEffect(() => {
    if (latitude && longitude && address) {
      onLocationChange({
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });
    }
  }, [latitude, longitude, address]);

  const loadNeighborhoods = async () => {
    try {
      const data = await getNeighborhoods();
      setNeighborhoods(data);
    } catch (error) {
      console.error('Erro ao carregar bairros:', error);
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length > 2) {
      const filtered = neighborhoods.filter(n => 
        n.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredNeighborhoods(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleNeighborhoodSelect = async (neighborhood) => {
    setAddress(neighborhood + ', Salvador - BA');
    setShowSuggestions(false);
    
    setLoading(true);
    try {
      const coords = await geocodeAddress(neighborhood);
      setLatitude(coords.latitude.toString());
      setLongitude(coords.longitude.toString());
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setAddress('Localização atual, Salvador - BA');
        },
        (error) => {
          alert('Erro ao obter localização. Por favor, selecione um bairro ou digite o endereço.');
        }
      );
    } else {
      alert('Geolocalização não é suportada neste navegador.');
    }
  };

  return (
    <div className="location-picker">
      <div className="form-group">
        <label>Endereço/Bairro em Salvador:</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Digite o bairro ou endereço em Salvador..."
            className="location-input"
          />
          
          {showSuggestions && filteredNeighborhoods.length > 0 && (
            <div className="suggestions-dropdown">
              {filteredNeighborhoods.slice(0, 5).map((neighborhood, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleNeighborhoodSelect(neighborhood)}
                >
                  {neighborhood}, Salvador - BA
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="coordinates-section">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Latitude:</label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="-12.9714"
              step="any"
              readOnly
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label>Longitude:</label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="-38.5014"
              step="any"
              readOnly
            />
          </div>
          
          <button
            type="button"
            onClick={getCurrentLocation}
            className="btn location-btn"
            disabled={loading}
          >
            📍 {loading ? 'Obtendo...' : 'Minha Localização'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .location-picker {
          margin-bottom: 1rem;
        }
        
        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .suggestion-item {
          padding: 0.75rem;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        
        .suggestion-item:hover {
          background-color: #f5f5f5;
        }
        
        .suggestion-item:last-child {
          border-bottom: none;
        }
        
        .coordinates-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }
        
        .location-btn {
          white-space: nowrap;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default LocationPicker;