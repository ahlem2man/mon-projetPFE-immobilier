import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const AgencyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Récupérer toutes les candidatures pour les propriétés de l'agence
      const res = await axios.get('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement candidatures:', err);
      setError('Impossible de charger les candidatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'en attente':
        return 'warning';
      case 'acceptée':
        return 'success';
      case 'rejetée':
        return 'error';
      case 'annulée':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#1A237E' }}>
        Candidatures Reçues
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="textSecondary">
            Aucune candidature pour le moment
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8F9FA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Locataire</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Propriété</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date de Candidature</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {app.tenantId?.fullName || 'Locataire'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {app.tenantId?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {app.propertyId?.title || 'Propriété supprimée'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir les détails">
                      <IconButton
                        component={RouterLink}
                        to={`/dashboard/applications/${app._id}`}
                        size="small"
                        color="primary"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AgencyApplications;
