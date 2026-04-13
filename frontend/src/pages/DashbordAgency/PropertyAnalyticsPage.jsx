import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CircularProgress,
  Alert, Button, Divider, LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

const PropertyAnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/properties/analytics/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAnalytics(res.data.data);
      } catch (err) {
        console.error('Erreur chargement analytics:', err);
        setError('Impossible de charger les analytics');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchAnalytics();
    }
  }, [id, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4, px: 2 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/agency/properties')}>
          Retour aux propriétés
        </Button>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4, px: 2 }}>
        <Alert severity="warning">Aucune donnée disponible</Alert>
      </Box>
    );
  }

  const { title, type, price, stats, createdAt } = analytics;
  const maxEngagement = Math.max(
    stats.views,
    stats.favorites,
    stats.applications,
    1
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agency/properties')}
          sx={{ mr: 3 }}
        >
          Retour
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
            Analytics - {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {type} • {price.toLocaleString()} EUR
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Vues */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: '#E3F2FD',
                  mb: 2
                }}
              >
                <VisibilityIcon sx={{ color: '#1976D2', fontSize: 30 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
                {stats.views}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Vues
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Favoris */}
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: '#FCE4EC',
                  mb: 2
                }}
              >
                <FavoriteBorderIcon sx={{ color: '#C2185B', fontSize: 30 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
                {stats.favorites}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Favoris
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Candidatures */}
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: '#F3E5F5',
                  mb: 2
                }}
              >
                <PersonAddIcon sx={{ color: '#7B1FA2', fontSize: 30 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
                {stats.applications}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Candidatures
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Engagement */}
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', bgcolor: '#F5F5F5' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: '#E8F5E9',
                  mb: 2
                }}
              >
                <TrendingUpIcon sx={{ color: '#388E3C', fontSize: 30 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
                {stats.totalEngagement}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Engagement Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Bars */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 4, color: '#1A237E' }}>
          Répartition de l'Engagement
        </Typography>

        {/* Vues Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Vues
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
              {stats.views} ({Math.round((stats.views / maxEngagement) * 100)}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(stats.views / maxEngagement) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#E3F2FD',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#1976D2',
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Favoris Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Favoris
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#C2185B' }}>
              {stats.favorites} ({Math.round((stats.favorites / maxEngagement) * 100)}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(stats.favorites / maxEngagement) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#FCE4EC',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#C2185B',
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Candidatures Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Candidatures
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#7B1FA2' }}>
              {stats.applications} ({Math.round((stats.applications / maxEngagement) * 100)}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(stats.applications / maxEngagement) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#F3E5F5',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#7B1FA2',
                borderRadius: 4
              }
            }}
          />
        </Box>
      </Paper>

      {/* Info */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 3, bgcolor: '#F5F5F5' }}>
        <Typography variant="body2" color="textSecondary">
          <strong>Créée le:</strong> {new Date(createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </Paper>
    </Box>
  );
};

export default PropertyAnalyticsPage;
