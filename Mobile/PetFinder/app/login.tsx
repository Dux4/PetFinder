import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { login as loginApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
    email: string;
    password: string;
}

const { width } = Dimensions.get('window');

const LoginScreen = () => {
    const router = useRouter();
    const { login: authLogin } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await loginApi(formData);
            authLogin(response.token, response.user);
            router.push('/dashboard'); 
        } catch (error: any) {
            setMessage(error.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
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
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Fundo com Gradiente seguindo a identidade do Dashboard */}
            <LinearGradient
                colors={['#7c3aed', '#6d28d9', '#4c1d95']}
                className="flex-1 px-6"
            >
                {/* Botão Voltar */}
                <View className="pt-12 pb-4">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="flex-row items-center gap-3 active:opacity-70"
                    >
                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </View>
                        <Text className="text-white text-base font-semibold">Voltar</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} 
                    showsVerticalScrollIndicator={false}
                    className="w-full"
                >
                    <View className="bg-white p-8 rounded-3xl shadow-2xl w-full">
                        
                        {/* Cabeçalho do Card */}
                        <View className="items-center mb-8">
                            <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="paw" size={32} color="#7c3aed" />
                            </View>
                            <Text className="text-3xl font-bold text-gray-800 text-center">
                                Pet Finder
                            </Text>
                            <Text className="text-gray-500 text-center mt-2">
                                Bem-vindo de volta!
                            </Text>
                        </View>

                        {/* Mensagem de Erro */}
                        {message ? (
                            <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex-row items-center gap-2">
                                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                                <Text className="text-red-600 flex-1 font-medium text-sm">{message}</Text>
                            </View>
                        ) : null}

                        <View className="gap-5">
                            {/* Input de Email com Ícone */}
                            <View>
                                <Text className="mb-2 font-semibold text-gray-700 ml-1">Email</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 h-14 focus:border-purple-500">
                                    <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-800 text-base h-full"
                                        placeholder="seu@email.com"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.email}
                                        onChangeText={(text) => handleInputChange('email', text)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {/* Input de Senha com Ícone e Olho */}
                            <View>
                                <Text className="mb-2 font-semibold text-gray-700 ml-1">Senha</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 h-14">
                                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-800 text-base h-full"
                                        placeholder="Sua senha"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.password}
                                        onChangeText={(text) => handleInputChange('password', text)}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons 
                                            name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                            size={20} 
                                            color="#9ca3af" 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Botão de Login */}
                            <TouchableOpacity
                                className={`h-14 rounded-xl items-center justify-center mt-2 shadow-lg shadow-purple-200 ${
                                    loading ? 'bg-purple-400' : 'bg-purple-700'
                                }`}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Entrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Rodapé */}
                        <View className="flex-row justify-center mt-8 items-center">
                            <Text className="text-gray-500">Não tem conta? </Text>
                            <TouchableOpacity onPress={() => router.push('/register')}>
                                <Text className="text-purple-700 font-bold ml-1">
                                    Cadastre-se
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;