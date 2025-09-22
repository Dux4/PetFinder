import React from 'react';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { StyleSheet } from 'react-native';

interface MapComponentProps {
    selectedPosition: [number, number];
    onPress: (e: any) => void;
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
            <UrlTile
                urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
            />
            {selectedPosition && <Marker coordinate={{ latitude: selectedPosition[0], longitude: selectedPosition[1] }} />}
        </MapView>
    );
};

export default MapComponent;