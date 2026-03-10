import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, MenuItem, Stack, Alert, AlertTitle } from '@mui/material';
import axios from 'axios';
import SaveIcon from '@mui/icons-material/Save';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    profession: '',
    employmentType: 'Autre',
    income: '',
    employer: ''
  });
  const [completion, setCompletion] = useState(0);
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
    try {
      const res = await axios.put('http://localhost:5000/api/tenant/profile', profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCompletion(res.data.completionPercentage);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a1930' }}>
        Mon Profil Locataire
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Succès</AlertTitle>
          Votre profil a été mis à jour avec succès ! Complétude: <strong>{completion}%</strong>
        </Alert>
      )}

      {/* Formulaire d'infos professionnelles */}
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#0a1930' }}>
           Informations Professionnelles
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Profession"
                name="profession"
                placeholder="Ex: Ingénieur, Enseignant..."
                value={profile.profession}
                onChange={(e) => handleChange(e)}
                variant="outlined"
                helperText={profile.profession ? '✓' : 'Requis pour la complétude'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Type de contrat"
                name="employmentType"
                value={profile.employmentType}
                onChange={(e) => handleChange(e)}
              >
                {['CDI', 'CDD', 'Indépendant', 'Étudiant', 'Autre'].map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Revenus mensuels nets (€)"
                name="income"
                placeholder="Ex: 2500"
                type="number"
                value={profile.income}
                onChange={(e) => handleChange(e)}
                variant="outlined"
                helperText={profile.income > 0 ? '✓' : 'Important pour les propriétaires'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Employeur / École"
                name="employer"
                placeholder="Ex: Google, Université Paris-Diderot..."
                value={profile.employer}
                onChange={(e) => handleChange(e)}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={<SaveIcon />}
                sx={{ 
                  bgcolor: '#0a1930', 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: '50px', 
                  textTransform: 'none',
                  color: '#fff',
                  '&:hover': { bgcolor: '#162c50' }
                }}
              >
                Enregistrer les modifications
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Info: Prochaines étapes */}
      {completion < 100 && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <AlertTitle>Prochaines étapes</AlertTitle>
          Pour compléter votre profil:
          <ul style={{ marginTop: 8 }}>
            <li>Allez à <strong>Préférences</strong> pour indiquer votre budget et localisation</li>
            <li>Allez à <strong>Documents</strong> pour uploader vos justificatifs (identité, revenus, domicile)</li>
            <li>Révisitez cette page pour vérifier votre progression</li>
          </ul>
        </Alert>
      )}
    </Box>
  );
}