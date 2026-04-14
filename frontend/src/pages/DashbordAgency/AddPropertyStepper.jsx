import React, { useState } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, TextField, MenuItem, Select,
  Grid, Typography, Paper, IconButton, Chip
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import { AMENITIES_OPTIONS } from '../../config/constants';

const steps = ['Général', 'Caractéristiques', 'Photos & Validation'];

const AddPropertyStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    price: '', 
    type: 'Appartement',
    location: '', 
    address: '', 
    surface: '', 
    rooms: '', 
    amenities: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const data = new FormData();

    // Ajouter les champs texte
    Object.keys(formData).forEach(key => {
      if (key === 'amenities') {
        // Envoyer amenities comme JSON array
        data.append('amenities', JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    // Ajouter les fichiers images
    images.forEach(file => data.append('images', file));

    try {
      const response = await axios.post('http://localhost:5000/api/properties', data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      alert("Propriété publiée avec succès !");
      window.location.href = "/agency/properties";
    } catch (err) {
      console.error('Erreur détaillée:', err.response?.data);
      alert("Erreur: " + (err.response?.data?.message || "Erreur lors de la création"));
    }
  };

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}><TextField fullWidth label="Titre de l'annonce" name="title" onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Description" name="description" onChange={handleChange} /></Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Type" name="type" value={formData.type} onChange={handleChange}>
                {['Appartement', 'Villa', 'Maison', 'Studio', 'Bureau'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Prix (EUR)" name="price" type="number" onChange={handleChange} /></Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={6}><TextField fullWidth label="Ville" name="location" onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Adresse" name="address" onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Surface (m²)" name="surface" type="number" onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Nombre de pièces" name="rooms" type="number" onChange={handleChange} /></Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Équipements disponibles
              </Typography>
              <Select
                multiple
                fullWidth
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {AMENITIES_OPTIONS.map((amenity) => (
                  <MenuItem key={amenity} value={amenity}>
                    {amenity}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>Télécharger des photos (Max 10)</Typography>
            <input accept="image/*" style={{ display: 'none' }} id="icon-button-file" type="file" multiple onChange={handleFileChange} />
            <label htmlFor="icon-button-file">
              <IconButton color="primary" component="span" sx={{ fontSize: 60 }}>
                <PhotoCamera fontSize="large" />
              </IconButton>
            </label>
            <Typography>{images.length} fichiers sélectionnés</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>Retour</Button>
          <Button 
            variant="contained" 
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Publier l\'annonce' : 'Suivant'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddPropertyStepper;