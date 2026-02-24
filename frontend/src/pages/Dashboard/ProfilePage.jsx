import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, LinearProgress, MenuItem, Stack } from '@mui/material';
import axios from 'axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    profession: '',
    employmentType: 'Autre',
    income: '',
    employer: ''
  });
  const [completion, setCompletion] = useState(0);

  // Charger les données existantes
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tenant/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data) {
          setProfile({
            profession: res.data.profession || '',
            employmentType: res.data.employmentType || 'Autre',
            income: res.data.income || '',
            employer: res.data.employer || ''
          });
          setCompletion(res.data.completionPercentage || 0);
        }
      } catch (err) {
        console.error("Erreur chargement profil", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5000/api/tenant/profile', profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCompletion(res.data.completionPercentage);
      alert('Profil mis à jour !');
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a1930' }}>
        Mon Profil Locataire
      </Typography>

      {/* Indicateur de complétude */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Complétude du profil
          </Typography>
          <Typography variant="body1" sx={{ color: '#00adef', fontWeight: 'bold' }}>
            {completion}%
          </Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={completion} 
          sx={{ height: 10, borderRadius: 5, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#00adef' } }} 
        />
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
          Un profil à 100% augmente vos chances de trouver un logement rapidement.
        </Typography>
      </Paper>

      {/* Formulaire de profil */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profession"
                name="profession"
                value={profile.profession}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Type de contrat"
                name="employmentType"
                value={profile.employmentType}
                onChange={handleChange}
              >
                {['CDI', 'CDD', 'Indépendant', 'Étudiant', 'Autre'].map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Revenus mensuels nets (€)"
                name="income"
                type="number"
                value={profile.income}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employeur / École"
                name="employer"
                value={profile.employer}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ bgcolor: '#0a1930', px: 4, py: 1.5, borderRadius: '50px', textTransform: 'none' }}
              >
                Enregistrer les modifications
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}