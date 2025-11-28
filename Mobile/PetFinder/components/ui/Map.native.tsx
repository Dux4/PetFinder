import React, { useRef, useState } from 'react';
import { Text, View, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface Announcement {
    id: number;
    title: string;
    image_data?: string;
    type: 'perdido' | 'encontrado';
    status: 'ativo' | 'encontrado';
    pet_name: string;
    description?: string;
    neighborhood?: string;
    created_at: string;
    latitude: string;
    longitude: string;
    user: {
        id: number;
        name: string;
        phone: string;
        email: string;
    };
    user_id: number;
}

interface MapProps {
    announcements: Announcement[];
    onViewDetail: (announcement: Announcement) => void;
}

const MapNative: React.FC<MapProps> = ({ announcements, onViewDetail }) => {
    const mapRef = useRef<MapView>(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const validAnnouncements = announcements.filter(a =>
        a.latitude && a.longitude &&
        !isNaN(parseFloat(a.latitude)) && !isNaN(parseFloat(a.longitude)) &&
        parseFloat(a.latitude) !== 0 && parseFloat(a.longitude) !== 0
    );

    const lostPets = validAnnouncements.filter(a => a.type === 'perdido');
    const foundPets = validAnnouncements.filter(a => a.type === 'encontrado');

    const handleMarkerPress = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
    };

    const handleViewDetail = () => {
        if (selectedAnnouncement) {
            onViewDetail(selectedAnnouncement);
            setSelectedAnnouncement(null);
        }
    };

    return (
        <View className="flex-1">
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: -12.9714,
                    longitude: -38.5014,
                    latitudeDelta: 0.3,
                    longitudeDelta: 0.3,
                }}
            >
                {validAnnouncements.map((announcement) => {
                    const lat = parseFloat(announcement.latitude);
                    const lng = parseFloat(announcement.longitude);
                    const isPerdido = announcement.type === 'perdido';

                    return (
                        <Marker
                            key={announcement.id}
                            coordinate={{
                                latitude: lat,
                                longitude: lng,
                            }}
                            onPress={() => handleMarkerPress(announcement)}
                        >
                            <View className={`w-8 h-8 rounded-full border-[3px] border-white items-center justify-center shadow-lg ${
                                isPerdido ? 'bg-red-600' : 'bg-green-600'
                            }`}>
                                {isPerdido ? (
                                    <Ionicons name="search" size={16} color="white" />
                                ) : (
                                    <Ionicons name="checkmark" size={18} color="white" />
                                )}
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Badges Flutuantes */}
            <View className="absolute top-4 left-4 right-4 flex-row flex-wrap gap-2 z-20">
                <View className="bg-white/95 border border-red-200 px-3 py-2 rounded-full shadow-sm">
                    <View className="flex-row items-center gap-1.5">
                        <View className="w-2 h-2 rounded-full bg-red-600" />
                        <Text className="text-red-700 font-semibold text-xs">
                            Perdidos: {lostPets.length}
                        </Text>
                    </View>
                </View>
                
                <View className="bg-white/95 border border-green-200 px-3 py-2 rounded-full shadow-sm">
                    <View className="flex-row items-center gap-1.5">
                        <View className="w-2 h-2 rounded-full bg-green-600" />
                        <Text className="text-green-700 font-semibold text-xs">
                            Encontrados: {foundPets.length}
                        </Text>
                    </View>
                </View>
                
                <View className="bg-white/95 border border-purple-200 px-3 py-2 rounded-full shadow-sm">
                    <View className="flex-row items-center gap-1.5">
                        <MaterialIcons name="pets" size={14} color="#7c3aed" />
                        <Text className="text-purple-700 font-semibold text-xs">
                            Total: {validAnnouncements.length}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Modal de Detalhes do Marcador */}
            {selectedAnnouncement && (
                <View className="absolute inset-0 z-[1000]">
                    <TouchableOpacity 
                        className="absolute inset-0 bg-black/50"
                        activeOpacity={1}
                        onPress={() => setSelectedAnnouncement(null)}
                    />
                    <View className="absolute bottom-5 left-5 right-5 bg-white rounded-xl max-h-[70%] shadow-2xl overflow-hidden">
                        {/* Header */}
                        <View className={`p-4 ${
                            selectedAnnouncement.type === 'perdido' ? 'bg-red-600' : 'bg-green-600'
                        }`}>
                            <View className="flex-row items-center justify-center gap-2">
                                {selectedAnnouncement.type === 'perdido' ? (
                                    <Ionicons name="search" size={20} color="white" />
                                ) : (
                                    <FontAwesome5 name="home" size={18} color="white" />
                                )}
                                <Text className="text-white font-bold text-base text-center">
                                    {selectedAnnouncement.pet_name} - {selectedAnnouncement.type === 'perdido' ? 'Perdido' : 'Encontrado'}
                                </Text>
                            </View>
                        </View>

                        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                            {/* Imagem do Pet */}
                            {selectedAnnouncement.image_data && (
                                <Image 
                                    source={{ uri: selectedAnnouncement.image_data }}
                                    className="w-full h-44 rounded-xl mb-4"
                                    resizeMode="cover"
                                />
                            )}

                            {/* Localização */}
                            <View className="flex-row items-center mb-3 gap-2">
                                <MaterialIcons name="location-on" size={20} color="#7c3aed" />
                                <Text className="text-gray-700 font-medium text-sm flex-1">
                                    {selectedAnnouncement.neighborhood || 'Não informado'}
                                </Text>
                            </View>

                            {/* Data */}
                            <View className="flex-row items-center mb-3 gap-2">
                                <MaterialIcons name="calendar-today" size={18} color="#9333ea" />
                                <Text className="text-gray-600 text-sm flex-1">
                                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('pt-BR')}
                                </Text>
                            </View>

                            {/* Botão Ver Detalhes */}
                            <TouchableOpacity 
                                className="w-full p-3.5 bg-purple-600 rounded-lg mt-2 shadow-md active:bg-purple-700"
                                onPress={handleViewDetail}
                                activeOpacity={0.8}
                            >
                                <View className="flex-row items-center justify-center gap-2">
                                    <MaterialIcons name="visibility" size={18} color="white" />
                                    <Text className="text-white font-semibold text-sm">
                                        Ver Detalhes Completos
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Botão Fechar */}
                        <TouchableOpacity 
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 items-center justify-center z-10"
                            onPress={() => setSelectedAnnouncement(null)}
                        >
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Empty State */}
            {validAnnouncements.length === 0 && (
                <View className="absolute inset-0 bg-white/95 justify-center items-center z-10">
                    <View className="items-center px-8 max-w-[400px]">
                        <View className="w-24 h-24 bg-purple-100 rounded-full items-center justify-center mb-6">
                            <MaterialIcons name="map" size={48} color="#7c3aed" />
                        </View>
                        <Text className="text-xl font-semibold text-gray-800 mb-3 text-center">
                            Nenhum pet localizado
                        </Text>
                        <Text className="text-sm text-gray-600 text-center leading-5">
                            Quando houver anúncios com localização GPS válida, os marcadores aparecerão automaticamente aqui no mapa de Salvador.
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default MapNative;