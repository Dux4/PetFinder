import React, { useRef, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, ScrollView, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

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
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
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
                            <View style={[
                                styles.markerContainer,
                                { backgroundColor: isPerdido ? '#dc2626' : '#16a34a' }
                            ]}>
                                <Text style={styles.markerEmoji}>
                                    {isPerdido ? '🔍' : '✓'}
                                </Text>
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Badges Flutuantes */}
            <View style={styles.badgesContainer}>
                <View style={styles.badgeLost}>
                    <Text style={styles.badgeTextLost}>
                        🔴 Perdidos: {lostPets.length}
                    </Text>
                </View>
                <View style={styles.badgeFound}>
                    <Text style={styles.badgeTextFound}>
                        🟢 Encontrados: {foundPets.length}
                    </Text>
                </View>
                <View style={styles.badgeTotal}>
                    <Text style={styles.badgeTextTotal}>
                        📍 Total: {validAnnouncements.length}
                    </Text>
                </View>
            </View>

            {/* Modal de Detalhes do Marcador */}
            {selectedAnnouncement && (
                <View style={styles.calloutContainer}>
                    <TouchableOpacity 
                        style={styles.calloutOverlay}
                        activeOpacity={1}
                        onPress={() => setSelectedAnnouncement(null)}
                    />
                    <View style={styles.calloutCard}>
                        {/* Header com gradiente simulado */}
                        <View style={[
                            styles.calloutHeader,
                            { backgroundColor: selectedAnnouncement.type === 'perdido' ? '#dc2626' : '#16a34a' }
                        ]}>
                            <Text style={styles.calloutHeaderText}>
                                {selectedAnnouncement.pet_name} - {selectedAnnouncement.type === 'perdido' ? '🔍 Perdido' : '🏠 Encontrado'}
                            </Text>
                        </View>

                        <ScrollView style={styles.calloutContent} showsVerticalScrollIndicator={false}>
                            {/* Imagem do Pet */}
                            {selectedAnnouncement.image_data && (
                                <Image 
                                    source={{ uri: selectedAnnouncement.image_data }}
                                    style={styles.petImage}
                                    resizeMode="cover"
                                />
                            )}

                            {/* Localização */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoIcon}>📍</Text>
                                <Text style={styles.infoText}>
                                    {selectedAnnouncement.neighborhood || 'Não informado'}
                                </Text>
                            </View>

                            {/* Data */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoIcon}>📅</Text>
                                <Text style={styles.infoTextSecondary}>
                                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('pt-BR')}
                                </Text>
                            </View>

                            {/* Botão Ver Detalhes */}
                            <TouchableOpacity 
                                style={styles.detailButton}
                                onPress={handleViewDetail}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.detailButtonText}>
                                    Ver Detalhes Completos
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Botão Fechar */}
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setSelectedAnnouncement(null)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {validAnnouncements.length === 0 && (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIcon}>
                            <Text style={styles.emptyEmoji}>🗺️</Text>
                        </View>
                        <Text style={styles.emptyTitle}>
                            Nenhum pet localizado
                        </Text>
                        <Text style={styles.emptyText}>
                            Quando houver anúncios com localização GPS válida, os marcadores aparecerão automaticamente aqui no mapa de Salvador.
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    markerEmoji: {
        fontSize: 14,
    },
    badgesContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        zIndex: 20,
    },
    badgeLost: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: '#fecaca',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    badgeTextLost: {
        color: '#b91c1c',
        fontWeight: '600',
        fontSize: 12,
    },
    badgeFound: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: '#bbf7d0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    badgeTextFound: {
        color: '#15803d',
        fontWeight: '600',
        fontSize: 12,
    },
    badgeTotal: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: '#e9d5ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    badgeTextTotal: {
        color: '#6d28d9',
        fontWeight: '600',
        fontSize: 12,
    },
    calloutContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    calloutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    calloutCard: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
        overflow: 'hidden',
    },
    calloutHeader: {
        padding: 16,
    },
    calloutHeaderText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
    calloutContent: {
        padding: 16,
    },
    petImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    infoIcon: {
        fontSize: 18,
    },
    infoText: {
        color: '#374151',
        fontWeight: '500',
        fontSize: 15,
        flex: 1,
    },
    infoTextSecondary: {
        color: '#6b7280',
        fontSize: 14,
        flex: 1,
    },
    detailButton: {
        width: '100%',
        padding: 14,
        backgroundColor: '#7c3aed',
        borderRadius: 10,
        marginTop: 8,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    detailButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    emptyContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    emptyCard: {
        alignItems: 'center',
        padding: 32,
        maxWidth: 400,
    },
    emptyIcon: {
        width: 96,
        height: 96,
        backgroundColor: '#f3e8ff',
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyEmoji: {
        fontSize: 48,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 21,
    },
});

export default MapNative;