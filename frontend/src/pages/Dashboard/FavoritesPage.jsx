import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropertyCard from '../../components/PropertyCard';
import { Container, Typography, Grid, CircularProgress, Box, Button } from '@mui/material';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Récupérer les IDs des favoris depuis le profil Tenant
      const tenantRes = await axios.get('http://localhost:5000/api/tenant/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const favIds = tenantRes.data.favoriteProperties || [];

      // Si aucun favori, quitter
      if (favIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Récupérer les détails de chaque propriété favorite
      const favPropsPromises = favIds.map(id =>
        axios.get(`http://localhost:5000/api/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      const responses = await Promise.all(favPropsPromises);
      setFavorites(responses.map(res => res.data.data || res.data));
    } catch (err) {
      console.error("Erreur lors du chargement des favoris", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Rafraîchir la liste quand un favori est supprimé
  const handleFavoriteChange = (propertyId, isFavorite) => {
    if (!isFavorite) {
      // Propriété supprimée des favoris → rafraîchir la liste
      fetchFavorites();
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Mes Coups de Cœur ❤️
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {favorites.length === 0 
            ? 'Vous n\'avez pas encore ajouté de propriétés à vos favoris.' 
            : `${favorites.length} propriété${favorites.length > 1 ? 's' : ''} en favori${favorites.length > 1 ? 's' : ''}`}
        </Typography>
      </Box>
      
      {favorites.length > 0 ? (
        <Grid container spacing={3}>
          {favorites.map((property) => (
            <Grid item key={property._id} xs={12} sm={6} md={4} lg={3}>
              <PropertyCard 
                property={property} 
                onFavoriteChange={handleFavoriteChange}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: '#f5f5f5',
          borderRadius: 2,
          border: '1px solid #ddd'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            📭 Aucun favori pour le moment
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
            Explorez nos annonces et ajoutez vos propriétés préférées
          </Typography>
          <Button variant="contained" href="/">
            Voir toutes les annonces
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default FavoritesPage;
