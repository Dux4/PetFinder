import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { login as loginApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Definição do tipo para o estado do formulário
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
            
            // Navega para a página principal após o login
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
        <View style={styles.outerContainer}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.authCard}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Voltar</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>Entrar no Pet Finder</Text>

                    <View style={styles.demoInfo}>
                        <Text style={styles.demoInfoText}>Usuários de teste:</Text>
                        <Text style={styles.demoInfoText}>📧 maria@email.com | 🔑 123456</Text>
                        <Text style={styles.demoInfoText}>📧 joao@email.com | 🔑 123456</Text>
                    </View>

                    {message ? (
                        <View style={styles.errorMessage}>
                            <Text style={styles.errorText}>{message}</Text>
                        </View>
                    ) : null}

                    <View style={styles.form}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="seu@email.com"
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Senha:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Sua senha"
                                value={formData.password}
                                onChangeText={(text) => handleInputChange('password', text)}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Entrar</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.authSwitch}>
                        <Text style={styles.authSwitchText}>Não tem conta? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={styles.linkButtonText}>Cadastre-se aqui</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#667eea',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    authCard: {
        backgroundColor: 'white',
        padding: 48,
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        elevation: 10,
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        padding: 8,
    },
    backButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        textAlign: 'center',
        color: '#333',
        marginBottom: 32,
        fontSize: 28,
        fontWeight: 'bold',
    },
    demoInfo: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        textAlign: 'center',
    },
    demoInfoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: 4,
    },
    errorMessage: {
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: 'center',
    },
    errorText: {
        color: '#dc2626',
        textAlign: 'center',
    },
    form: {
        flexDirection: 'column',
        gap: 24,
    },
    formGroup: {
        flexDirection: 'column',
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
        color: '#555',
    },
    input: {
        padding: 16,
        borderWidth: 2,
        borderColor: '#e1e5e9',
        borderRadius: 8,
        fontSize: 16,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#667eea',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    authSwitch: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        alignItems: 'center',
    },
    authSwitchText: {
        color: '#666',
    },
    linkButtonText: {
        color: '#667eea',
        fontWeight: '600',
        textDecorationLine: 'underline',
        marginLeft: 8,
    },
});

export default LoginScreen;