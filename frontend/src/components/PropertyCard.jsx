import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Snackbar, Alert } from '@mui/material'; 
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './PropertyCard.css'; 

const PropertyCard = ({ property, onFavoriteChange }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // États pour les favoris et notifications
  const [isFav, setIsFav] = useState(() => {
    if (user?.id && property?.favorites) {
      return property.favorites.some(favId => String(favId) === String(user.id));
    }
    return false;
  });

  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Synchronisation si les données changent
  useEffect(() => {
    if (user?.id && property?.favorites) {
      const isAlreadyFav = property.favorites.some(
        (favId) => String(favId) === String(user.id)
      );
      setIsFav(isAlreadyFav);
    }
  }, [property.favorites, user?.id]);

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
      const res = await axios.post(
        `http://localhost:5000/api/properties/${property._id}/favorite`, 
        {}, 
        { headers: { 'x-auth-token': token } }
      );
      
      if (res.data.success) {
        const newFavState = res.data.isFavorite;
        setIsFav(newFavState);
        
        setSnackbarMessage(
          newFavState ? '❤️ Ajouté aux favoris' : '💔 Retiré des favoris'
        );
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        // Callback pour rafraîchir la liste si nécessaire
        if (onFavoriteChange) {
          onFavoriteChange(property._id, newFavState);
        }
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
            src={property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'} 
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
              <FavoriteIcon className="heart-icon favorite" /> 
            ) : (
              <FavoriteBorderIcon className="heart-icon" />
            )}
          </IconButton>
        </div>
        
        <div className="property-content">
          <h3 className="property-title">{property.title}</h3>
          <p className="property-location">
            <span>📍</span> {property.location}
          </p>
          
          <div className="property-specs">
            <div className="spec-item"><span>🛏️</span> {property.rooms} Ch</div>
            <div className="spec-item"><span>📐</span> {property.surface} m²</div>
            <div className="spec-item"><span>🏢</span> {property.type}</div>
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