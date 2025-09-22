import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

interface MapComponentProps {
    onPress: (e: any) => void;
    selectedPosition: [number, number];
    mapRef: React.MutableRefObject<MapView | null>;
}

const MapComponent: React.FC<MapComponentProps> = ({ onPress, selectedPosition, mapRef }) => {
    return (
        <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
                latitude: selectedPosition[0],
                longitude: selectedPosition[1],
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
            onPress={onPress}
        >
            {selectedPosition && <Marker coordinate={{ latitude: selectedPosition[0], longitude: selectedPosition[1] }} />}
        </MapView>
    );
};

export default MapComponent;