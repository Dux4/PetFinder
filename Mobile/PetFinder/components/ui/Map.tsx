import React from 'react';
import { Platform } from 'react-native';

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

// Importação condicional baseada na plataforma
let MapComponent: React.FC<MapProps>;

if (Platform.OS === 'web') {
    MapComponent = require('./Map.web').default;
} else {
    MapComponent = require('./Map.native').default;
}

const Map: React.FC<MapProps> = (props) => {
    return <MapComponent {...props} />;
};

export default Map;