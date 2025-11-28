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
import { createAnnouncement, getNeighborhoods } from '../services/api';
import LocationPickerModal from './modal/LocationPickerModal';
import * as FileSystem from 'expo-file-system';

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
  const [neighborhoods, setNeighborhoods] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    loadNeighborhoods();
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

  const loadNeighborhoods = async () => {
    try {
      const data = await getNeighborhoods();
      const formattedData = Array.isArray(data) 
        ? data.map((name, index) => ({ id: index, name }))
        : data;
      setNeighborhoods(formattedData);
    } catch (error) {
      console.error('Erro ao carregar bairros:', error);
      const salvadorNeighborhoods = [
        'Pelourinho', 'Barra', 'Itapuã', 'Pituba', 'Liberdade', 'Campo Grande',
        'Rio Vermelho', 'Ondina', 'Federação', 'Brotas', 'Nazaré', 'Barris',
        'Graça', 'Vitória', 'Corredor da Vitória', 'Canela', 'Imbuí', 
        'Caminho das Árvores', 'Pituaçu', 'Costa Azul', 'Armação', 'Patamares'
      ];
      setNeighborhoods(salvadorNeighborhoods.map((name, index) => ({ id: index, name })));
    }
  };

  const readImageAsBase64 = async (uri: string) => {
    try {
      if (!uri) return null;
      console.log('DEBUG: Lendo imagem URI:', uri);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (base64.length > 0) {
          console.log(`DEBUG: Imagem lida com sucesso. Tamanho Base64: ${base64.length} caracteres.`);
      }
      return base64;
    } catch (error) {
      console.error('ERRO: Falha ao ler imagem como Base64:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem.');
      return null;
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Corrigido: usar array em vez de MediaTypeOptions
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        setImageUri(selectedImage.uri);
        setImageMimeType(selectedImage.mimeType || 'image/jpeg');
        console.log('Imagem selecionada:', {
          uri: selectedImage.uri,
          mimeType: selectedImage.mimeType,
          width: selectedImage.width,
          height: selectedImage.height
        });
      }
    } catch (error) {
      console.error('ERRO: Falha ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleLocationConfirm = (position: [number, number]) => {
    setSelectedLocation(position);
    setFormData(prev => ({
      ...prev,
      latitude: position[0].toString(),
      longitude: position[1].toString()
    }));
    setMessage(`Localização selecionada: Lat ${position[0].toFixed(4)}, Lng ${position[1].toFixed(4)}`);
    setShowLocationModal(false);
  };

  const validateForm = (): boolean => {
    if (!formData.pet_name.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do animal.');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Por favor, descreva o animal.');
      return false;
    }
    if (!formData.neighborhood.trim()) {
      Alert.alert('Erro', 'Por favor, informe o bairro.');
      return false;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Erro', 'Por favor, selecione a localização no mapa.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      let finalData;

      if (Platform.OS === 'web') {
        // Lógica para Web: usa FormData
        const webFormData = new FormData();
        Object.keys(formData).forEach(key => {
          webFormData.append(key, (formData as any)[key]);
        });
        
        if (imageUri) {
          console.log('DEBUG: Preparando imagem para web como FormData');
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const filename = imageUri.split('/').pop() || 'photo.jpg';
          webFormData.append('image', blob, filename);
          console.log('DEBUG: Imagem adicionada ao FormData para web.');
        }
        finalData = webFormData;
      } else {
        // Lógica para iOS/Android: usa Base64
        const mobileData: any = {
          ...formData,
        };
        if (imageUri) {
          console.log('DEBUG: Preparando imagem para mobile como Base64');
          const base64Image = await readImageAsBase64(imageUri);
          if (base64Image) {
            mobileData.image_data = base64Image;
            mobileData.image_mime_type = imageMimeType || 'image/jpeg';
            console.log('DEBUG: Imagem preparada:', {
              mime_type: mobileData.image_mime_type,
              base64_length: base64Image.length,
              base64_preview: base64Image.substring(0, 100)
            });
          } else {
            console.error('ERRO: Falha na conversão da imagem para Base64.');
            setMessage('Erro ao processar a imagem. Tente outra foto.');
            setLoading(false);
            return;
          }
        }
        console.log('DEBUG: Dados mobile completos:', {
          ...mobileData,
          image_data: mobileData.image_data ? `Base64(${mobileData.image_data.length} chars)` : null
        });
        finalData = mobileData;
      }

      console.log('DEBUG: Dados finais para envio:', Platform.OS === 'web' ? 'FormData' : finalData);

      // Enviar para API
      const response = await createAnnouncement(finalData);
      console.log('Resposta da API:', response);
      
      setMessage('Anúncio criado com sucesso!');
      
      // Resetar formulário
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
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('ERRO: Falha ao criar anúncio:', error);
      
      let errorMessage = 'Erro ao criar anúncio. Tente novamente.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    if (message) {
      setMessage('');
    }
  };

  return (
    <View className="flex-1">
      <ScrollView 
        className="flex-1 p-5"
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
                  : 'bg-red-100 border border-red-400'
              }`}
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Ionicons 
                  name={message.includes('sucesso') ? 'checkmark-circle' : 'alert-circle'} 
                  size={20} 
                  color={message.includes('sucesso') ? '#15803d' : '#b91c1c'} 
                />
                <Text className={`flex-1 text-sm ${
                  message.includes('sucesso') ? 'text-green-700' : 'text-red-700'
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
                placeholder="Descreva o animal: porte, cor, características, onde foi visto pela última vez..."
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="image" size={18} color="#7c3aed" />
                <Text className="font-semibold text-gray-700 text-base">
                  Foto do Animal:
                </Text>
              </View>
              <TouchableOpacity 
                className="flex-row items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg gap-3"
                onPress={pickImage}
              >
                <Ionicons name="cloud-upload" size={24} color="#7c3aed" />
                <Text className="text-purple-600 font-semibold text-base">
                  {imageUri ? 'Alterar foto' : 'Escolher foto'}
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
                  Localização
                </Text>
              </View>
              
              <View className="gap-2 mb-4">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="business" size={16} color="#7c3aed" />
                  <Text className="font-semibold text-gray-700 text-base">
                    Bairro: *
                  </Text>
                </View>
                <TextInput
                  className="p-4 border-2 border-gray-300 rounded-lg text-base text-gray-800 bg-white"
                  value={formData.neighborhood}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, neighborhood: text }))}
                  placeholder="Ex: Barra, Ondina, Rio Vermelho..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View className="gap-4">
                {selectedLocation ? (
                  <View className="bg-green-100 border border-green-400 rounded-lg p-4 gap-2">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={20} color="#15803d" />
                      <Text className="font-medium text-green-700 text-base">
                        Localização selecionada
                      </Text>
                    </View>
                    <Text className="text-xs text-green-600">
                      Coordenadas: {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 gap-2">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="warning" size={20} color="#d97706" />
                      <Text className="font-medium text-yellow-700 text-base">
                        Localização obrigatória
                      </Text>
                    </View>
                    <Text className="text-xs text-yellow-600">
                      Clique no botão abaixo para escolher no mapa.
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  onPress={() => setShowLocationModal(true)}
                  className="bg-purple-600 p-4 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="map" size={18} color="#fff" />
                  <Text className="text-white font-semibold text-base">
                    {selectedLocation ? 'Alterar Local' : 'Escolher no Mapa'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`w-full bg-purple-600 py-4 px-6 rounded-lg items-center justify-center mt-2 ${
                loading ? 'opacity-60' : ''
              }`}
            >
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white font-semibold text-base">
                    Criando...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text className="text-white font-semibold text-base">
                    Criar Anúncio
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