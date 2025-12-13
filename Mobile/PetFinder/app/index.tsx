import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar, Image, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllAnnouncements } from '../services/api'; 

interface Announcement {
    id: number;
    pet_name: string;
    status: string;
    neighborhood: string;
    image_data?: string;
    type: 'perdido' | 'encontrado';
    description: string;
}

const features = [
    { icon: 'map', title: 'Geolocalização', desc: 'Veja pets próximos a você no mapa.' },
    { icon: 'chatbubbles', title: 'Discussões', desc: 'Comente e troque informações nos anúncios.' },
    { icon: 'people', title: 'Comunidade', desc: 'Milhares de voluntários ativos.' },
];

const safetyTips = [
    { icon: 'camera', text: 'Tire fotos nítidas do animal' },
    { icon: 'location', text: 'Informe o local exato do encontro' },
    { icon: 'time', text: 'Agilidade nos comentários ajuda muito' },
    { icon: 'shield-checkmark', text: 'Marque encontros em locais públicos' },
];

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web' && width > 768;

export default function LandingPage() {
    const router = useRouter();
    const [stories, setStories] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        try {
            const data = await getAllAnnouncements('encontrado');
            setStories(data.slice(0, 5));
        } catch (error) {
            console.error("Erro ao carregar histórias:", error);
        } finally {
            setLoading(false);
        }
    };

    const StoryCard = ({ item }: { item: Announcement }) => {
        const fallbackEmoji = item.type === 'perdido' ? '🐕' : '🐈';

        return (
            <View className="bg-white p-4 rounded-2xl mr-4 w-44 shadow-sm border border-gray-100 items-center">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3 overflow-hidden border-2 border-green-100">
                    {item.image_data ? (
                        <Image 
                            source={{ uri: item.image_data }} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Text className="text-2xl">{fallbackEmoji}</Text>
                    )}
                </View>
                
                <Text 
                    className="font-bold text-gray-800 text-lg mb-1 text-center" 
                    numberOfLines={1}
                >
                    {item.pet_name}
                </Text>
                
                <View className="bg-green-100 px-2 py-0.5 rounded-full mb-2">
                    <Text className="text-xs text-green-700 font-bold uppercase">
                        Encontrado
                    </Text>
                </View>

                <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={12} color="#6b7280" />
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                        {item.neighborhood}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                
                <LinearGradient
                    colors={['#6d28d9', '#7c3aed', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="pb-12 rounded-b-[40px] shadow-2xl"
                >
                    <SafeAreaView edges={['top']}>
                        <View className={`px-6 pt-4 ${isWeb ? 'max-w-6xl self-center w-full' : ''}`}>
                            <View className="flex-row justify-between items-center mb-8">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center backdrop-blur-md">
                                        <Ionicons name="paw" size={24} color="#fff" />
                                    </View>
                                    <Text className="text-white font-bold text-xl tracking-wider">Pet Finder</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => router.push('/login')}
                                    className="bg-white/20 px-4 py-2 rounded-full border border-white/30"
                                >
                                    <Text className="text-white font-semibold">Entrar</Text>
                                </TouchableOpacity>
                            </View>

                            <View className={`mt-4 ${isWeb ? 'flex-row items-center justify-between gap-10' : ''}`}>
                                <View className={isWeb ? 'flex-1' : ''}>
                                    <View className="bg-orange-400 self-start px-3 py-1 rounded-full mb-4">
                                        <Text className="text-white text-xs font-bold uppercase tracking-widest">Salvador - BA</Text>
                                    </View>
                                    <Text className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                                        Reunindo pets e famílias.
                                    </Text>
                                    <Text className="text-purple-100 text-lg mb-8 leading-6">
                                        A maior comunidade de busca de animais perdidos da Bahia. 
                                        Conecte-se com quem pode ajudar agora mesmo.
                                    </Text>

                                    <View className="flex-row gap-4 mb-8">
                                        <TouchableOpacity 
                                            activeOpacity={0.9}
                                            onPress={() => router.push('/register')}
                                            className="bg-white px-8 py-4 rounded-2xl shadow-lg shadow-purple-900/20 flex-1 md:flex-none items-center flex-row justify-center gap-2"
                                        >
                                            <Text className="text-purple-700 font-bold text-lg">Criar Conta</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#7c3aed" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            onPress={() => router.push('/login')}
                                            className="bg-purple-800/40 border border-purple-400/30 px-6 py-4 rounded-2xl flex-1 md:flex-none items-center justify-center"
                                        >
                                            <Text className="text-white font-semibold text-lg">Tenho conta</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View className={`bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md ${isWeb ? 'w-80' : 'w-full'}`}>
                                    <View className="flex-row justify-between items-center mb-4 border-b border-white/10 pb-4">
                                        <View>
                                            <Text className="text-2xl font-bold text-white">100%</Text>
                                            <Text className="text-purple-200 text-xs">Gratuito</Text>
                                        </View>
                                        <View className="w-10 h-10 bg-green-400 rounded-full items-center justify-center">
                                            <Ionicons name="pricetag" size={20} color="#fff" />
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <View>
                                            <Text className="text-xl font-bold text-white">Comunidade</Text>
                                            <Text className="text-purple-200 text-xs">Ativa e Solidária</Text>
                                        </View>
                                        <View className="w-10 h-10 bg-blue-400 rounded-full items-center justify-center">
                                            <Ionicons name="people" size={20} color="#fff" />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View className={`flex-1 ${isWeb ? 'max-w-6xl self-center w-full px-6' : ''}`}>

                    <View className="mt-8 px-6">
                        <View className="flex-row justify-between items-end mb-4">
                            <Text className="text-xl font-bold text-gray-800">Reencontros Recentes</Text>
                        </View>
                        
                        {loading ? (
                            <View className="h-[160px] items-center justify-center">
                                <ActivityIndicator size="large" color="#7c3aed" />
                                <Text className="text-gray-400 text-sm mt-2">Buscando histórias...</Text>
                            </View>
                        ) : stories.length === 0 ? (
                            <View className="bg-white p-6 rounded-2xl items-center border border-gray-100">
                                <Text className="text-gray-500">Nenhum pet encontrado recentemente.</Text>
                            </View>
                        ) : (
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}
                                className="overflow-visible"
                            >
                                {stories.map((story) => (
                                    <StoryCard key={story.id} item={story} />
                                ))}
                                
                                <TouchableOpacity 
                                    onPress={() => router.push('/login')}
                                    className="bg-purple-50 p-4 rounded-2xl mr-4 w-32 items-center justify-center border border-purple-100"
                                >
                                    <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-2 shadow-sm">
                                        <Ionicons name="heart" size={24} color="#7c3aed" />
                                    </View>
                                    <Text className="text-purple-700 font-bold text-center">Ver todos</Text>
                                    <Text className="text-purple-400 text-xs text-center">Faça Login</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>

                    {/* --- AQUI ESTÁ A NOVA SEÇÃO: COMO FUNCIONA --- */}
                    <View className="mt-10 px-6">
                        <Text className="text-xl font-bold text-gray-800 mb-6">Como funciona a plataforma?</Text>
                        <View className="flex-col gap-4">
                            
                            {/* Card: PERDI MEU PET */}
                            <View className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex-row gap-4 items-start">
                                <View className="bg-red-100 w-12 h-12 rounded-full items-center justify-center shrink-0">
                                    <Ionicons name="search" size={24} color="#dc2626" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 text-lg mb-1">Perdi meu Pet</Text>
                                    <Text className="text-gray-600 leading-5">
                                        Selecione a opção <Text className="font-bold text-red-600">Perdido</Text> no cadastro. A comunidade será alertada com a foto e local.
                                    </Text>
                                </View>
                            </View>

                            {/* Card: ENCONTREI UM PET */}
                            <View className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex-row gap-4 items-start">
                                <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center shrink-0">
                                    <Ionicons name="home" size={24} color="#16a34a" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 text-lg mb-1">Encontrei um Pet</Text>
                                    <Text className="text-gray-600 leading-5">
                                        Viu um animal sozinho? Selecione <Text className="font-bold text-green-600">Encontrado</Text>, tire uma foto e marque o local.
                                    </Text>
                                </View>
                            </View>

                        </View>
                    </View>
                    {/* --------------------------------------------- */}

                    <View className="mt-10 px-6">
                        <Text className="text-xl font-bold text-gray-800 mb-6">Recursos Úteis</Text>
                        <View className={`flex-row flex-wrap gap-4 ${isWeb ? 'justify-between' : ''}`}>
                            {features.map((feature, index) => (
                                <View key={index} className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm ${isWeb ? 'flex-1' : 'w-full'}`}>
                                    <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mb-4">
                                        <Ionicons name={feature.icon as any} size={24} color="#7c3aed" />
                                    </View>
                                    <Text className="text-lg font-bold text-gray-800 mb-2">{feature.title}</Text>
                                    <Text className="text-gray-500 leading-5">{feature.desc}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="mt-10 px-6 mb-12">
                        <Text className="text-xl font-bold text-gray-800 mb-4">Dicas de Segurança</Text>
                        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            {safetyTips.map((tip, index) => (
                                <View key={index} className={`flex-row items-center py-3 ${index !== safetyTips.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center mr-4">
                                        <Ionicons name={tip.icon as any} size={16} color="#15803d" />
                                    </View>
                                    <Text className="text-gray-600 font-medium flex-1">{tip.text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="px-6 mb-20">
                        <LinearGradient
                            colors={['#1f2937', '#111827']}
                            className="rounded-3xl p-8 relative overflow-hidden"
                        >
                            <View className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl" />
                            <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />

                            <Text className="text-white font-bold text-2xl mb-2">Viu um pet perdido?</Text>
                            <Text className="text-gray-400 mb-6">Ajude a devolver a alegria para uma família hoje mesmo.</Text>
                            
                            <TouchableOpacity 
                                onPress={() => router.push('/register')}
                                className="bg-white py-4 rounded-xl items-center"
                            >
                                <Text className="text-gray-900 font-bold text-lg">Reportar Agora</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}