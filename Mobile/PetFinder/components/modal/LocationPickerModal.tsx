import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  Alert,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import MapComponent from '../ui/MapComponent'; // Importação do componente de mapa

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (position: [number, number]) => void;
  currentPosition: [number, number] | null;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentPosition 
}) => {
  const [selectedPosition, setSelectedPosition] = useState(
    currentPosition || [-12.9714, -38.5014]
  );
  const mapRef = useRef<any>(null); // Usamos `any` para compatibilidade com o componente web

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
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: newPos[0],
          longitude: newPos[1],
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
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
            <MapComponent
              mapRef={mapRef}
              selectedPosition={selectedPosition}
              onPress={(e) => setSelectedPosition([e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude])}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]} disabled={!selectedPosition}>
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
    backgroundColor: '#4F46E5', // Cor sólida para o gradiente
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
    borderRadius: 9999,
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
  map: {
    width: '100%',
    height: '100%',
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
    backgroundColor: '#4F46E5', // Cor sólida para o gradiente
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default LocationPickerModal;