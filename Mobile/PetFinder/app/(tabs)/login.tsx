import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { login as loginApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
    email: string;
    password: string;
}

const LoginScreen = () => {
    const router = useRouter();
    const { login: authLogin } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await loginApi(formData);
            authLogin(response.token, response.user);
            router.push('/dashboard'); 
        } catch (error: any) {
            setMessage(error.response?.data?.error || 'Erro ao fazer login');
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
                <View className="bg-white p-12 rounded-2xl w-full max-w-[400px] shadow-2xl">
                    <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4 p-2">
                        <Text className="text-purple-700 text-base font-semibold">← Voltar</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-800 mb-8 text-3xl font-bold">
                        Entrar no Pet Finder
                    </Text>

                    <View className="bg-gray-50 p-4 rounded-lg mb-6">
                        <Text className="text-sm text-gray-600 text-center mb-1">Usuários de teste:</Text>
                        <Text className="text-sm text-gray-600 text-center mb-1">📧 maria@email.com | 🔑 123456</Text>
                        <Text className="text-sm text-gray-600 text-center">📧 joao@email.com | 🔑 123456</Text>
                    </View>

                    {message ? (
                        <View className="bg-red-100 p-4 rounded-lg mb-4">
                            <Text className="text-red-600 text-center">{message}</Text>
                        </View>
                    ) : null}

                    <View className="gap-6">
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
                            <Text className="mb-2 font-semibold text-gray-700">Senha:</Text>
                            <TextInput
                                className="p-4 border-2 border-gray-200 rounded-lg text-base bg-white"
                                placeholder="Sua senha"
                                placeholderTextColor="#9CA3AF"
                                value={formData.password}
                                onChangeText={(text) => handleInputChange('password', text)}
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
                                <Text className="text-white text-base font-semibold">Entrar</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-8 items-center">
                        <Text className="text-gray-600">Não tem conta? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text className="text-purple-700 font-semibold underline ml-2">
                                Cadastre-se aqui
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default LoginScreen;