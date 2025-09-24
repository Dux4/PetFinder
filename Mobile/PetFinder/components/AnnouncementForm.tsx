import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
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
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { createAnnouncement, getNeighborhoods } from '../services/api';
import LocationPickerModal from './modal/LocationPickerModal';

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
    // Solicitar permissões para galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria para enviar fotos.');
    }

    // Solicitar permissões para localização
    const locationStatus = await Location.requestForegroundPermissionsAsync();
    if (locationStatus.status !== 'granted') {
      console.log('Permissão de localização negada');
    }
  };

  const loadNeighborhoods = async () => {
    try {
      const data = await getNeighborhoods();
      // Transformar array simples em array de objetos se necessário
      const formattedData = Array.isArray(data) 
        ? data.map((name, index) => ({ id: index, name }))
        : data;
      setNeighborhoods(formattedData);
    } catch (error) {
      console.error('Erro ao carregar bairros:', error);
      // Fallback com bairros de Salvador
      const salvadorNeighborhoods = [
        'Pelourinho', 'Barra', 'Itapuã', 'Pituba', 'Liberdade', 'Campo Grande',
        'Rio Vermelho', 'Ondina', 'Federação', 'Brotas', 'Nazaré', 'Barris',
        'Graça', 'Vitória', 'Corredor da Vitória', 'Canela', 'Imbuí', 
        'Caminho das Árvores', 'Pituaçu', 'Costa Azul', 'Armação', 'Patamares'
      ];
      setNeighborhoods(salvadorNeighborhoods.map((name, index) => ({ id: index, name })));
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Reduzir qualidade para otimizar upload
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
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
      // Criar FormData para envio
      const submitData = new FormData();
      
      // Adicionar campos de texto
      submitData.append('pet_name', formData.pet_name.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('type', formData.type);
      submitData.append('neighborhood', formData.neighborhood.trim());
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      
      // Adicionar imagem se selecionada
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        // Formato específico para React Native
        (submitData as any).append('image', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      console.log('Enviando dados:', {
        pet_name: formData.pet_name,
        type: formData.type,
        neighborhood: formData.neighborhood,
        hasImage: !!imageUri,
        coordinates: [formData.latitude, formData.longitude]
      });

      // Enviar para API
      const response = await createAnnouncement(submitData);
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
      setSelectedLocation(null);
      
      // Callback de sucesso
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Erro ao criar anúncio:', error);
      
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
    <View style={styles.outerContainer}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Criar Novo Anúncio</Text>
          
          {message && (
            <TouchableOpacity 
              onPress={clearMessage}
              style={[
                styles.messageBox, 
                message.includes('sucesso') ? styles.successMessage : styles.errorMessage
              ]}
            >
              <Text style={message.includes('sucesso') ? styles.successText : styles.errorText}>
                {message}
              </Text>
              <Text style={styles.messageClose}>✕</Text>
            </TouchableOpacity>
          )}

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome do Animal: *</Text>
              <TextInput
                style={styles.input}
                value={formData.pet_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pet_name: text }))}
                placeholder="Ex: Rex, Mimi, Buddy..."
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de Anúncio: *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(itemValue) => setFormData(prev => ({ ...prev, type: itemValue }))}
                  style={styles.picker}
                >
                  <Picker.Item label="🔍 Animal Perdido" value="perdido" />
                  <Picker.Item label="🏠 Animal Encontrado" value="encontrado" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição: *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                placeholder="Descreva o animal: porte, cor, características, onde foi visto pela última vez..."
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Foto do Animal:</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Feather name="upload" size={24} color="#4F46E5" />
                <Text style={styles.imagePickerText}>
                  {imageUri ? 'Alterar foto' : 'Escolher foto'}
                </Text>
              </TouchableOpacity>
              {imageUri && (
                <View style={styles.imagePreview}>
                  <RNImage source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setImageUri(null)}
                  >
                    <Feather name="x" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Seção de Localização */}
            <View style={styles.locationSection}>
              <Text style={styles.locationTitle}>📍 Localização</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bairro: *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.neighborhood}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, neighborhood: text }))}
                  placeholder="Ex: Barra, Ondina, Rio Vermelho..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={styles.locationPickerRow}>
                <View style={styles.locationStatus}>
                  {selectedLocation ? (
                    <View style={styles.locationSelected}>
                      <View style={styles.locationSelectedHeader}>
                        <Feather name="check-circle" size={20} color="#10B981" />
                        <Text style={styles.locationSelectedText}>Localização selecionada</Text>
                      </View>
                      <Text style={styles.locationSelectedCoords}>
                        Coordenadas: {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.locationNotSelected}>
                      <View style={styles.locationNotSelectedHeader}>
                        <Feather name="alert-triangle" size={20} color="#F59E0B" />
                        <Text style={styles.locationNotSelectedText}>Localização obrigatória</Text>
                      </View>
                      <Text style={styles.locationNotSelectedSubtext}>
                        Clique no botão abaixo para escolher no mapa.
                      </Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity
                  onPress={() => setShowLocationModal(true)}
                  style={styles.locationButton}
                >
                  <Feather 
                    name="map-pin" 
                    size={18} 
                    color="#fff" 
                    style={styles.locationButtonIcon} 
                  />
                  <Text style={styles.locationButtonText}>
                    {selectedLocation ? 'Alterar Local' : 'Escolher no Mapa'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            >
              {loading ? (
                <View style={styles.submitButtonLoading}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.submitButtonText}>Criando...</Text>
                </View>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Feather name="send" size={18} color="#fff" style={styles.submitButtonIcon} />
                  <Text style={styles.submitButtonText}>Criar Anúncio</Text>
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

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  messageBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successMessage: {
    backgroundColor: '#DCFCE7',
    borderColor: '#34D399',
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderWidth: 1,
  },
  successText: {
    color: '#16A34A',
    flex: 1,
    fontSize: 14,
  },
  errorText: {
    color: '#DC2626',
    flex: 1,
    fontSize: 14,
  },
  messageClose: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontWeight: '600',
    color: '#4B5563',
    fontSize: 16,
  },
  input: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 12,
  },
  imagePickerText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 16,
  },
  imagePreview: {
    marginTop: 12,
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: '30%',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 4,
  },
  locationSection: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  locationTitle: {
    fontWeight: '600',
    color: '#4B5563',
    fontSize: 18,
    marginBottom: 16,
  },
  locationPickerRow: {
    flexDirection: 'column',
    gap: 16,
  },
  locationStatus: {
    flex: 1,
  },
  locationSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#34D399',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  locationSelectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationSelectedText: {
    fontWeight: '500',
    color: '#10B981',
    fontSize: 16,
  },
  locationSelectedCoords: {
    fontSize: 12,
    color: '#059669',
  },
  locationNotSelected: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  locationNotSelectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationNotSelectedText: {
    fontWeight: '500',
    color: '#F59E0B',
    fontSize: 16,
  },
  locationNotSelectedSubtext: {
    fontSize: 12,
    color: '#D97706',
  },
  locationButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  locationButtonIcon: {
    marginRight: 4,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonIcon: {
    marginRight: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AnnouncementForm;