import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, Modal, Alert } from 'react-native';
import * as Location from 'expo-location';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (position: [number, number]) => void;
  currentPosition: [number, number] | null;
}

declare global {
  interface Window {
    L: any;
  }
}

const LeafletLocationPicker: React.FC<{
  selectedPosition: [number, number];
  onPositionChange: (position: [number, number]) => void;
}> = ({ selectedPosition, onPositionChange }) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      // Carrega CSS do Leaflet
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Carrega JS do Leaflet
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initializeMap();
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      const mapElement = document.getElementById('location-picker-map');
      if (mapElement && window.L) {
        mapElement.innerHTML = '';

        const map = window.L.map('location-picker-map').setView(selectedPosition, 13);
        mapRef.current = map;

        // Tiles do OpenStreetMap
        window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Marcador draggable
        const marker = window.L.marker(selectedPosition, {
          draggable: true
        }).addTo(map);
        
        markerRef.current = marker;

        // Event listeners
        marker.on('dragend', function() {
          const position = marker.getLatLng();
          onPositionChange([position.lat, position.lng]);
        });

        map.on('click', function(e: any) {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          onPositionChange([lat, lng]);
        });
      }
    };

    loadLeaflet();
  }, []);

  // Atualizar posição do marcador
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng(selectedPosition);
      mapRef.current.setView(selectedPosition, mapRef.current.getZoom());
    }
  }, [selectedPosition]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        id="location-picker-map" 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '300px',
          borderRadius: '8px'
        }} 
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxWidth: '280px'
      }}>
        💡 Clique no mapa ou arraste o marcador para selecionar a localização
      </div>
    </div>
  );
};

const LocationPickerModalWeb: React.FC<LocationPickerModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentPosition 
}) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(
    currentPosition || [-12.9714, -38.5014]
  );

  const handleConfirm = () => {
    if (selectedPosition) {
      onConfirm(selectedPosition);
    }
    onClose();
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'A permissão de localização é necessária para esta função.');
        return;
      }
      
      const position = await Location.getCurrentPositionAsync({});
      const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
      setSelectedPosition(newPos);
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a sua localização atual.');
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-2xl w-full max-w-4xl h-5/6 overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="bg-indigo-600 p-6 flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-2">
                Selecione a Localização
              </Text>
              <Text className="text-indigo-100 text-sm">
                Clique no mapa para marcar o local exato
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              className="w-8 h-8 justify-center items-center"
            >
              <Text className="text-white text-2xl font-bold">×</Text>
            </TouchableOpacity>
          </View>

          {/* Controles */}
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
            <View className="flex-1">
              {selectedPosition && (
                <Text className="text-xs text-gray-600">
                  📍 Lat: {selectedPosition[0].toFixed(6)}, Lng: {selectedPosition[1].toFixed(6)}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={getCurrentLocation} 
              className="bg-green-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold text-sm">
                📱 Usar Minha Localização
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mapa */}
          <View className="flex-1">
            <LeafletLocationPicker 
              selectedPosition={selectedPosition} 
              onPositionChange={setSelectedPosition}
            />
          </View>

          {/* Footer */}
          <View className="px-6 py-5 border-t border-gray-200 bg-gray-50 flex-row justify-end gap-3">
            <TouchableOpacity 
              onPress={onClose} 
              className="bg-white border-2 border-gray-300 px-6 py-3 rounded-lg"
            >
              <Text className="text-gray-700 font-semibold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm} 
              className="bg-indigo-600 px-6 py-3 rounded-lg"
              disabled={!selectedPosition}
            >
              <Text className="text-white font-semibold">Confirmar Localização</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationPickerModalWeb;