import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

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

declare global {
    interface Window {
        L: any;
        showAnnouncementDetail: (id: number) => void;
    }
}

const LeafletMap: React.FC<MapProps> = ({ announcements, onViewDetail }) => {
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
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
                        const isPerdido = announcement.type === 'perdido';
                        const markerColor = isPerdido ? '#dc2626' : '#16a34a';
                        const iconSvg = isPerdido 
                            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`
                            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

                        const icon = window.L.divIcon({
                            className: 'custom-marker',
                            html: `<div style="
                                width: 32px; 
                                height: 32px; 
                                border-radius: 50%; 
                                background: ${markerColor};
                                border: 3px solid white;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                transition: transform 0.2s;
                            ">${iconSvg}</div>`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16]
                        });

                        const marker = window.L.marker([lat, lng], { icon }).addTo(map);

                        const imageHtml = announcement.image_data ? `
                            <img src="${announcement.image_data}" 
                                style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />
                        ` : '';

                        const headerIcon = isPerdido 
                            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`
                            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`;

                        const popupContent = `
                            <div style="min-width: 240px; font-family: system-ui, -apple-system, sans-serif;">
                                <div style="
                                    background: linear-gradient(135deg, ${isPerdido ? '#dc2626, #b91c1c' : '#16a34a, #15803d'}); 
                                    color: white; 
                                    padding: 12px 16px; 
                                    margin: -10px -13px 12px -13px;
                                    font-weight: 700;
                                    font-size: 15px;
                                    border-radius: 8px 8px 0 0;
                                    display: flex;
                                    align-items: center;
                                ">
                                    ${headerIcon}
                                    <span>${announcement.pet_name} - ${isPerdido ? 'Perdido' : 'Encontrado'}</span>
                                </div>
                                ${imageHtml}
                                <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7c3aed" width="18" height="18">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span style="color: #374151; font-weight: 500;">${announcement.neighborhood || 'Não informado'}</span>
                                </div>
                                <div style="margin-bottom: 12px; color: #6b7280; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9333ea" width="16" height="16">
                                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                                    </svg>
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
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 6px;
                                    "
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(124, 58, 237, 0.4)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(124, 58, 237, 0.3)'"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                    </svg>
                                    <span>Ver Detalhes Completos</span>
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
    }, [announcements, onViewDetail]);

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

const MapWeb: React.FC<MapProps> = ({ announcements, onViewDetail }) => {
    const validAnnouncements = announcements.filter(a =>
        a.latitude && a.longitude &&
        !isNaN(parseFloat(a.latitude)) && !isNaN(parseFloat(a.longitude)) &&
        parseFloat(a.latitude) !== 0 && parseFloat(a.longitude) !== 0
    );

    const lostPets = validAnnouncements.filter(a => a.type === 'perdido');
    const foundPets = validAnnouncements.filter(a => a.type === 'encontrado');

    return (
        <View className="flex-1">
            <View className="flex-1">
                <LeafletMap announcements={validAnnouncements} onViewDetail={onViewDetail} />
                
                {/* Badges Flutuantes */}
                <View className="absolute top-4 left-4 right-4 flex-row flex-wrap gap-2 z-20">
                    <View className="bg-white/95 backdrop-blur border border-red-200 px-3 py-2 rounded-full shadow-lg">
                        <View className="flex-row items-center gap-1.5">
                            <View className="w-2 h-2 rounded-full bg-red-600" />
                            <Text className="text-red-700 font-semibold text-xs">
                                Perdidos: {lostPets.length}
                            </Text>
                        </View>
                    </View>
                    
                    <View className="bg-white/95 backdrop-blur border border-green-200 px-3 py-2 rounded-full shadow-lg">
                        <View className="flex-row items-center gap-1.5">
                            <View className="w-2 h-2 rounded-full bg-green-600" />
                            <Text className="text-green-700 font-semibold text-xs">
                                Encontrados: {foundPets.length}
                            </Text>
                        </View>
                    </View>
                    
                    <View className="bg-white/95 backdrop-blur border border-purple-200 px-3 py-2 rounded-full shadow-lg">
                        <View className="flex-row items-center gap-1.5">
                            <MaterialIcons name="pets" size={14} color="#7c3aed" />
                            <Text className="text-purple-700 font-semibold text-xs">
                                Total: {validAnnouncements.length}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* Empty State */}
                {validAnnouncements.length === 0 && (
                    <View className="absolute inset-0 bg-white/95 justify-center items-center z-10">
                        <View className="items-center p-8 max-w-md">
                            <View className="w-24 h-24 bg-purple-100 rounded-full items-center justify-center mb-6">
                                <MaterialIcons name="map" size={48} color="#7c3aed" />
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

export default MapWeb;