import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Image as RNImage } from 'react-native';
import { Platform } from 'react-native';

interface Announcement {
    id: number;
    title: string;
    image_data?: string; // NOVO: Usa a propriedade Base64 da imagem
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

// Componente Leaflet para Web
const LeafletMap: React.FC<MapProps> = ({ announcements, onViewDetail }) => {
    const [mapLoaded, setMapLoaded] = useState(false);

    React.useEffect(() => {
        if (Platform.OS === 'web') {
            // Carregue as bibliotecas do Leaflet dinamicamente
            const loadLeaflet = async () => {
                // Carregue o CSS do Leaflet
                if (!document.querySelector('#leaflet-css')) {
                    const link = document.createElement('link');
                    link.id = 'leaflet-css';
                    link.rel = 'stylesheet';
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(link);
                }

                // Carregue o JS do Leaflet
                if (!window.L) {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = () => initializeMap();
                    document.head.appendChild(script);
                } else {
                    initializeMap();
                }
            };

            const initializeMap = () => {
                const mapElement = document.getElementById('leaflet-map');
                if (mapElement && window.L) {
                    // Limpe o mapa existente se houver
                    mapElement.innerHTML = '';

                    const map = window.L.map('leaflet-map').setView([-12.9714, -38.5014], 11);

                    // Adicione tiles do OpenStreetMap
                    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }).addTo(map);

                    // Adicione marcadores
                    announcements.forEach(announcement => {
                        const lat = parseFloat(announcement.latitude);
                        const lng = parseFloat(announcement.longitude);

                        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                            const icon = window.L.divIcon({
                                className: 'custom-marker',
                                html: `<div style="
                                    width: 25px; 
                                    height: 25px; 
                                    border-radius: 50%; 
                                    background-color: ${announcement.type === 'perdido' ? '#EF4444' : '#22C55E'};
                                    border: 3px solid white;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: bold;
                                    font-size: 10px;
                                ">${announcement.type === 'perdido' ? '🔍' : '✓'}</div>`,
                                iconSize: [25, 25],
                                iconAnchor: [12.5, 12.5]
                            });

                            const marker = window.L.marker([lat, lng], { icon }).addTo(map);

                            // Usa a propriedade image_data para o popup
                            const imageHtml = announcement.image_data ? `
                                <img src="${announcement.image_data}" 
                                    style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
                            ` : '';

                            const popupContent = `
                                <div style="min-width: 200px; font-family: Arial, sans-serif;">
                                    <div style="
                                        background: ${announcement.type === 'perdido' ? '#EF4444' : '#22C55E'}; 
                                        color: white; 
                                        padding: 8px; 
                                        margin: -9px -12px 8px -12px;
                                        font-weight: bold;
                                    ">
                                        ${announcement.pet_name} - ${announcement.type === 'perdido' ? 'Perdido' : 'Encontrado'}
                                    </div>
                                    ${imageHtml}
                                    <div style="margin-bottom: 4px;"><strong>Bairro:</strong> ${announcement.neighborhood || 'Não informado'}</div>
                                    <div style="margin-bottom: 8px; color: #666; font-size: 12px;">
                                        Publicado em: ${new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    <button 
                                        onclick="window.showAnnouncementDetail(${announcement.id})"
                                        style="
                                            width: 100%; 
                                            padding: 8px; 
                                            background: #4F46E5; 
                                            color: white; 
                                            border: none; 
                                            border-radius: 4px; 
                                            cursor: pointer;
                                            font-weight: bold;
                                        "
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            `;

                            marker.bindPopup(popupContent);
                        }
                    });

                    setMapLoaded(true);
                }
            };

            // Função global para callbacks dos popups
            window.showAnnouncementDetail = (announcementId: number) => {
                const announcement = announcements.find(a => a.id === announcementId);
                if (announcement) {
                    onViewDetail(announcement);
                }
            };

            loadLeaflet();
        }
    }, [announcements, onViewDetail]);

    if (Platform.OS !== 'web') {
        return (
            <View style={styles.unsupportedPlatform}>
                <Text style={styles.unsupportedText}>
                    Mapa disponível apenas na versão web. 
                    Use o aplicativo mobile para funcionalidade completa.
                </Text>
            </View>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div 
                id="leaflet-map" 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    minHeight: '400px',
                    borderRadius: '8px'
                }} 
            />
            {!mapLoaded && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    Carregando mapa...
                </div>
            )}
        </div>
    );
};

const Map: React.FC<MapProps> = ({ announcements, onViewDetail }) => {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Data inválida';
        }
    };

    const validAnnouncements = announcements.filter(a =>
        a.latitude && a.longitude &&
        !isNaN(parseFloat(a.latitude)) && !isNaN(parseFloat(a.longitude)) &&
        parseFloat(a.latitude) !== 0 && parseFloat(a.longitude) !== 0
    );

    const lostPets = validAnnouncements.filter(a => a.type === 'perdido');
    const foundPets = validAnnouncements.filter(a => a.type === 'encontrado');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mapa de Pets em Salvador</Text>
                <View style={styles.badgeContainer}>
                    <Text style={[styles.badge, styles.lostBadge]}>
                        🔴 Perdidos: {lostPets.length}
                    </Text>
                    <Text style={[styles.badge, styles.foundBadge]}>
                        🟢 Encontrados: {foundPets.length}
                    </Text>
                    <Text style={[styles.badge, styles.totalBadge]}>
                        📍 Total: {validAnnouncements.length}
                    </Text>
                </View>
            </View>

            <View style={styles.mapWrapper}>
                <LeafletMap announcements={validAnnouncements} onViewDetail={onViewDetail} />
                
                {validAnnouncements.length === 0 && (
                    <View style={styles.noPetsOverlay}>
                        <View style={styles.noPetsCard}>
                            <Text style={styles.noPetsEmoji}>🗺️</Text>
                            <Text style={styles.noPetsTitle}>Nenhum pet localizado</Text>
                            <Text style={styles.noPetsText}>
                                Quando houver anúncios com localização, eles aparecerão aqui no mapa.
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#4F46E5',
        padding: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 9999,
        fontWeight: '600',
        fontSize: 14,
    },
    lostBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        color: 'white',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 1,
    },
    foundBadge: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        color: 'white',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 1,
    },
    totalBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
    },
    mapWrapper: {
        flex: 1,
        position: 'relative',
        zIndex: 1,
    },
    noPetsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPetsCard: {
        alignItems: 'center',
        padding: 32,
    },
    noPetsEmoji: {
        fontSize: 48,
        marginBottom: 16,
        textAlign: 'center',
    },
    noPetsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
        textAlign: 'center',
    },
    noPetsText: {
        color: '#6B7280',
        textAlign: 'center',
    },
    unsupportedPlatform: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#F9FAFB',
    },
    unsupportedText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 16,
    },
});

// Declarações TypeScript para window
declare global {
    interface Window {
        L: any;
        showAnnouncementDetail: (id: number) => void;
    }
}

export default Map;