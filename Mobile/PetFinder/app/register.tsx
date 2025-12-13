import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context'; // Recomendado para garantir posição correta do botão voltar
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
    
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

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
            
            Alert.alert('Sucesso', 'Conta criada com sucesso!');
            router.push('/dashboard'); 
        } catch (err: any) {
            setMessage(err?.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
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

    // Componente Input reutilizável
    const InputField = ({ 
        label, 
        icon, 
        value, 
        onChange, 
        placeholder, 
        isPassword = false, 
        showPassword = false, 
        togglePassword,
        keyboardType = 'default' 
    }: any) => (
        <View className="mb-4">
            <Text className="mb-1.5 font-semibold text-gray-700 ml-1 text-sm">{label}</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 focus:border-purple-500">
                <Ionicons name={icon} size={20} color="#9ca3af" />
                <TextInput
                    className="flex-1 ml-3 text-gray-800 text-base h-full"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={icon === 'mail-outline' ? 'none' : 'words'}
                />
                {isPassword && (
                    <TouchableOpacity onPress={togglePassword} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Ionicons 
                            name={showPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color="#9ca3af" 
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-purple-800">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            
            {/* 1. Header Fixo com Gradiente (Ocupa o topo) */}
            <LinearGradient
                colors={['#7c3aed', '#6d28d9', '#5b21b6']}
                className="pb-8 pt-2"
            >
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View className="px-6 flex-row items-center gap-4 pt-2">
                        {/* Botão Voltar Ajustado */}
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:bg-white/30"
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <View>
                            <Text className="text-white text-2xl font-bold">Criar Conta</Text>
                            <Text className="text-purple-200 text-sm">Preencha seus dados abaixo</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* 2. Corpo Branco Arredondado (Ocupa o resto da tela) */}
            <View className="flex-1 bg-white rounded-t-[32px] -mt-6 overflow-hidden shadow-2xl">
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView 
                        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {message ? (
                            <View className={`p-4 rounded-xl mb-6 flex-row items-center gap-2 border ${
                                message.includes('Sucesso') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}>
                                <Ionicons 
                                    name={message.includes('Sucesso') ? "checkmark-circle" : "alert-circle"} 
                                    size={20} 
                                    color={message.includes('Sucesso') ? "#15803d" : "#dc2626"} 
                                />
                                <Text className={`flex-1 font-medium text-sm ${
                                    message.includes('Sucesso') ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {message}
                                </Text>
                            </View>
                        ) : null}

                        <View>
                            <InputField 
                                label="Nome Completo"
                                icon="person-outline"
                                value={formData.name}
                                onChange={(t: string) => handleInputChange('name', t)}
                                placeholder="Seu nome completo"
                            />

                            <InputField 
                                label="Email"
                                icon="mail-outline"
                                value={formData.email}
                                onChange={(t: string) => handleInputChange('email', t)}
                                placeholder="seu@email.com"
                                keyboardType="email-address"
                            />

                            <InputField 
                                label="Telefone"
                                icon="call-outline"
                                value={formData.phone}
                                onChange={(t: string) => handleInputChange('phone', t)}
                                placeholder="(71) 99999-9000"
                                keyboardType="phone-pad"
                            />

                            <InputField 
                                label="Senha"
                                icon="lock-closed-outline"
                                value={formData.password}
                                onChange={(t: string) => handleInputChange('password', t)}
                                placeholder="Mínimo 6 caracteres"
                                isPassword={true}
                                showPassword={showPass}
                                togglePassword={() => setShowPass(!showPass)}
                            />

                            <InputField 
                                label="Confirmar Senha"
                                icon="shield-checkmark-outline"
                                value={formData.confirmPassword}
                                onChange={(t: string) => handleInputChange('confirmPassword', t)}
                                placeholder="Repita a senha"
                                isPassword={true}
                                showPassword={showConfirmPass}
                                togglePassword={() => setShowConfirmPass(!showConfirmPass)}
                            />

                            <TouchableOpacity
                                className={`h-14 rounded-xl items-center justify-center mt-4 shadow-lg shadow-purple-200 ${
                                    loading ? 'bg-purple-400' : 'bg-purple-700'
                                }`}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Criar Conta</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-center mt-6 items-center">
                            <Text className="text-gray-500">Já tem conta? </Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text className="text-purple-700 font-bold ml-1">
                                    Faça login
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        {/* Espaço extra no final para garantir que o teclado não cubra o botão se a tela for pequena */}
                        <View className="h-6" />
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
};

export default RegisterScreen;