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

const AnnouncementForm = ({ onSuccess }: { onSuccess: () => void }) => {
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
  }, []);

  const loadNeighborhoods = async () => {
    try {
      const data = await getNeighborhoods();
      setNeighborhoods(data);
    } catch (error) {
      console.error('Erro ao carregar bairros:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
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

  const handleSubmit = async () => {
    if (!formData.pet_name || !formData.description || !formData.neighborhood) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value);
        }
      });
      
      if (imageUri) {
        const localUri = imageUri;
        const filename = localUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        // A sintaxe para anexar arquivos em FormData no React Native é ligeiramente diferente
        submitData.append('image', { uri: localUri, name: filename, type } as any);
      }

      await createAnnouncement(submitData);
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
      setSelectedLocation(null);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setMessage('Erro ao criar anúncio: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Criar Novo Anúncio</Text>
          
          {message && (
            <View style={[styles.messageBox, message.includes('sucesso') ? styles.successMessage : styles.errorMessage]}>
              <Text style={message.includes('sucesso') ? styles.successText : styles.errorText}>{message}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome do Animal:</Text>
              <TextInput
                style={styles.input}
                value={formData.pet_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pet_name: text }))}
                placeholder="Ex: Rex, Mimi, Buddy..."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de Anúncio:</Text>
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
              <Text style={styles.label}>Descrição:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                placeholder="Descreva o animal: porte, cor, características, onde foi visto pela última vez..."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Foto do Animal:</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Feather name="upload" size={24} color="#4F46E5" />
                <Text style={styles.imagePickerText}>{imageUri ? 'Alterar foto' : 'Escolher foto'}</Text>
              </TouchableOpacity>
              {imageUri && (
                <View style={styles.imagePreview}>
                  <RNImage source={{ uri: imageUri }} style={styles.previewImage} />
                </View>
              )}
            </View>

            {/* Seção de Localização */}
            <View style={styles.locationSection}>
              <Text style={styles.locationTitle}>📍 Localização</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bairro (para exibição):</Text>
                <TextInput
                  style={styles.input}
                  value={formData.neighborhood}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, neighborhood: text }))}
                  placeholder="Ex: Barra, Ondina, Rio Vermelho..."
                />
              </View>
              
              <View style={styles.locationPickerRow}>
                <View style={styles.locationStatus}>
                  {selectedLocation ? (
                    <View style={styles.locationSelected}>
                      <Feather name="check-circle" size={20} color="#10B981" />
                      <Text style={styles.locationSelectedText}>Localização selecionada</Text>
                      <Text style={styles.locationSelectedCoords}>
                        Coordenadas: {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.locationNotSelected}>
                      <Feather name="alert-triangle" size={20} color="#F59E0B" />
                      <Text style={styles.locationNotSelectedText}>Localização não selecionada</Text>
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
                  <Text style={styles.locationButtonText}>
                    🗺️ {selectedLocation ? 'Alterar Local' : 'Escolher no Mapa'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !formData.latitude || !formData.longitude}
              style={[styles.submitButton, (loading || !formData.latitude || !formData.longitude) && styles.submitButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Criar Anúncio</Text>
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
    padding: 32,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 32,
    textAlign: 'center',
  },
  messageBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
    borderColor: '#34D399',
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    borderColor: '#F87171',
    borderWidth: 1,
  },
  successText: {
    color: '#16A34A',
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  form: {
    gap: 24,
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
    gap: 16,
  },
  imagePickerText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  imagePreview: {
    marginTop: 16,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  locationSection: {
    backgroundColor: '#F9FAFB',
    padding: 24,
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
    gap: 4,
  },
  locationSelectedText: {
    fontWeight: '500',
    color: '#10B981',
  },
  locationSelectedCoords: {
    fontSize: 12,
    color: '#34D399',
  },
  locationNotSelected: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 4,
  },
  locationNotSelectedText: {
    fontWeight: '500',
    color: '#F59E0B',
  },
  locationNotSelectedSubtext: {
    fontSize: 12,
    color: '#FBBF24',
  },
  locationButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});

export default AnnouncementForm;