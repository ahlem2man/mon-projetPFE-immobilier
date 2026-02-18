import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material'; // Importation de Button
import './PropertyCard.css'; 

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

  // Fonction pour gérer la redirection
  const handleDetailsClick = () => {
    navigate(`/property/${property._id}`);
  };

  return (
    <div className="property-card">
      {/* 1. Image et Statut */}
      <div className="property-image">
        <img 
          src={property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={property.title} 
        />
        <div className={`status-badge ${property.status}`}>
          {property.status}
        </div>
      </div>
      
      {/* 2. Informations textuelles */}
      <div className="property-content">
        <h3 className="property-title">{property.title}</h3>
        <p className="property-location">
          <span>📍</span> {property.location}
        </p>
        
        {/* 3. Caractéristiques */}
        <div className="property-specs">
          <div className="spec-item">
            <span>🛏️</span> {property.rooms} Ch
          </div>
          <div className="spec-item">
            <span>📐</span> {property.surface} m²
          </div>
          <div className="spec-item">
            <span>🏢</span> {property.type}
          </div>
        </div>
        
        <hr />
        
        {/* 4. Prix et Action */}
        <div className="property-footer">
          <div className="price-tag">
            <span className="amount">{property.price}</span>
            <span className="currency"> DT</span>
          </div>
        </div>

        {/* Bouton unique pour les détails */}
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleDetailsClick}
          sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
        >
          Voir les Détails
        </Button>
      </div>
    </div>
  );
};

export default PropertyCard;