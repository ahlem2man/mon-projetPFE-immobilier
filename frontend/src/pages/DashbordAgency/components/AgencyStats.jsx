// src/pages/DashbordAgency/components/AgencyStats.jsx
import React, { useState, useEffect, useContext } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, 
  Avatar, CircularProgress, Alert 
} from '@mui/material';
import axios from 'axios';
import PropertyIcon from '@mui/icons-material/HomeWork';
import ViewIcon from '@mui/icons-material/Visibility';
import RequestIcon from '@mui/icons-material/Assignment';
import RatingIcon from '@mui/icons-material/Star';
import { AuthContext } from '../../../context/AuthContext';

const AgencyStats = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TECHNIQUE PFE : Récupération des données réelles depuis le Backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/agency/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // On récupère uniquement l'objet 'stats' et 'rating' de la réponse
        setStats({ ...res.data.stats, rating: res.data.rating }); 
      } catch (err) {
        console.error("Erreur stats", err);
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  // Composant interne pour une carte de statistique (réutilisable)
  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56, mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'medium' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${color}.dark` }}>
            {loading ? <CircularProgress size={24} /> : value || 0}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) return <CircularProgress sx={{ display: 'block', m: 'auto', mt: 3 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return <Typography>Aucune donnée disponible.</Typography>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Aperçu des performances
      </Typography>
      
      <Grid container spacing={3}>
        {/* CARTE 1 : Annonces Actives */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Annonces Publiées" 
            value={stats.activeAds} 
            icon={<PropertyIcon size="large" />} 
            color="primary" 
          />
        </Grid>

        {/* CARTE 2 : Total Vues */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Vues Unique" 
            value={`${stats.totalViews} vues`} 
            icon={<ViewIcon size="large" />} 
            color="success" 
          />
        </Grid>

        {/* CARTE 3 : Demandes en attente */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Candidatures Reçues" 
            value={stats.pendingRequests} 
            icon={<RequestIcon size="large" />} 
            color="warning" 
          />
        </Grid>

        {/* CARTE 4 : Note Moyenne */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Note de l'agence" 
            value={`${stats.rating || 0}/5`} 
            icon={<RatingIcon size="large" />} 
            color="secondary" 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgencyStats;