import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, Modal, Alert } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

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

        // Marcador draggable customizado com ícone roxo
        const customIcon = window.L.divIcon({
          className: 'custom-location-marker',
          html: `<div style="
            width: 40px;
            height: 40px;
            background: #7c3aed;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        const marker = window.L.marker(selectedPosition, {
          draggable: true,
          icon: customIcon
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

        // Adicionar CSS customizado
        if (!document.querySelector('#custom-location-marker-style')) {
          const style = document.createElement('style');
          style.id = 'custom-location-marker-style';
          style.textContent = `
            .custom-location-marker {
              transition: transform 0.2s ease;
            }
            .custom-location-marker:hover {
              transform: scale(1.1);
            }
          `;
          document.head.appendChild(style);
        }
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
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxWidth: '280px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid #e9d5ff'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7c3aed" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <span style={{ color: '#6d28d9', fontWeight: '500' }}>
          Clique no mapa ou arraste o marcador
        </span>
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
          <View className="bg-purple-600 p-6 flex-row justify-between items-center">
            <View className="flex-1 flex-row items-center gap-3">
              <MaterialIcons name="location-on" size={28} color="white" />
              <View>
                <Text className="text-xl font-bold text-white mb-1">
                  Selecione a Localização
                </Text>
                <Text className="text-purple-100 text-sm">
                  Clique no mapa para marcar o local exato
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              className="w-10 h-10 bg-white/20 rounded-full justify-center items-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Controles */}
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-purple-100 bg-purple-50">
            <View className="flex-1 flex-row items-center gap-2">
              {selectedPosition && (
                <>
                  <MaterialIcons name="gps-fixed" size={16} color="#7c3aed" />
                  <Text className="text-xs text-purple-700 font-medium">
                    Lat: {selectedPosition[0].toFixed(6)}, Lng: {selectedPosition[1].toFixed(6)}
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity 
              onPress={getCurrentLocation} 
              className="bg-purple-600 px-4 py-2 rounded-lg flex-row items-center gap-2 shadow-md active:bg-purple-700"
            >
              <MaterialIcons name="my-location" size={18} color="white" />
              <Text className="text-white font-semibold text-sm">
                Minha Localização
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
              className="bg-white border-2 border-gray-300 px-6 py-3 rounded-lg flex-row items-center gap-2 active:bg-gray-50"
            >
              <Ionicons name="close-circle-outline" size={20} color="#374151" />
              <Text className="text-gray-700 font-semibold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm} 
              className="bg-purple-600 px-6 py-3 rounded-lg flex-row items-center gap-2 shadow-md active:bg-purple-700"
              disabled={!selectedPosition}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-semibold">Confirmar Localização</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationPickerModalWeb;