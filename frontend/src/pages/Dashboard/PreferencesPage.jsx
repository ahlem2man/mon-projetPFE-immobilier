import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  MenuItem, Container, Alert, CircularProgress, InputAdornment 
} from '@mui/material';
import axios from 'axios';

const PreferencesPage = () => {
  const [prefs, setPrefs] = useState({
    location: '',
    budgetMax: '',
    propertyType: 'Tous',
    minRooms: 1,
    moveInDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tenant/me');
        if (res.data && res.data.preferences) {
          setPrefs(prev => ({ ...prev, ...res.data.preferences }));
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.put('http://localhost:5000/api/tenant/profile', { preferences: prefs });
      setMessage({ type: 'success', text: 'Préférences enregistrées avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: '#0a1930' }}>
        Mes Préférences de Recherche
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Définissez vos critères ligne par ligne pour un matching parfait.
      </Typography>

      {message.text && <Alert severity={message.type} sx={{ mb: 3, borderRadius: '8px' }}>{message.text}</Alert>}

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
            />
          </Box>

          {/* Ligne 3 : Type de propriété */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#0a1930' }}>
              Type de propriété
            </Typography>
            <TextField 
              fullWidth 
              select 
              value={prefs.propertyType}
              onChange={(e) => setPrefs({...prefs, propertyType: e.target.value})}
            >
              {['Tous', 'Appartement', 'Maison', 'Studio'].map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
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
              value={prefs.moveInDate ? prefs.moveInDate.split('T')[0] : ''}
              onChange={(e) => setPrefs({...prefs, moveInDate: e.target.value})}
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
            sx={{ 
              bgcolor: '#0a1930', 
              color: 'white',
              py: 2, 
              mt: 2,
              fontWeight: 'bold', 
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderRadius: '4px',
              '&:hover': { bgcolor: '#1a2940' }
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer mes préférences'}
          </Button>

        </Box>
      </Paper>
    </Container>
  );
};

export default PreferencesPage;