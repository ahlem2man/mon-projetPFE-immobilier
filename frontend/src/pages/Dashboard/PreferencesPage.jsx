import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  MenuItem, Container, Alert, CircularProgress, InputAdornment, Grid 
} from '@mui/material';
import axios from 'axios';
import SaveIcon from '@mui/icons-material/Save';

const PreferencesPage = () => {
  const [prefs, setPrefs] = useState({
    location: '',
    budgetMax: '',
    propertyType: '',
    minRooms: 1,
    moveInDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tenant/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data) {
          setCompletion(res.data.completionPercentage || 0);
          
          // Mapper les préférences du backend vers l'UI
          if (res.data.preferences) {
            const prefs = res.data.preferences;
            setPrefs(prev => ({
              ...prev,
              location: prefs.city || '',
              budgetMax: prefs.maxPrice ? String(prefs.maxPrice) : '',
              propertyType: prefs.propertyType || '',
              minRooms: prefs.minRooms || 1,
              moveInDate: prefs.moveInDate ? (typeof prefs.moveInDate === 'string' ? prefs.moveInDate.split('T')[0] : prefs.moveInDate) : ''
            }));
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Mapper les champs UI vers le modèle Backend
      const preferencesData = {
        city: prefs.location,
        maxPrice: parseInt(prefs.budgetMax) || 0,
        propertyType: prefs.propertyType,
        minSurface: 0,
        minRooms: parseInt(prefs.minRooms) || 1,
        moveInDate: prefs.moveInDate ? new Date(prefs.moveInDate) : null,
        wantedAmenities: []
      };

      console.log('📤 Envoi des préférences:', preferencesData);

      // Utiliser le nouvel endpoint dédié au matching
      const res = await axios.post('http://localhost:5000/api/matchings/save-preferences', 
        { preferences: preferencesData }, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      console.log('✅ Réponse:', res.data);

      setMessage({ type: 'success', text: `✅ Préférences sauvegardées ! Allez en Recommandations et cliquez Générer.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde: ' + err.response?.data?.message || err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a1930' }}>
        Mes Préférences de Recherche
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: '8px' }}>
          {message.text}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 4, borderRadius: '12px', border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Ligne 1 : Localisation */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#0a1930' }}>
              Où souhaitez-vous habiter ?
            </Typography>
            <TextField 
              fullWidth 
              placeholder="Ex: Paris, Lyon, Bordeaux..." 
              value={prefs.location}
              onChange={(e) => setPrefs({...prefs, location: e.target.value})}
              variant="outlined"
              helperText={prefs.location ? '✓' : 'Requis pour la complétude'}
            />
          </Box>

          {/* Ligne 2 : Budget */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#0a1930' }}>
              Budget mensuel max (charges comprises)
            </Typography>
            <TextField 
              fullWidth 
              type="number"
              value={prefs.budgetMax}
              onChange={(e) => setPrefs({...prefs, budgetMax: e.target.value})}
              InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
              helperText={prefs.budgetMax > 0 ? '✓' : 'Important pour le matching'}
            />
          </Box>

          {/* Ligne 3 : Type de propriété */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#0a1930' }}>
              Type de propriété</Typography>
            <TextField 
              fullWidth 
              select 
              value={prefs.propertyType}
              onChange={(e) => setPrefs({...prefs, propertyType: e.target.value})}
            >
              {['', 'Appartement', 'Villa', 'Maison', 'Studio', 'Bureau'].map(opt => (
                <MenuItem key={opt || 'all'} value={opt}>{opt || 'Tous'}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Ligne 4 : Date d'emménagement */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#0a1930' }}>
              Date d'emménagement prévue
            </Typography>
            <TextField 
              fullWidth 
              type="date" 
              InputLabelProps={{ shrink: true }}
              value={prefs.moveInDate ? (typeof prefs.moveInDate === 'string' ? prefs.moveInDate.split('T')[0] : prefs.moveInDate) : ''}
              onChange={(e) => setPrefs({...prefs, moveInDate: e.target.value})}
              helperText={prefs.moveInDate ? '✓' : 'Important pour la complétude'}
            />
          </Box>

          {/* Ligne 5 : Nombre de pièces */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#0a1930' }}>
              Nombre de pièces minimum
            </Typography>
            <TextField 
              fullWidth 
              select 
              value={prefs.minRooms}
              onChange={(e) => setPrefs({...prefs, minRooms: e.target.value})}
            >
              {[1, 2, 3, 4, 5].map(n => (
                <MenuItem key={n} value={n}>{n}+ pièce(s)</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Bouton de validation style "Contact" */}
          <Button 
            type="submit" 
            variant="contained" 
            disabled={submitting}
            startIcon={<SaveIcon />}
            sx={{ 
              bgcolor: '#0a1930', 
              color: 'white',
              py: 2, 
              mt: 2,
              fontWeight: 'bold', 
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: '50px',
              '&:hover': { bgcolor: '#162c50' }
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer mes préférences'}
          </Button>

        </Box>
      </Paper>
    </Box>
  );
};

export default PreferencesPage;