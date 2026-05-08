import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Snackbar, Alert, Box } from '@mui/material'; 
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ApartmentIcon from '@mui/icons-material/Apartment';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { buildImageUrl } from '../utils/imageUrl';
import './PropertyCard.css'; 

const PropertyCard = ({ property, onFavoriteChange }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // États pour les favoris et notifications
  const [isFav, setIsFav] = useState(false);

  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Charger l'état des favoris depuis l'API Sprint 4
  useEffect(() => {
    const checkFavorite = async () => {
      const token = localStorage.getItem('token');
      if (!token || !user?.id) {
        setIsFav(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/tenant/favorites/check/${property._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFav(res.data.isFavorite || false);
      } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
        setIsFav(false);
      }
    };

    checkFavorite();
  }, [property._id, user?.id]);

  const handleDetailsClick = () => {
    navigate(`/property/${property._id}`);
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token'); 

    if (!token || !user) {
      setSnackbarMessage('Veuillez vous connecter pour ajouter des favoris');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      // Utilise l'API Sprint 4 : POST ou DELETE selon l'état actuel
      const method = isFav ? 'delete' : 'post';
      const endpoint = `${API_BASE_URL}/tenant/favorites/${property._id}`;
      
      if (isFav) {
        await axios.delete(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(endpoint, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      const newFavState = !isFav;
      setIsFav(newFavState);
      
      setSnackbarMessage(
        newFavState ? 'Ajouté aux favoris' : 'Retiré des favoris'
      );
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Callback pour rafraîchir la liste si nécessaire
      if (onFavoriteChange) {
        onFavoriteChange(property._id, newFavState);
      }
    } catch (err) {
      setSnackbarMessage('Erreur lors de la modification des favoris');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      console.error("Erreur toggle favori:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <div className="property-card">
        <div className="property-image">
          <img 
            src={buildImageUrl(property.images && property.images[0])} 
            alt={property.title} 
          />
          
          <div className={`status-badge ${property.status}`}>
            {property.status}
          </div>

          <IconButton 
            onClick={handleFavoriteToggle}
            disabled={loading}
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              '&:hover': { backgroundColor: 'white' },
              transition: 'all 0.2s ease',
              '& svg': {
                transition: 'transform 0.2s ease',
              },
              '&:active svg': {
                transform: isFav ? 'scale(1.2)' : 'scale(0.95)'
              }
            }}
            color="error"
          >
            {isFav ? (
              <FavoriteIcon className="heart-icon favorite" sx={{ color: '#ff5252' }} /> 
            ) : (
              <FavoriteBorderIcon className="heart-icon" sx={{ color: '#ff5252' }} />
            )}
          </IconButton>
        </div>
        
        <div className="property-content">
          <h3 className="property-title">{property.title}</h3>
          <p className="property-location">
            <LocationOnIcon sx={{ fontSize: '1.2rem', marginRight: '0.5rem', color: '#00bcd4', verticalAlign: 'middle', display: 'inline' }} /> {property.location}
          </p>
          
          <div className="property-specs">
            <div className="spec-item"><BedIcon sx={{ fontSize: '1rem', marginRight: '0.3rem', verticalAlign: 'middle', display: 'inline' }} /> {property.rooms} Ch</div>
            <div className="spec-item"><SquareFootIcon sx={{ fontSize: '1rem', marginRight: '0.3rem', verticalAlign: 'middle', display: 'inline' }} /> {property.surface} m²</div>
            <div className="spec-item"><ApartmentIcon sx={{ fontSize: '1rem', marginRight: '0.3rem', verticalAlign: 'middle', display: 'inline' }} /> {property.type}</div>
          </div>
          
          <hr />
          
          <div className="property-footer">
            <div className="price-tag">
              <span className="amount">{property.price}</span>
              <span className="currency"> €</span>
            </div>
          </div>

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

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PropertyCard;