import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Alert, IconButton, Tooltip,
  TextField, MenuItem, Checkbox, Button, Grid
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; // Pour actions groupées
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const AgencyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [selected, setSelected] = useState([]); // Point 10 : Actions groupées
  const token = localStorage.getItem('token');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Filtrage côté API ou local selon ta préférence
      const res = await axios.get('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data.data || []);
    } catch (err) {
      setError('Impossible de charger les candidatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  // --- LOGIQUE DE STATISTIQUES (Point 9) ---
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'en attente').length,
    accepted: applications.filter(a => a.status === 'acceptée').length
  };

  // --- LOGIQUE DE FILTRAGE (Point 5) ---
  const filteredApps = filterStatus === 'Tous' 
    ? applications 
    : applications.filter(app => app.status === filterStatus.toLowerCase());

  // --- LOGIQUE DE SÉLECTION (Point 10) ---
  const handleSelectOne = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'en attente': return 'warning';
      case 'acceptée': return 'success';
      case 'rejetée': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      
      {/* 📊 SECTION STATISTIQUES (Point 9) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8EAF6' }}>
            <Typography variant="h4" color="primary">{stats.total}</Typography>
            <Typography variant="body2">Candidatures Totales</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
            <Typography variant="h4" color="orange">{stats.pending}</Typography>
            <Typography variant="body2">En attente de réponse</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E9' }}>
            <Typography variant="h4" color="green">{stats.accepted}</Typography>
            <Typography variant="body2">Dossiers Approuvés</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
          Gestion des Candidatures
        </Typography>

        {/* 🔍 FILTRAGE (Point 5) */}
        <TextField
          select
          size="small"
          label="Statut"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ width: 150 }}
        >
          {['Tous', 'En attente', 'En cours', 'Acceptée', 'Rejetée'].map(s => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* ⚡ ACTIONS GROUPÉES (Point 10) */}
      {selected.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }} action={
          <Button color="inherit" size="small" startIcon={<DeleteSweepIcon />}>
            Traiter {selected.length} dossiers
          </Button>
        }>
          {selected.length} candidature(s) sélectionnée(s)
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8F9FA' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox 
                   indeterminate={selected.length > 0 && selected.length < filteredApps.length}
                   checked={filteredApps.length > 0 && selected.length === filteredApps.length}
                   onChange={(e) => setSelected(e.target.checked ? filteredApps.map(a => a._id) : [])}
                />
              </TableCell>
              <TableCell>Locataire</TableCell>
              <TableCell>Propriété</TableCell>
              <TableCell>Revenus</TableCell> {/* Ajout pour analyse rapide */}
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow key={app._id} hover selected={selected.includes(app._id)}>
                <TableCell padding="checkbox">
                  <Checkbox checked={selected.includes(app._id)} onChange={() => handleSelectOne(app._id)} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{app.tenantId?.fullName}</Typography>
                  <Typography variant="caption" color="textSecondary">{app.tenantId?.email}</Typography>
                </TableCell>
                <TableCell>{app.propertyId?.title}</TableCell>
                <TableCell>{app.monthlyIncome ? `${app.monthlyIncome} TND` : 'N/C'}</TableCell>
                <TableCell>
                  <Chip label={app.status} color={getStatusColor(app.status)} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ouvrir le dossier détaillé">
                    <IconButton component={RouterLink} to={`/dashboard/applications/${app._id}`} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AgencyApplications;