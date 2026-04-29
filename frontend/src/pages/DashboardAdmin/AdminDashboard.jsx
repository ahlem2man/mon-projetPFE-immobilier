import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Card, CardContent, LinearProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingProperties: 0,
    reportedProperties: 0
  });
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, propertiesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/properties/pending', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const users = usersRes.data.data || [];
        const properties = propertiesRes.data.data || [];
        
        const pending = properties.filter(p => p.moderationStatus === 'en attente').length;
        const reported = properties.filter(p => p.isReported).length;

        setStats({
          totalUsers: users.length,
          totalProperties: users.length, // Placeholder
          pendingProperties: pending,
          reportedProperties: reported
        });
      } catch (err) {
        console.error('Erreur lors du chargement des stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const StatCard = ({ icon, title, value, color, subtext }) => (
    <Card 
      sx={{ 
        borderRadius: 2, 
        boxShadow: 'none',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" variant="overline" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mt: 1 }}>
              {loading ? '-' : value}
            </Typography>
            {subtext && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                {subtext}
              </Typography>
            )}
          </Box>
          <Box sx={{ fontSize: '3rem', color: color, opacity: 0.2 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1A237E' }}>
        Vue d'ensemble
      </Typography>

      {/* Grille des Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon />}
            title="Utilisateurs"
            value={stats.totalUsers}
            color="#3F51B5"
            subtext="Utilisateurs actifs"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HomeWorkIcon />}
            title="Annonces"
            value={stats.totalProperties}
            color="#009688"
            subtext="Total des annonces"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HomeWorkIcon />}
            title="En Attente"
            value={stats.pendingProperties}
            color="#FF9800"
            subtext="Nécessitent modération"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ErrorIcon />}
            title="Signalements"
            value={stats.reportedProperties}
            color="#F44336"
            subtext="Annonces signalées"
          />
        </Grid>
      </Grid>

      {/* Section d'aide */}
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
          border: '1px solid rgba(63, 81, 181, 0.2)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1A237E' }}>
          Bienvenue sur votre Console d'Administration
        </Typography>
        <Typography variant="body2" color="textSecondary">
          À partir du menu latéral, vous pouvez gérer les utilisateurs, modérer les annonces et surveiller les signalements. 
          Utilisez les onglets pour naviguer entre les différentes sections.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
