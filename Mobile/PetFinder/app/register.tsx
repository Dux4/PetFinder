import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { register } from '../services/api'; 
import { useAuth } from '../contexts/AuthContext';

type FormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
}

const RegisterScreen = () => {
    const router = useRouter();
    const { login: authLogin } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        if (formData.password !== formData.confirmPassword) {
            setMessage('As senhas não coincidem');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const { confirmPassword, ...submitData } = formData;
            const response = await register(submitData);
            
            authLogin(response.token, response.user);
            
            setMessage('Sucesso! Conta criada com sucesso.');
            Alert.alert('Sucesso', 'Conta criada com sucesso!');
            
            router.push('/dashboard'); 
        } catch (err: any) {
            setMessage(err?.response?.data?.error || 'Erro ao criar conta');
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

    return (
        <View className="flex-1 bg-purple-700">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                <View className="bg-white p-12 rounded-2xl w-full max-w-[450px] shadow-2xl">
                    <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4 p-2">
                        <Text className="text-purple-700 text-base font-semibold">← Voltar</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-800 mb-8 text-3xl font-bold">
                        Criar Conta
                    </Text>

                    {message ? (
                        <View className={`p-4 rounded-lg mb-4 ${message.includes('Sucesso') ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-center ${message.includes('Sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </Text>
                        </View>
                    ) : null}

                    <View className="gap-6">
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
                                placeholder="(71) 99999-9000"
                                placeholderTextColor="#9CA3AF"
                                value={formData.phone}
                                onChangeText={(text) => handleInputChange('phone', text)}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View>
                            <Text className="mb-2 font-semibold text-gray-700">Senha:</Text>
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
                            <Text className="mb-2 font-semibold text-gray-700">Confirmar Senha:</Text>
                            <TextInput
                                className="p-4 border-2 border-gray-200 rounded-lg text-base bg-white"
                                placeholder="Digite a senha novamente"
                                placeholderTextColor="#9CA3AF"
                                value={formData.confirmPassword}
                                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            className={`p-4 rounded-lg items-center ${loading ? 'bg-purple-700 opacity-60' : 'bg-purple-700'}`}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white text-base font-semibold">Criar Conta</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-8 items-center">
                        <Text className="text-gray-600">Já tem conta? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text className="text-purple-700 font-semibold underline ml-2">
                                Faça login aqui
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default RegisterScreen;