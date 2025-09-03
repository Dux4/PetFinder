import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
// Importe seu serviço de API e contexto, se necessário.
// Por exemplo:
// import { register } from '../services/api'; 
// import { useAuth } from '../contexts/AuthContext';

type FormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
}

const RegisterScreen = () => {
    const router = useRouter();
    // const { login } = useAuth();
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
        // A lógica de validação de senha e chamada de API está aqui
        if (formData.password !== formData.confirmPassword) {
            setMessage('As senhas não coincidem');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Lógica para chamada da API
            // const { confirmPassword, ...submitData } = formData;
            // const response = await register(submitData);
            // login(response.token, response.user);
            setMessage('Sucesso! Conta criada com sucesso.');
            Alert.alert('Sucesso', 'Conta criada com sucesso!');
            // router.push('/'); // Navega para a página inicial
        } catch (err: any) { // Type as 'any' since we don't know the exact error type
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
        <View style={styles.outerContainer}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.authCard}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Voltar</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>Criar Conta</Text>

                    {message ? (
                        <View style={[styles.messageBox, message.includes('Sucesso') ? styles.successMessage : styles.errorMessage]}>
                            <Text style={message.includes('Sucesso') ? styles.successText : styles.errorText}>{message}</Text>
                        </View>
                    ) : null}

                    <View style={styles.form}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nome Completo:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Seu nome completo"
                                value={formData.name}
                                onChangeText={(text) => handleInputChange('name', text)}
                                autoCapitalize="words"
                            />
                        </View>

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
                            <Text style={styles.label}>Telefone:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="(71) 99999-9000"
                                value={formData.phone}
                                onChangeText={(text) => handleInputChange('phone', text)}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Senha:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChangeText={(text) => handleInputChange('password', text)}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirmar Senha:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite a senha novamente"
                                value={formData.confirmPassword}
                                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.primaryButtonText}>
                                {loading ? 'Criando conta...' : 'Criar Conta'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.authSwitch}>
                        <Text style={styles.authSwitchText}>Já tem conta? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.linkButtonText}>Faça login aqui</Text>
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
        backgroundColor: '#667eea', // Cor de fundo sólida para substituir o gradiente
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
        maxWidth: 450,
        // Sombras para Android e iOS
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
    messageBox: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: 'center',
    },
    successMessage: {
        backgroundColor: '#dcfce7',
    },
    errorMessage: {
        backgroundColor: '#fee2e2',
    },
    successText: {
        color: '#16a34a',
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

export default RegisterScreen;