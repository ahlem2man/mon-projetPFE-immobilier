import React from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet par défaut
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Coordonnées par ville (France)
const cityCoordinates = {
  'Paris': [48.8566, 2.3522],
  'Lyon': [45.7640, 4.8357],
  'Marseille': [43.2965, 5.3698],
  'Toulouse': [43.6047, 1.4442],
  'Nice': [43.7102, 7.2620],
  'Nantes': [47.2184, -1.5536],
  'Bordeaux': [44.8378, -0.5792],
  'Lille': [50.6292, 3.0573],
  'Rennes': [48.1173, -1.6778],
  'Reims': [49.2583, 4.0317],
  'Le Havre': [49.5104, 0.1076],
  'Saint-Étienne': [42.3976, 4.3900],
  'Toulon': [43.1256, 5.9355],
  'Grenoble': [45.1885, 5.7245],
  'Dijon': [47.3215, 5.0356],
  'Angers': [47.4829, -0.5517],
  'Nîmes': [43.8345, 4.3560],
  'Strasbourg': [48.5734, 7.7521],
  'Montpellier': [43.6108, 3.8767],
  'Avignon': [43.9493, 4.8055],
  'Limoges': [45.8642, 1.2610],
  'Orléans': [47.9029, 1.9094],
  'Rouen': [49.4432, 1.0993],
  'Mulhouse': [47.7412, 7.3244],
  'Clermont-Ferrand': [45.7772, 3.0862],
  'Saint-Denis': [48.9361, 2.3522],
  'Montreuil': [48.8615, 2.4426],
  'Courbevoie': [48.8986, 2.2595],
  'La Plaine Saint-Denis': [48.9361, 2.3522],
  'Villeurbanne': [45.7760, 4.8840]
};

const PropertyMap = ({ lat, lng, title, location }) => {
  // Anciennes coordonnées tunisiennes
  const tunisiaCoords = [
    [36.8065, 10.1815], // Tunis (défaut)
    [34.7406, 10.7603], // Sfax
    [35.8257, 10.6369], // Sousse
    [36.8628, 10.1640], // Ariana
  ];
  
  // Vérifier si ce sont des coords tunisiennes
  const isTunisiaCoord = tunisiaCoords.some(coord => 
    Math.abs(coord[0] - lat) < 0.01 && Math.abs(coord[1] - lng) < 0.01
  );
  
  // Déterminer la position de la carte
  // Priorité: 1) location valide, 2) coords valides (non-tunisiennes), 3) Paris par défaut
  let position;
  
  // D'abord, vérifier si on a une location valide pour une ville française
  if (location && cityCoordinates[location]) {
    // Utiliser les coordonnées de la ville spécifiée
    position = cityCoordinates[location];
  } else if (!isTunisiaCoord && lat && lng) {
    // Si les coordonnées ne sont pas tunisiennes et sont valides, les utiliser
    position = [lat, lng];
  } else if (location && !cityCoordinates[location]) {
    // Si on a un location mais c'est pas dans notre liste, on logs et on utilise Paris
    console.log(`Ville "${location}" non trouvée dans la base de données cartographique`);
    position = [48.8566, 2.3522];
  } else {
    // Par défaut: Paris
    position = [48.8566, 2.3522];
  }

  return (
    <Box sx={{ height: '400px', width: '100%', borderRadius: 4, overflow: 'hidden', mt: 4, border: '1px solid #ddd' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={position} icon={DefaultIcon}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default PropertyMap;