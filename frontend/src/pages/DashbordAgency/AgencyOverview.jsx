import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import AgencyStats from './components/AgencyStats';

const AgencyOverview = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      {/* HEADER */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'linear-gradient(135deg, #3F51B5 0%, #5C6BC0 100%)', color: 'white' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Bienvenue sur votre tableau de bord
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Gérez vos annonces, suivez vos candidatures et optimisez votre présence sur la plateforme.
        </Typography>
      </Paper>

      {/* STATISTIQUES */}
      <AgencyStats />

      {/* SECTION RAPIDE ACTIONS (Pour le Sprint 8 et au-delà) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Actions rapides
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3F51B5' }}>📋 Créer une annonce</Typography>
              <Typography variant="body2" color="textSecondary">Publier une nouvelle propriété</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3F51B5' }}>👥 Gérer candidatures</Typography>
              <Typography variant="body2" color="textSecondary">Consulter les demandes des locataires</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AgencyOverview;
