import React, { useState } from 'react';
import { Text, View, Platform } from 'react-native';

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

// Componente Leaflet para Web
const LeafletMap: React.FC<MapProps> = ({ announcements, onViewDetail }) => {
    const [mapLoaded, setMapLoaded] = useState(false);

    React.useEffect(() => {
        if (Platform.OS === 'web') {
            const loadLeaflet = async () => {
                // Carrega CSS do Leaflet
                if (!document.querySelector('#leaflet-css')) {
                    const link = document.createElement('link');
                    link.id = 'leaflet-css';
                    link.rel = 'stylesheet';
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(link);
                }

                // Carrega JS do Leaflet
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
                    mapElement.innerHTML = '';

                    const map = window.L.map('leaflet-map').setView([-12.9714, -38.5014], 11);

                    // Tiles do OpenStreetMap
                    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }).addTo(map);

                    // Adiciona marcadores
                    announcements.forEach(announcement => {
                        const lat = parseFloat(announcement.latitude);
                        const lng = parseFloat(announcement.longitude);

                        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                            const icon = window.L.divIcon({
                                className: 'custom-marker',
                                html: `<div style="
                                    width: 32px; 
                                    height: 32px; 
                                    border-radius: 50%; 
                                    background: ${announcement.type === 'perdido' ? '#dc2626' : '#16a34a'};
                                    border: 3px solid white;
                                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 14px;
                                    cursor: pointer;
                                    transition: transform 0.2s;
                                ">${announcement.type === 'perdido' ? '🔍' : '✓'}</div>`,
                                iconSize: [32, 32],
                                iconAnchor: [16, 16]
                            });

                            const marker = window.L.marker([lat, lng], { icon }).addTo(map);

                            const imageHtml = announcement.image_data ? `
                                <img src="${announcement.image_data}" 
                                    style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />
                            ` : '';

                            const popupContent = `
                                <div style="min-width: 240px; font-family: system-ui, -apple-system, sans-serif;">
                                    <div style="
                                        background: linear-gradient(135deg, ${announcement.type === 'perdido' ? '#dc2626, #b91c1c' : '#16a34a, #15803d'}); 
                                        color: white; 
                                        padding: 12px 16px; 
                                        margin: -10px -13px 12px -13px;
                                        font-weight: 700;
                                        font-size: 15px;
                                        border-radius: 8px 8px 0 0;
                                    ">
                                        ${announcement.pet_name} - ${announcement.type === 'perdido' ? '🔍 Perdido' : '🏠 Encontrado'}
                                    </div>
                                    ${imageHtml}
                                    <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                                        <span style="color: #7c3aed;">📍</span>
                                        <span style="color: #374151; font-weight: 500;">${announcement.neighborhood || 'Não informado'}</span>
                                    </div>
                                    <div style="margin-bottom: 12px; color: #6b7280; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                                        <span>📅</span>
                                        <span>${new Date(announcement.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <button 
                                        onclick="window.showAnnouncementDetail(${announcement.id})"
                                        style="
                                            width: 100%; 
                                            padding: 12px; 
                                            background: linear-gradient(135deg, #7c3aed, #6d28d9); 
                                            color: white; 
                                            border: none; 
                                            border-radius: 8px; 
                                            cursor: pointer;
                                            font-weight: 600;
                                            font-size: 14px;
                                            transition: all 0.2s;
                                            box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
                                        "
                                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(124, 58, 237, 0.4)'"
                                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(124, 58, 237, 0.3)'"
                                    >
                                        Ver Detalhes Completos
                                    </button>
                                </div>
                            `;

                            marker.bindPopup(popupContent, {
                                maxWidth: 280,
                                className: 'custom-popup'
                            });
                        }
                    });

                    // Adiciona CSS customizado para os popups
                    if (!document.querySelector('#custom-popup-style')) {
                        const style = document.createElement('style');
                        style.id = 'custom-popup-style';
                        style.textContent = `
                            .custom-popup .leaflet-popup-content-wrapper {
                                border-radius: 12px;
                                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                                padding: 0;
                            }
                            .custom-popup .leaflet-popup-tip {
                                display: none;
                            }
                            .custom-marker:hover > div {
                                transform: scale(1.15);
                            }
                        `;
                        document.head.appendChild(style);
                    }

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
            <View className="flex-1 justify-center items-center p-8 bg-gray-50">
                <View className="bg-white rounded-2xl p-6 items-center shadow-lg max-w-md">
                    <Text className="text-5xl mb-4">🗺️</Text>
                    <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">
                        Mapa Interativo
                    </Text>
                    <Text className="text-sm text-gray-600 text-center">
                        O mapa está disponível apenas na versão web. Utilize um navegador para visualizar a localização dos pets no mapa de Salvador.
                    </Text>
                </View>
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
                    minHeight: '500px',
                    borderRadius: '12px'
                }} 
            />
            {!mapLoaded && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    background: 'white',
                    padding: '24px 32px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e5e7eb',
                        borderTopColor: '#7c3aed',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px'
                    }}></div>
                    <div style={{ color: '#6b7280', fontWeight: '500' }}>
                        Carregando mapa...
                    </div>
                </div>
            )}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const Map: React.FC<MapProps> = ({ announcements, onViewDetail }) => {
    const validAnnouncements = announcements.filter(a =>
        a.latitude && a.longitude &&
        !isNaN(parseFloat(a.latitude)) && !isNaN(parseFloat(a.longitude)) &&
        parseFloat(a.latitude) !== 0 && parseFloat(a.longitude) !== 0
    );

    const lostPets = validAnnouncements.filter(a => a.type === 'perdido');
    const foundPets = validAnnouncements.filter(a => a.type === 'encontrado');

    return (
        <View className="flex-1">
            {/* Mapa em Tela Cheia */}
            <View className="flex-1">
                <LeafletMap announcements={validAnnouncements} onViewDetail={onViewDetail} />
                
                {/* Badges Flutuantes sobre o mapa */}
                <View className="absolute top-4 left-4 right-4 flex-row flex-wrap gap-2 z-20">
                    <View className="bg-white/95 backdrop-blur border border-red-200 px-3 py-2 rounded-full shadow-lg">
                        <Text className="text-red-700 font-semibold text-xs">
                            🔴 Perdidos: {lostPets.length}
                        </Text>
                    </View>
                    <View className="bg-white/95 backdrop-blur border border-green-200 px-3 py-2 rounded-full shadow-lg">
                        <Text className="text-green-700 font-semibold text-xs">
                            🟢 Encontrados: {foundPets.length}
                        </Text>
                    </View>
                    <View className="bg-white/95 backdrop-blur border border-purple-200 px-3 py-2 rounded-full shadow-lg">
                        <Text className="text-purple-700 font-semibold text-xs">
                            📍 Total: {validAnnouncements.length}
                        </Text>
                    </View>
                </View>
                
                {validAnnouncements.length === 0 && (
                    <View className="absolute inset-0 bg-white/95 justify-center items-center z-10">
                        <View className="items-center p-8 max-w-md">
                            <View className="w-24 h-24 bg-purple-100 rounded-full items-center justify-center mb-6">
                                <Text className="text-5xl">🗺️</Text>
                            </View>
                            <Text className="text-xl font-semibold text-gray-800 mb-3 text-center">
                                Nenhum pet localizado
                            </Text>
                            <Text className="text-sm text-gray-600 text-center leading-6">
                                Quando houver anúncios com localização GPS válida, os marcadores aparecerão automaticamente aqui no mapa de Salvador.
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

// Declarações TypeScript para window
declare global {
    interface Window {
        L: any;
        showAnnouncementDetail: (id: number) => void;
    }
}

export default Map;