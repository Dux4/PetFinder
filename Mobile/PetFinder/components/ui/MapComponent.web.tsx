import React from 'react';
import { View, Text } from 'react-native';

interface MapComponentProps {
    onPress: (e: any) => void;
    selectedPosition: [number, number];
    mapRef: any;
}

const MapComponent: React.FC<MapComponentProps> = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>
                O mapa não está disponível na web. Use o aplicativo no seu celular.
            </Text>
        </View>
    );
};

export default MapComponent;