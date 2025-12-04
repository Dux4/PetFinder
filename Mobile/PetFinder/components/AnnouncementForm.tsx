import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Image as RNImage,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { createAnnouncement } from '../services/api'; 
import LocationPickerModal from './modal/LocationPickerModal';
import * as FileSystem from 'expo-file-system';

// --- CONSTANTES: LIMITES DE SALVADOR (Geofence) ---
const SALVADOR_LIMITS = {
  minLat: -13.05, // Sul (Farol da Barra e ilhas próximas)
  maxLat: -12.70, // Norte (Divisa com Lauro de Freitas/Aeroporto)
  minLng: -38.70, // Oeste (Baía de Todos os Santos)
  maxLng: -38.20  // Leste (Praias do Flamengo/Stella Maris)
};
// --------------------------------------------------

interface FormData {
  pet_name: string;
  description: string;
  type: 'perdido' | 'encontrado';
  neighborhood: string;
  latitude: string;
  longitude: string;
}

interface AnnouncementFormProps {
  onSuccess?: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    pet_name: '',
    description: '',
    type: 'perdido',
    neighborhood: '',
    latitude: '',
    longitude: ''
  });
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  
  const [loadingGeo, setLoadingGeo] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria para enviar fotos.');
    }
    const locationStatus = await Location.requestForegroundPermissionsAsync();
    if (locationStatus.status !== 'granted') {
      console.log('Permissão de localização negada');
    }
  };

  const readImageAsBase64 = async (uri: string) => {
    try {
      if (!uri) return null;
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('ERRO: Falha ao ler imagem:', error);
      return null;
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        setImageUri(selectedImage.uri);
        setImageMimeType(selectedImage.mimeType || 'image/jpeg');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleLocationConfirm = async (position: [number, number]) => {
    const lat = position[0];
    const lng = position[1];

    // --- NOVA VALIDAÇÃO: LIMITAR A SALVADOR ---
    if (
      lat < SALVADOR_LIMITS.minLat || 
      lat > SALVADOR_LIMITS.maxLat || 
      lng < SALVADOR_LIMITS.minLng || 
      lng > SALVADOR_LIMITS.maxLng
    ) {
      Alert.alert(
        'Localização Fora da Área', 
        'No momento, o aplicativo aceita apenas localizações em Salvador.'
      );
      // Não fecha o modal, permitindo ao usuário escolher novamente
      return;
    }
    // ------------------------------------------

    setSelectedLocation(position);
    setShowLocationModal(false);
    setLoadingGeo(true); 

    let fullAddress = '';

    try {
      if (Platform.OS === 'web') {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { 'User-Agent': 'PetFinderApp/1.0' } }
        );
        const data = await response.json();
        
        if (data && data.address) {
          const addr = data.address;
          const street = addr.road || addr.pedestrian || addr.footway || '';
          const district = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || addr.city || '';

          if (street && district) {
            fullAddress = `${street} - ${district}`;
          } else {
            fullAddress = street || district || '';
          }
        }
      } else {
        const address = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng
        });

        if (address.length > 0) {
          const place = address[0];
          const street = place.street || place.name || '';
          const district = place.district || place.subregion || place.city || '';

          if (street && district && street !== district) {
             fullAddress = `${street} - ${district}`;
          } else {
             fullAddress = street || district || '';
          }
        }
      }
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
    }

    const finalAddress = fullAddress || 'Localização no Mapa';

    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      neighborhood: finalAddress
    }));

    setMessage(fullAddress ? `Local: ${fullAddress}` : 'Localização selecionada.');
    setLoadingGeo(false);
  };

  // --- VALIDAÇÃO ATUALIZADA ---
  const validateForm = (): boolean => {
    if (!formData.pet_name.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do animal.');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Por favor, descreva o animal.');
      return false;
    }
    
    // VERIFICAÇÃO DE IMAGEM ADICIONADA AQUI
    if (!imageUri) {
      Alert.alert('Foto Obrigatória', 'Por favor, adicione uma foto do animal para ajudar na identificação.');
      return false;
    }

    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Erro', 'Por favor, selecione a localização no mapa.');
      return false;
    }
    return true;
  };
  // ---------------------------

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');

    try {
      let finalData;

      if (Platform.OS === 'web') {
        const webFormData = new FormData();
        Object.keys(formData).forEach(key => {
          webFormData.append(key, (formData as any)[key]);
        });
        
        if (imageUri) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const filename = imageUri.split('/').pop() || 'photo.jpg';
          webFormData.append('image', blob, filename);
        }
        finalData = webFormData;
      } else {
        const mobileData: any = { ...formData };
        if (imageUri) {
          const base64Image = await readImageAsBase64(imageUri);
          if (base64Image) {
            mobileData.image_data = base64Image;
            mobileData.image_mime_type = imageMimeType || 'image/jpeg';
          }
        }
        finalData = mobileData;
      }

      await createAnnouncement(finalData);
      
      setMessage('Anúncio criado com sucesso!');
      
      setFormData({
        pet_name: '',
        description: '',
        type: 'perdido',
        neighborhood: '',
        latitude: '',
        longitude: ''
      });
      setImageUri(null);
      setImageMimeType(null);
      setSelectedLocation(null);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
      
    } catch (error: any) {
      console.error('ERRO:', error);
      let errorMessage = error.response?.data?.error || error.message || 'Erro ao criar anúncio.';
      setMessage(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => { if (message) setMessage(''); };

  return (
    <View className="flex-1">
      <ScrollView 
        className="flex-1 "
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center justify-center gap-2 mb-6">
            <Ionicons name="add-circle" size={28} color="#7c3aed" />
            <Text className="text-2xl font-bold text-gray-800">
              Criar Novo Anúncio
            </Text>
          </View>
          
          {message && (
            <TouchableOpacity 
              onPress={clearMessage}
              className={`p-4 rounded-lg mb-5 flex-row justify-between items-center ${
                message.includes('sucesso') 
                  ? 'bg-green-100 border border-green-400' 
                  : 'bg-purple-100 border border-purple-400'
              }`}
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Ionicons 
                  name={message.includes('sucesso') ? 'checkmark-circle' : 'information-circle'} 
                  size={20} 
                  color={message.includes('sucesso') ? '#15803d' : '#7c3aed'} 
                />
                <Text className={`flex-1 text-sm ${
                  message.includes('sucesso') ? 'text-green-700' : 'text-purple-700'
                }`}>
                  {message}
                </Text>
              </View>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}

          <View className="gap-5">
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="paw" size={18} color="#7c3aed" />
                <Text className="font-semibold text-gray-700 text-base">
                  Nome do Animal: *
                </Text>
              </View>
              <TextInput
                className="p-4 border-2 border-gray-300 rounded-lg text-base text-gray-800"
                value={formData.pet_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pet_name: text }))}
                placeholder="Ex: Rex, Mimi, Buddy..."
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
              />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="options" size={18} color="#7c3aed" />
                <Text className="font-semibold text-gray-700 text-base">
                  Tipo de Anúncio: *
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setFormData(prev => ({ ...prev, type: 'perdido' }))}
                  className={`flex-1 p-4 rounded-lg border-2 flex-row items-center justify-center gap-2 ${
                    formData.type === 'perdido'
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Ionicons 
                    name="search" 
                    size={18} 
                    color={formData.type === 'perdido' ? '#fff' : '#374151'} 
                  />
                  <Text className={`font-semibold ${
                    formData.type === 'perdido' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Perdido
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFormData(prev => ({ ...prev, type: 'encontrado' }))}
                  className={`flex-1 p-4 rounded-lg border-2 flex-row items-center justify-center gap-2 ${
                    formData.type === 'encontrado'
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Ionicons 
                    name="home" 
                    size={18} 
                    color={formData.type === 'encontrado' ? '#fff' : '#374151'} 
                  />
                  <Text className={`font-semibold ${
                    formData.type === 'encontrado' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Encontrado
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mt-1 mx-1 text-center">
                Use <Text className="font-bold">Perdido</Text> se procura seu pet, ou <Text className="font-bold">Encontrado</Text> se achou um na rua.
              </Text>
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="document-text" size={18} color="#7c3aed" />
                <Text className="font-semibold text-gray-700 text-base">
                  Descrição: *
                </Text>
              </View>
              <TextInput
                className="p-4 border-2 border-gray-300 rounded-lg text-base text-gray-800 h-32"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                placeholder="Descreva o animal: porte, cor, características..."
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="image" size={18} color="#7c3aed" />
                {/* ADICIONEI O ASTERISCO AQUI */}
                <Text className="font-semibold text-gray-700 text-base">
                  Foto do Animal: *
                </Text>
              </View>
              <TouchableOpacity 
                className={`flex-row items-center justify-center p-4 border-2 border-dashed rounded-lg gap-3 ${
                   !imageUri ? 'border-gray-300' : 'border-purple-300 bg-purple-50'
                }`}
                onPress={pickImage}
              >
                <Ionicons name="cloud-upload" size={24} color="#7c3aed" />
                <Text className="text-purple-600 font-semibold text-base">
                  {imageUri ? 'Alterar foto' : 'Escolher foto (Obrigatório)'}
                </Text>
              </TouchableOpacity>
              {imageUri && (
                <View className="mt-3 items-center relative">
                  <RNImage 
                    source={{ uri: imageUri }} 
                    className="w-52 h-40 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    className="absolute -top-2 right-24 bg-red-500 rounded-full p-1"
                    onPress={() => {
                      setImageUri(null);
                      setImageMimeType(null);
                    }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Seção de Localização */}
            <View className="bg-gray-50 p-5 rounded-2xl border-2 border-dashed border-gray-300">
              <View className="flex-row items-center gap-2 mb-4">
                <Ionicons name="location" size={22} color="#7c3aed" />
                <Text className="font-semibold text-gray-700 text-lg">
                  Localização *
                </Text>
              </View>
              
              <View className="gap-4">
                {selectedLocation ? (
                  <View className="bg-green-100 border border-green-400 rounded-lg p-4 gap-2">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={20} color="#15803d" />
                      <Text className="font-medium text-green-700 text-base">
                        Localização detetada
                      </Text>
                    </View>
                    
                    {loadingGeo ? (
                       <View className="flex-row items-center mt-1">
                          <ActivityIndicator size="small" color="#15803d" />
                          <Text className="text-sm text-green-700 ml-2">Identificando endereço...</Text>
                       </View>
                    ) : (
                      <View>
                        <Text className="font-bold text-green-800 text-lg mt-1">
                           {formData.neighborhood || "Endereço não identificado"}
                        </Text>
                        <Text className="text-xs text-green-600 mt-1">
                           Coord: {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 gap-2">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="warning" size={20} color="#d97706" />
                      <Text className="font-medium text-yellow-700 text-base">
                        Obrigatório selecionar no mapa
                      </Text>
                    </View>
                    <Text className="text-xs text-yellow-600">
                      O endereço será preenchido automaticamente.
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  onPress={() => setShowLocationModal(true)}
                  className="bg-purple-600 p-4 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="map" size={18} color="#fff" />
                  <Text className="text-white font-semibold text-base">
                    {selectedLocation ? 'Alterar Local no Mapa' : 'Abrir Mapa'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || loadingGeo}
              className={`w-full bg-purple-600 py-4 px-6 rounded-lg items-center justify-center mt-2 ${
                (loading || loadingGeo) ? 'opacity-60' : ''
              }`}
            >
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white font-semibold text-base">
                    A enviar...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text className="text-white font-semibold text-base">
                    Publicar Anúncio
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
        currentPosition={selectedLocation}
      />
    </View>
  );
};

export default AnnouncementForm;