import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Stepper, Step, StepLabel, Button, TextField, MenuItem,
  Grid, Typography, Paper, IconButton, CircularProgress, Alert, Chip
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const steps = ['Général', 'Caractéristiques', 'Photos & Statut'];

const PropertyEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'Appartement',
    location: '',
    address: '',
    surface: '',
    rooms: '',
    amenities: '',
    status: 'disponible'
  });

  const token = localStorage.getItem('token');

  // Charger les données existantes au montage
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/properties/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const property = res.data.data;

        setFormData({
          title: property.title,
          description: property.description,
          price: property.price,
          type: property.type,
          location: property.location,
          address: property.address,
          surface: property.surface,
          rooms: property.rooms,
          amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
          status: property.status
        });
        setExistingImages(property.images || []);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement propriété:', err);
        setError('Impossible de charger la propriété');
        setLoading(false);
      }
    };

    if (id && token) {
      fetchProperty();
    }
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewFileChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleDeleteExistingImage = (imgPath) => {
    setExistingImages(prev => prev.filter(img => img !== imgPath));
    setImagesToDelete(prev => [...prev, imgPath]);
  };

  const handleDeleteNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.title || !formData.description || !formData.price) {
        setError('Veuillez remplir les champs obligatoires (Titre, Description, Prix)');
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.location || !formData.address) {
        setError('Veuillez remplir la Ville et l\'Adresse');
        return;
      }
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (existingImages.length === 0 && newImages.length === 0) {
      setError('Au moins une image est requise');
      return;
    }

    const data = new FormData();

    // Ajouter les champs texte
    Object.keys(formData).forEach(key => {
      if (key === 'amenities' && typeof formData[key] === 'string') {
        // Convertir la chaîne amenities en array
        const amenitiesArray = formData[key]
          .split(',')
          .map(a => a.trim())
          .filter(a => a);
        data.append('amenities', JSON.stringify(amenitiesArray));
      } else {
        data.append(key, formData[key]);
      }
    });

    // Ajouter les nouvelles images
    newImages.forEach(file => data.append('images', file));

    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/properties/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Propriété mise à jour avec succès !');
      navigate('/agency/properties');
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      setError('Erreur lors de la mise à jour: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Modifier la propriété
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Étape 0: Général */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Titre de l'annonce"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                {['Appartement', 'Villa', 'Maison', 'Studio', 'Bureau'].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Prix (EUR)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        )}

        {/* Étape 1: Caractéristiques */}
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ville"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Adresse"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Surface (m²)"
                name="surface"
                type="number"
                value={formData.surface}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nombre de pièces"
                name="rooms"
                type="number"
                value={formData.rooms}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Équipements (séparés par des virgules)"
                name="amenities"
                placeholder="Wifi, Piscine, Parking..."
                value={formData.amenities}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        )}

        {/* Étape 2: Photos & Statut */}
        {activeStep === 2 && (
          <Box>
            {/* Images existantes */}
            {existingImages.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Images actuelles
                </Typography>
                <Grid container spacing={2}>
                  {existingImages.map((img, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={`http://localhost:5000${img}`}
                          alt={`Property ${idx}`}
                          style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteExistingImage(img)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Nouvelles images */}
            <Box sx={{ mb: 4, textAlign: 'center', py: 4, border: '2px dashed #ccc', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ajouter ou remplacer des photos (Max 10)
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="icon-button-file-edit"
                type="file"
                multiple
                onChange={handleNewFileChange}
              />
              <label htmlFor="icon-button-file-edit">
                <IconButton color="primary" component="span" sx={{ fontSize: 60 }}>
                  <PhotoCamera fontSize="large" />
                </IconButton>
              </label>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {newImages.length} nouveau(x) fichier(s) sélectionné(s)
              </Typography>
            </Box>

            {/* Aperçu des nouvelles images */}
            {newImages.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Aperçu des nouveaux fichiers:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {newImages.map((file, idx) => (
                    <Chip
                      key={idx}
                      label={file.name}
                      onDelete={() => handleDeleteNewImage(idx)}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Statut */}
            <Box sx={{ mt: 4 }}>
              <TextField
                select
                fullWidth
                label="Statut de la propriété"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {['disponible', 'louée', 'en attente', 'inactive'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        )}

        {/* Boutons de navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Retour
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ bgcolor: '#1A237E' }}
              >
                {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : 'Enregistrer les modifications'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#1A237E' }}>
                Suivant
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PropertyEditPage;
