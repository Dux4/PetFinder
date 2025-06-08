class LocationController {
  static getNeighborhoods(req, res) {
    const salvadorNeighborhoods = [
      'Pelourinho', 'Barra', 'Itapuã', 'Pituba', 'Liberdade', 'Campo Grande',
      'Rio Vermelho', 'Ondina', 'Federação', 'Brotas', 'Nazaré', 'Barris',
      'Graça', 'Vitória', 'Corredor da Vitória', 'Canela', 'Imbuí', 
      'Caminho das Árvores', 'Pituaçu', 'Costa Azul', 'Armação', 'Patamares'
    ];
    
    res.json(salvadorNeighborhoods);
  }

  static getLocationFromCoords(req, res) {
    const { latitude, longitude } = req.body;
    
    const neighborhoods = ['Pelourinho', 'Barra', 'Itapuã', 'Pituba', 'Rio Vermelho'];
    const randomNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    
    res.json({
      neighborhood: randomNeighborhood,
      latitude,
      longitude,
      address: `${randomNeighborhood}, Salvador - BA`
    });
  }
}

module.exports = LocationController;