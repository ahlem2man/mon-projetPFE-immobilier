import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Grid, Typography, Box, Paper, 
  Chip, Divider, Stack, CircularProgress, IconButton 
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KingBedIcon from '@mui/icons-material/KingBed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ÉTAT POUR L'IMAGE SÉLECTIONNÉE
  const [selectedImage, setSelectedImage] = useState(0);

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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!property) return <Typography variant="h5" textAlign="center" mt={10}>Annonce non trouvée</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Grid container spacing={4}>
        
        {/* --- SECTION GAUCHE : GALERIE --- */}
        <Grid item xs={12} md={7}>
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
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight="bold">{property.title}</Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                <LocationOnIcon color="primary" />
                <Typography variant="body1">{property.address}, {property.location}</Typography>
              </Stack>

              <Typography variant="h4" color="primary" fontWeight="bold">
                {property.price.toLocaleString()} DT <Typography component="span" variant="body1" color="text.secondary">/ mois</Typography>
              </Typography>

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
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertyDetail;