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
import API_BASE_URL from '../../config/api';

const AgencyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [selected, setSelected] = useState([]); // Point 10 : Actions groupées
  const [bulkStatus, setBulkStatus] = useState(''); // Statut pour action groupée
  const [bulkLoading, setBulkLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchApplications = async (status = 'Tous', startDate = '', endDate = '') => {
    try {
      setLoading(true);
      let params = new URLSearchParams();
      if (status !== 'Tous') params.append('status', status.toLowerCase());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await axios.get(`${API_BASE_URL}/requests/agency?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data.data || []);
    } catch (err) {
      setError('Impossible de charger les candidatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchApplications(filterStatus, filterStartDate, filterEndDate); 
  }, [filterStatus, filterStartDate, filterEndDate]);

  // --- LOGIQUE DE STATISTIQUES (Point 9) ---
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status?.toLowerCase() === 'en attente').length,
    accepted: applications.filter(a => a.status?.toLowerCase() === 'acceptée').length
  };

  //  PLUS de filtrage client-side - le backend le fait déjà!
  // On utilise directement 'applications' qui sont déjà filtrées par le serveur
  const filteredApps = applications;

  // --- LOGIQUE DE SÉLECTION (Point 10) ---
  const handleSelectOne = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  //  NOUVEAU: Actions groupées
  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.length === 0) {
      alert('Veuillez sélectionner un statut et au moins une candidature');
      return;
    }

    try {
      setBulkLoading(true);
      const res = await axios.patch(
        `${API_BASE_URL}/requests/bulk/update-status`,
        { requestIds: selected, status: bulkStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert(` ${res.data.data.updated} dossier(s) mis à jour en ${bulkStatus}`);
      setSelected([]);
      setBulkStatus('');
      fetchApplications(filterStatus, filterStartDate, filterEndDate);
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    } finally {
      setBulkLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'en attente': return 'warning';
      case 'acceptée': return 'success';
      case 'refusée': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      
      {/*  SECTION STATISTIQUES (Point 9) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8EAF6' }}>
            <Typography variant="h4" color="primary">{stats.total}</Typography>
            <Typography variant="body2">Candidatures Totales</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
            <Typography variant="h4" color="orange">{stats.pending}</Typography>
            <Typography variant="body2">En attente de réponse</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E9' }}>
            <Typography variant="h4" color="green">{stats.accepted}</Typography>
            <Typography variant="body2">Dossiers Approuvés</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
          Gestion des Candidatures
        </Typography>

        {/*  FILTRAGE (Point 5) */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            label="Statut"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ width: 150 }}
          >
            {['Tous', 'En attente', 'En cours', 'Acceptée', 'Refusée', 'Infos requises'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          {/*  NOUVEAU: Filtars de date */}
          <TextField
            type="date"
            size="small"
            label="Date début"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            type="date"
            size="small"
            label="Date fin"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
        </Box>
      </Box>

      {/*  ACTIONS GROUPÉES (Point 10) */}
      {selected.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ flex: 1 }}>
              {selected.length} candidature(s) sélectionnée(s)
            </Typography>
            <TextField
              select
              size="small"
              label="Nouveau statut"
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              sx={{ width: 150 }}
            >
              {['En attente', 'En cours', 'Acceptée', 'Refusée', 'Infos requises'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<DeleteSweepIcon />}
              onClick={handleBulkUpdate}
              disabled={bulkLoading || !bulkStatus}
              size="small"
            >
              {bulkLoading ? 'Traitement...' : 'Appliquer'}
            </Button>
            <Button 
              variant="outlined"
              onClick={() => setSelected([])}
              size="small"
            >
              Annuler
            </Button>
          </Box>
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
              <TableCell>Revenus</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow key={app._id} hover selected={selected.includes(app._id)}>
                <TableCell padding="checkbox"><Checkbox checked={selected.includes(app._id)} onChange={() => handleSelectOne(app._id)} /></TableCell>
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
                    <IconButton component={RouterLink} to={`/agency/applications/${app._id}`} color="primary">
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