import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (position: [number, number]) => void;
  currentPosition: [number, number] | null;
}

const LocationPickerModalNative: React.FC<LocationPickerModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentPosition 
}) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(
    currentPosition || [-12.9714, -38.5014]
  );
  const mapRef = useRef<MapView>(null);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedPosition([latitude, longitude]);
  };

  const handleMarkerDragEnd = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedPosition([latitude, longitude]);
  };

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
      
      // Animar o mapa para a nova posição
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: newPos[0],
          longitude: newPos[1],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a sua localização atual.');
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-indigo-600 pt-12 pb-4 px-5 shadow-lg">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                Selecione a Localização
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              className="w-10 h-10 bg-white/20 rounded-full justify-center items-center"
            >
              <Text className="text-white text-2xl font-bold">×</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-indigo-100 text-sm">
            Toque no mapa ou arraste o marcador
          </Text>
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl border border-blue-200">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">💡</Text>
            <Text className="text-blue-900 font-semibold flex-1">
              Como usar:
            </Text>
          </View>
          <Text className="text-blue-700 text-sm mb-1">
            • Toque em qualquer ponto do mapa
          </Text>
          <Text className="text-blue-700 text-sm mb-1">
            • Arraste o marcador 📍 para ajustar
          </Text>
          <Text className="text-blue-700 text-sm">
            • Use o botão abaixo para pegar sua localização
          </Text>
        </View>

        {/* Coordenadas */}
        <View className="bg-gray-50 mx-4 mt-3 p-3 rounded-lg border border-gray-200">
          <Text className="text-gray-600 text-xs mb-1 font-semibold">
            Coordenadas Selecionadas:
          </Text>
          <Text className="text-gray-800 text-sm">
            📍 Lat: {selectedPosition[0].toFixed(6)}, Lng: {selectedPosition[1].toFixed(6)}
          </Text>
        </View>

        {/* Botão de Localização Atual */}
        <View className="mx-4 mt-3">
          <TouchableOpacity 
            onPress={getCurrentLocation} 
            className="bg-green-500 py-3 px-4 rounded-xl flex-row items-center justify-center shadow-lg active:bg-green-600"
          >
            <Text className="text-lg mr-2">📱</Text>
            <Text className="text-white font-bold text-base">
              Usar Minha Localização Atual
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mapa */}
        <View className="flex-1 m-4 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: selectedPosition[0],
              longitude: selectedPosition[1],
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{
                latitude: selectedPosition[0],
                longitude: selectedPosition[1],
              }}
              draggable
              onDragEnd={handleMarkerDragEnd}
              pinColor="#4F46E5"
            />
          </MapView>
        </View>

        {/* Footer Buttons */}
        <View className="px-4 pb-6 pt-2 bg-white border-t border-gray-200 flex-row gap-3">
          <TouchableOpacity 
            onPress={onClose} 
            className="flex-1 bg-white border-2 border-gray-300 py-4 rounded-xl active:bg-gray-50"
          >
            <Text className="text-gray-700 font-bold text-center text-base">
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleConfirm} 
            className="flex-1 bg-indigo-600 py-4 rounded-xl active:bg-indigo-700"
            disabled={!selectedPosition}
          >
            <Text className="text-white font-bold text-center text-base">
              Confirmar Local
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationPickerModalNative;