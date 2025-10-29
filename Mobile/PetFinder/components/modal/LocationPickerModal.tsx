// import React from 'react';
// import { Platform } from 'react-native';

// interface LocationPickerModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: (position: [number, number]) => void;
//   currentPosition: [number, number] | null;
// }

// // Importação condicional baseada na plataforma
// let LocationPickerModalComponent: React.FC<LocationPickerModalProps>;

// if (Platform.OS === 'web') {
//     LocationPickerModalComponent = require('./LocationPickerModal.web').default;
// } else {
//     LocationPickerModalComponent = require('./LocationPickerModal.native').default;
// }

// const LocationPickerModal: React.FC<LocationPickerModalProps> = (props) => {
//     return <LocationPickerModalComponent {...props} />;
// };

// export default LocationPickerModal;