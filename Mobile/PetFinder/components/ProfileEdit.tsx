import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile, getCurrentUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type FormData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

interface ProfileEditProps {
    onSuccess?: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ onSuccess }) => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadUserData();
    }, [user]);

    const loadUserData = async () => {
        try {
            setLoadingData(true);
            const userData = await getCurrentUser();
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage('Erro ao carregar dados do perfil');
            Alert.alert('Erro', 'Erro ao carregar dados do perfil');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async () => {
        // Validações
        if (!formData.name || !formData.name.trim()) {
            setMessage('O nome é obrigatório');
            Alert.alert('Erro', 'O nome é obrigatório');
            return;
        }

        if (!formData.email || !formData.email.trim()) {
            setMessage('O email é obrigatório');
            Alert.alert('Erro', 'O email é obrigatório');
            return;
        }

        if (!formData.email.includes('@')) {
            setMessage('Email inválido');
            Alert.alert('Erro', 'Email inválido');
            return;
        }

        if (!formData.phone || !formData.phone.trim()) {
            setMessage('O telefone é obrigatório');
            Alert.alert('Erro', 'O telefone é obrigatório');
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage('As senhas não coincidem');
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            setMessage('A senha deve ter no mínimo 6 caracteres');
            Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };

            // Só incluir senha se foi preenchida
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await updateProfile(updateData);
            
            // Atualizar o contexto de autenticação
            const token = await AsyncStorage.getItem('pet-finder-token');
            if (token) {
                login(token, response.user);
            }
            
            setMessage('Perfil atualizado com sucesso!');
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            
            // Limpar campos de senha
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || 'Erro ao atualizar perfil';
            setMessage(errorMessage);
            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (name: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loadingData) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text className="text-gray-600 mt-4">Carregando perfil...</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="bg-white rounded-xl shadow-lg p-6 mb-4">
                <View className="mb-6">
                    <Text className="text-3xl font-bold text-gray-800 mb-2">Editar Perfil</Text>
                    <Text className="text-gray-600">Atualize suas informações pessoais</Text>
                </View>

                {message ? (
                    <View className={`p-4 rounded-lg mb-4 ${
                        message.includes('sucesso') 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        <Text className={`text-center ${
                            message.includes('sucesso') ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {message}
                        </Text>
                    </View>
                ) : null}

                <View className="gap-4">
                    <View>
                        <Text className="mb-2 font-semibold text-gray-700">Nome Completo:</Text>
                        <TextInput
                            className="p-4 border-2 border-gray-200 rounded-lg text-base bg-white"
                            placeholder="Seu nome completo"
                            placeholderTextColor="#9CA3AF"
                            value={formData.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                            autoCapitalize="words"
                        />
                    </View>

                    <View>
                        <Text className="mb-2 font-semibold text-gray-700">Email:</Text>
                        <TextInput
                            className="p-4 border-2 border-gray-200 rounded-lg text-base bg-white"
                            placeholder="seu@email.com"
                            placeholderTextColor="#9CA3AF"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="mb-2 font-semibold text-gray-700">Telefone:</Text>
                        <TextInput
                            className="p-4 border-2 border-gray-200 rounded-lg text-base bg-white"
                            placeholder="(71) 99999-9999"
                            placeholderTextColor="#9CA3AF"
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange('phone', text)}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View className="pt-4 border-t border-gray-200 mt-2">
                        <Text className="text-lg font-semibold text-gray-800 mb-2">
                            Alterar Senha (opcional)
                        </Text>
                        <Text className="text-sm text-gray-600 mb-4">
                            Deixe em branco se não desejar alterar a senha
                        </Text>

                        <View className="gap-4">
                            <View>
                                <Text className="mb-2 font-semibold text-gray-700">Nova Senha:</Text>
                                <TextInput
                                    className="p-4 border-2 border-gray-200 rounded-lg text-base bg-white"
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.password}
                                    onChangeText={(text) => handleInputChange('password', text)}
                                    secureTextEntry
                                />
                            </View>

                            <View>
                                <Text className="mb-2 font-semibold text-gray-700">Confirmar Nova Senha:</Text>
                                <TextInput
                                    className="p-4 border-2 border-gray-200 rounded-lg text-base bg-white"
                                    placeholder="Digite a senha novamente"
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                    secureTextEntry
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`p-4 rounded-lg items-center mt-4 ${
                            loading ? 'bg-purple-700 opacity-60' : 'bg-purple-700'
                        }`}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-base font-semibold">Salvar Alterações</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default ProfileEdit;

