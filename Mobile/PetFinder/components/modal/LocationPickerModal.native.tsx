import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

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
        <View className="bg-purple-600 pt-12 pb-4 px-5 shadow-lg">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-1 flex-row items-center gap-2">
              <MaterialIcons name="location-on" size={24} color="white" />
              <Text className="text-xl font-bold text-white">
                Selecione a Localização
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              className="w-10 h-10 bg-white/20 rounded-full justify-center items-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-purple-100 text-sm">
            Toque no mapa ou arraste o marcador
          </Text>
        </View>

        {/* Info Card */}
        <View className="bg-purple-50 mx-4 mt-4 p-4 rounded-xl border border-purple-200">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center mr-3">
              <Ionicons name="information" size={18} color="white" />
            </View>
            <Text className="text-purple-900 font-semibold text-base flex-1">
              Como usar:
            </Text>
          </View>
          <View className="flex-row items-start mb-2">
            <MaterialIcons name="touch-app" size={18} color="#7c3aed" />
            <Text className="text-purple-700 text-sm ml-2 flex-1">
              Toque em qualquer ponto do mapa
            </Text>
          </View>
          <View className="flex-row items-start mb-2">
            <MaterialIcons name="open-with" size={18} color="#7c3aed" />
            <Text className="text-purple-700 text-sm ml-2 flex-1">
              Arraste o marcador para ajustar
            </Text>
          </View>
          <View className="flex-row items-start">
            <MaterialIcons name="my-location" size={18} color="#7c3aed" />
            <Text className="text-purple-700 text-sm ml-2 flex-1">
              Use o botão abaixo para pegar sua localização
            </Text>
          </View>
        </View>

        {/* Botão de Localização Atual */}
        <View className="mx-4 mt-4">
          <TouchableOpacity 
            onPress={getCurrentLocation} 
            className="bg-purple-600 py-3.5 px-4 rounded-xl flex-row items-center justify-center shadow-lg active:bg-purple-700"
          >
            <MaterialIcons name="my-location" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Usar Minha Localização Atual
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mapa */}
        <View className="flex-1 m-4 rounded-2xl overflow-hidden shadow-lg border-2 border-purple-200">
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={StyleSheet.absoluteFillObject}
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
              pinColor="#7c3aed"
            />
          </MapView>
        </View>

        {/* Footer Buttons */}
        <View className="px-4 pb-6 pt-2 bg-white border-t border-gray-200 flex-row gap-3">
          <TouchableOpacity 
            onPress={onClose} 
            className="flex-1 bg-white border-2 border-gray-300 py-4 rounded-xl flex-row items-center justify-center active:bg-gray-50"
          >
            <Ionicons name="close-circle-outline" size={20} color="#374151" />
            <Text className="text-gray-700 font-bold text-base ml-2">
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleConfirm} 
            className="flex-1 bg-purple-600 py-4 rounded-xl flex-row items-center justify-center active:bg-purple-700"
            disabled={!selectedPosition}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Confirmar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationPickerModalNative;