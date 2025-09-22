import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  Alert,
  Platform 
} from 'react-native';
import * as Location from 'expo-location';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (position: [number, number]) => void;
  currentPosition: [number, number] | null;
}

const LeafletLocationPicker: React.FC<{
  selectedPosition: [number, number];
  onPositionChange: (position: [number, number]) => void;
}> = ({ selectedPosition, onPositionChange }) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const loadLeaflet = async () => {
        // Carregue o CSS do Leaflet
        if (!document.querySelector('#leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Carregue o JS do Leaflet
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
          // Limpe o mapa existente se houver
          mapElement.innerHTML = '';

          const map = window.L.map('location-picker-map').setView(selectedPosition, 13);
          mapRef.current = map;

          // Adicione tiles do OpenStreetMap
          window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map);

          // Adicione marcador inicial
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
    }
  }, []);

  // Atualizar posição do marcador quando selectedPosition mudar
  useEffect(() => {
    if (mapRef.current && markerRef.current && Platform.OS === 'web') {
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
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        💡 Clique no mapa ou arraste o marcador para selecionar a localização
      </div>
    </div>
  );
};

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ 
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

  if (Platform.OS !== 'web') {
    return (
      <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Seleção de Localização</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.unsupportedContainer}>
              <Text style={styles.unsupportedText}>
                Seleção de localização no mapa disponível apenas na versão web.
              </Text>
              <Text style={styles.unsupportedSubtext}>
                Use o aplicativo mobile para funcionalidade completa de geolocalização.
              </Text>
            </View>
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Selecione a Localização</Text>
              <Text style={styles.headerSubtitle}>
                Clique no mapa para marcar o local exato
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Controles */}
          <View style={styles.controls}>
            <View style={styles.coordsDisplay}>
              {selectedPosition && (
                <Text style={styles.coordsText}>
                  📍 Lat: {selectedPosition[0].toFixed(6)}, Lng: {selectedPosition[1].toFixed(6)}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={getCurrentLocation} style={styles.myLocationButton}>
              <Text style={styles.myLocationButtonText}>📱 Usar Minha Localização</Text>
            </TouchableOpacity>
          </View>

          {/* Mapa */}
          <View style={styles.mapWrapper}>
            <LeafletLocationPicker 
              selectedPosition={selectedPosition} 
              onPositionChange={setSelectedPosition}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm} 
              style={[styles.button, styles.confirmButton]} 
              disabled={!selectedPosition}
            >
              <Text style={styles.confirmButtonText}>Confirmar Localização</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    height: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  coordsDisplay: {
    flex: 1,
  },
  coordsText: {
    fontSize: 12,
    color: '#4B5563',
  },
  myLocationButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  myLocationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  mapWrapper: {
    flex: 1,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unsupportedText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  unsupportedSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

// Declarações TypeScript para window
declare global {
  interface Window {
    L: any;
  }
}

export default LocationPickerModal;