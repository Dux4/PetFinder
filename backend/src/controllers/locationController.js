class LocationController {
  static getNeighborhoods(req, res) {
    const salvadorNeighborhoods = [
      'Pelourinho', 'Barra', 'Itapuã', 'Pituba', 'Liberdade', 'Campo Grande',
      'Rio Vermelho', 'Ondina', 'Federação', 'Brotas', 'Nazaré', 'Barris',
      'Graça', 'Vitória', 'Corredor da Vitória', 'Canela', 'Imbuí', 
      'Caminho das Árvores', 'Pituaçu', 'Costa Azul', 'Armação', 'Patamares',
      'Stella Maris', 'Flamengo', 'Jardim Armação'
    ];
    
    res.json(salvadorNeighborhoods);
  }

  static getLocationFromCoords(req, res) {
    const { latitude, longitude } = req.body;
    
    // Coordenadas reais dos bairros de Salvador
    const neighborhoodCoords = {
      'Pelourinho': { lat: -12.9714, lng: -38.5014 },
      'Barra': { lat: -12.9818, lng: -38.4652 },
      'Itapuã': { lat: -12.9398, lng: -38.4087 },
      'Pituba': { lat: -12.9934, lng: -38.4506 },
      'Liberdade': { lat: -12.9055, lng: -38.3364 },
      'Campo Grande': { lat: -12.9645, lng: -38.5105 },
      'Rio Vermelho': { lat: -12.9547, lng: -38.4920 },
      'Ondina': { lat: -12.9666, lng: -38.5134 },
      'Federação': { lat: -12.9562, lng: -38.5015 },
      'Brotas': { lat: -12.9234, lng: -38.4567 },
      'Nazaré': { lat: -12.9678, lng: -38.5089 },
      'Barris': { lat: -12.9612, lng: -38.5178 },
      'Graça': { lat: -12.9589, lng: -38.5145 },
      'Vitória': { lat: -12.9723, lng: -38.5234 },
      'Corredor da Vitória': { lat: -12.9756, lng: -38.5189 },
      'Canela': { lat: -12.9634, lng: -38.5098 },
      'Imbuí': { lat: -12.9845, lng: -38.4234 },
      'Caminho das Árvores': { lat: -12.9789, lng: -38.4345 },
      'Pituaçu': { lat: -12.9823, lng: -38.4123 },
      'Costa Azul': { lat: -12.9712, lng: -38.4089 },
      'Armação': { lat: -12.9567, lng: -38.3989 },
      'Patamares': { lat: -12.9434, lng: -38.3812 },
      'Stella Maris': { lat: -12.9234, lng: -38.3712 },
      'Flamengo': { lat: -12.9123, lng: -38.3634 }
    };
    
    // Encontrar bairro mais próximo
    let closestNeighborhood = 'Pelourinho';
    let minDistance = Infinity;
    
    Object.entries(neighborhoodCoords).forEach(([name, coords]) => {
      const distance = Math.sqrt(
        Math.pow(latitude - coords.lat, 2) + Math.pow(longitude - coords.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestNeighborhood = name;
      }
    });
    
    res.json({
      neighborhood: closestNeighborhood,
      latitude,
      longitude,
      address: `${closestNeighborhood}, Salvador - BA`
    });
  }

  static getNeighborhoodCoords(req, res) {
    const { neighborhood } = req.query;
    
    const coords = {
      'Pelourinho': { lat: -12.9714, lng: -38.5014 },
      'Barra': { lat: -12.9818, lng: -38.4652 },
      'Itapuã': { lat: -12.9398, lng: -38.4087 },
      'Pituba': { lat: -12.9934, lng: -38.4506 },
      'Liberdade': { lat: -12.9055, lng: -38.3364 },
      'Campo Grande': { lat: -12.9645, lng: -38.5105 },
      'Rio Vermelho': { lat: -12.9547, lng: -38.4920 },
      'Ondina': { lat: -12.9666, lng: -38.5134 },
      'Federação': { lat: -12.9562, lng: -38.5015 },
      'Brotas': { lat: -12.9234, lng: -38.4567 }
    };

    const selectedCoords = coords[neighborhood] || coords['Pelourinho'];
    
    res.json({
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      neighborhood,
      address: `${neighborhood}, Salvador - BA`
    });
  }
}

module.exports = LocationController;