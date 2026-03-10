import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Grid, Typography, Box, Paper, 
  Chip, Divider, Stack, CircularProgress, IconButton, Snackbar, Alert, Button
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KingBedIcon from '@mui/icons-material/KingBed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { AuthContext } from '../context/AuthContext';
import PropertyMap from '../components/PropertyMap';
import ApplyModal from '../components/ApplyModal'; // Assure-toi que le fichier ApplyModal existe

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // États pour les favoris
  const [isFav, setIsFav] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // --- NOUVEL ÉTAT POUR SPRINT 5 ---
  const [openApplyModal, setOpenApplyModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/properties/${id}`);
        setProperty(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur", err);
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!user?.id || !token) {
          setIsFav(false);
          return;
        }

        // ✨ Vérifier directement depuis Tenant pour être sûr
        const tenantRes = await axios.get('http://localhost:5000/api/tenant/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const favIds = tenantRes.data.favoriteProperties || [];
        const isAlreadyFav = favIds.includes(id);
        setIsFav(isAlreadyFav);
      } catch (err) {
        console.error("Erreur lors de la vérification des favoris", err);
        setIsFav(false);
      }
    };

    // Appeler après que user soit chargé
    if (user?.id) {
      checkIfFavorite();
    }
  }, [id, user?.id]);

  // Exemple de fonction à ajouter dans ta page de détail du bien
  const handleApply = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/requests', 
        { 
          propertyId: property._id, 
          message: "Bonjour, mon dossier est complet et je suis très intéressé par votre bien." 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(response.data.message); // "Votre candidature a été transmise avec succès !"
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'envoi");
    }
  };

  // Handler pour toggle favori
  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem('token');

    if (!token || !user) {
      setSnackbarMessage('Veuillez vous connecter pour ajouter des favoris');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    setLoadingFav(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/properties/${id}/favorite`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (res.data.success) {
        const newFavState = res.data.isFavorite;
        setIsFav(newFavState);
        
        setSnackbarMessage(
          newFavState ? '❤️ Ajouté aux favoris' : '💔 Retiré des favoris'
        );
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }
    } catch (err) {
      setSnackbarMessage('Erreur lors de la modification des favoris');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      console.error("Erreur toggle favori:", err);
    } finally {
      setLoadingFav(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!property) return <Typography variant="h5" textAlign="center" mt={10}>Annonce non trouvée</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Grid container spacing={4}>
        
        {/* --- SECTION GAUCHE : GALERIE --- */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            {/* Image Principale */}
            <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', height: '450px' }}>
              <img 
                src={property.images[selectedImage]} 
                alt={property.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s' }} 
              />
            </Paper>

            {/* Liste des Miniatures (si plus d'une image) */}
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
              {property.images.map((img, index) => (
                <Box 
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{ 
                    width: 100, 
                    height: 80, 
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    cursor: 'pointer',
                    border: selectedImage === index ? '3px solid #1976d2' : 'none',
                    opacity: selectedImage === index ? 1 : 0.7,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <img src={img} alt="miniature" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* --- SECTION DROITE : INFOS --- */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Stack spacing={3}>
              {/* TITRE + BOUTON FAVORIS */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h4" fontWeight="bold" sx={{ flex: 1 }}>
                  {property.title}
                </Typography>
                <IconButton
                  onClick={handleFavoriteToggle}
                  disabled={loadingFav}
                  sx={{
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.15)' },
                    transition: 'all 0.2s ease',
                    '& svg': {
                      transition: 'transform 0.2s ease',
                    },
                    '&:active svg': {
                      transform: isFav ? 'scale(1.2)' : 'scale(0.95)'
                    }
                  }}
                  color="error"
                  title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  {isFav ? (
                    <FavoriteIcon className="heart-icon favorite" sx={{ fontSize: 28 }} />
                  ) : (
                    <FavoriteBorderIcon className="heart-icon" sx={{ fontSize: 28 }} />
                  )}
                </IconButton>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                <LocationOnIcon color="primary" />
                <Typography variant="body1">{property.address}, {property.location}</Typography>
              </Stack>

              <Typography variant="h4" color="primary" fontWeight="bold">
                {property.price.toLocaleString()} € <Typography component="span" variant="body1" color="text.secondary">/ mois</Typography>
              </Typography>

              {/* BOUTON POSTULER (NOUVEAU - SPRINT 5) */}
              <Button 
                variant="contained" 
                size="large" 
                fullWidth
                onClick={() => setOpenApplyModal(true)}
                sx={{ 
                  py: 1.5, 
                  fontWeight: 'bold', 
                  bgcolor: '#0a1930', 
                  fontSize: '1.1rem',
                  '&:hover': { bgcolor: '#1a2940' } 
                }}
              >
                Postuler pour ce logement
              </Button>

              <Divider />

              {/* Specs rapides */}
              <Stack direction="row" justifyContent="space-around" sx={{ bgcolor: '#f8f9fa', py: 2, borderRadius: 2 }}>
                <Box textAlign="center">
                  <KingBedIcon color="action" />
                  <Typography variant="body2" fontWeight="bold">{property.rooms} Pièces</Typography>
                </Box>
                <Box textAlign="center">
                  <SquareFootIcon color="action" />
                  <Typography variant="body2" fontWeight="bold">{property.surface} m²</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Type</Typography>
                  <Typography variant="body2" fontWeight="bold">{property.type}</Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">Description</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {property.description}
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">Équipements</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {property.amenities.map((item, index) => (
                    <Chip key={index} label={item} size="small" variant="filled" sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }} />
                  ))}
                </Box>
              </Box>

              {/* Note sur les favoris */}
              {user ? (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: isFav ? '#ffebee' : '#f5f5f5', 
                  borderRadius: 1,
                  border: `1px solid ${isFav ? '#ffcdd2' : '#e0e0e0'}`
                }}>
                  <Typography variant="body2" sx={{ color: isFav ? '#c62828' : '#666' }}>
                    {isFav ? ' Cette propriété est dans vos favoris' : ' Ajoutez cette propriété à vos favoris'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #bbdefb' }}>
                  <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                     Connectez-vous pour ajouter aux favoris
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

     {/* SECTION CARTE */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          📍 Localisation
        </Typography>
        
        {/* Afficher la carte avec la localisation correcte de la ville */}
        {property.coordinates || property.location ? (
          <PropertyMap 
            lat={property.coordinates?.lat} 
            lng={property.coordinates?.lng} 
            title={property.title}
            location={property.location}
          />
        ) : (
          <Alert severity="info">
            L'emplacement exact sur la carte n'a pas encore été renseigné pour cette propriété.
          </Alert>
        )}
      </Box>

      {/* MODAL DE CANDIDATURE (NOUVEAU - SPRINT 5) */}
      <ApplyModal 
        open={openApplyModal} 
        handleClose={() => setOpenApplyModal(false)}
        propertyId={property._id}
        propertyTitle={property.title}
        completionRate={100} // Tu peux lier cela dynamiquement plus tard
      />

      {/* Snackbar pour les notifications */}
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
    </Container>
  );
};

export default PropertyDetail;