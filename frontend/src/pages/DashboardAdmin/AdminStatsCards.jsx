import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EuroIcon from '@mui/icons-material/Euro';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';

const StatCard = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <Box sx={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      width: 56, height: 56, borderRadius: '50%', bgcolor: `${color}15`, color: color, mr: 2 
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
  </Paper>
);

const AdminStatsCards = ({ stats }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Revenus Totaux" value={`${stats.revenue.total} €`} icon={<EuroIcon />} color="#2e7d32" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Utilisateurs" value={stats.users.total} icon={<PeopleIcon />} color="#1976d2" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Annonces Actives" value={stats.properties.active} icon={<HomeIcon />} color="#ed6c02" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Demandes" value={stats.applications.total} icon={<AssignmentIcon />} color="#9c27b0" />
      </Grid>
    </Grid>
  );
};

export default AdminStatsCards;