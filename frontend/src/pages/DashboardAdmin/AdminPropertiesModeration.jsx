import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, MenuItem, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import axios from 'axios';

const AdminPropertiesModeration = () => {
  const [properties, setProperties] = useState([]);
  const [token] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Pour le filtre
  const [filterType, setFilterType] = useState('en attente');
  
  // Pour le dialog de rejet
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectingProperty, setRejectingProperty] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const API_URL = 'http://localhost:5000/api/admin';

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/properties/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProperties(); 
  }, []);

  // Filtrer les propriétés selon le type
  const filteredProperties = properties.filter(prop => {
    if (filterType === 'en attente') return prop.moderationStatus === 'en attente';
    if (filterType === 'signalées') return prop.isReported;
    return true;
  });

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/properties/${id}/moderate`,
        { moderationStatus: 'validé' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Annonce approuvée');
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'approbation');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRejectDialog = (property) => {
    setRejectingProperty(property);
    setRejectReason('');
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectingProperty(null);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Veuillez entrer une raison de rejet');
      return;
    }

    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/properties/${rejectingProperty._id}/moderate`,
        { 
          moderationStatus: 'rejeté',
          adminNotes: rejectReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Annonce rejetée');
      handleCloseRejectDialog();
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Messages d'alerte */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Filtres */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {filteredProperties.length} annonce{filteredProperties.length !== 1 ? 's' : ''}
        </Typography>
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(e, newType) => newType && setFilterType(newType)}
          size="small"
        >
          <ToggleButton value="en attente">
            En attente
          </ToggleButton>
          <ToggleButton value="signalées">
            Signalées
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Grille d'annonces */}
      <Grid container spacing={2}>
        {filteredProperties.length === 0 && (
          <Grid item xs={12}>
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              {filterType === 'en attente' 
                ? 'Aucune annonce en attente de modération.' 
                : 'Aucune annonce signalée.'}
            </Typography>
          </Grid>
        )}
        
        {filteredProperties.map((prop) => (
          <Grid item xs={12} sm={6} md={4} key={prop._id}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  height: 140,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {prop.images?.[0] ? (
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <Box
                  sx={{
                    display: prop.images?.[0] ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    bgcolor: '#e8eaf6',
                    color: '#3F51B5'
                  }}
                >
                  <HomeWorkIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="caption">Pas d'image</Typography>
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" noWrap fontWeight="bold">{prop.title}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {prop.price} TND • {prop.location}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary" sx={{ mb: 2 }}>
                  Par: {prop.owner?.name || 'Inconnu'}
                </Typography>

                {/* Afficher les raisons de signalement si l'annonce est signalée */}
                {prop.isReported && prop.reportReasons && prop.reportReasons.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" fontWeight="bold" color="error" display="block">
                      <ErrorIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      Raisons de signalement:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {prop.reportReasons.map((reason, idx) => (
                        <Chip 
                          key={idx} 
                          label={reason} 
                          size="small" 
                          color="error" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Afficher les notes admin si présentes */}
                {prop.adminNotes && (
                  <Box sx={{ mb: 2, p: 1, bgcolor: '#fff3e0', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="bold" display="block">Notes admin:</Typography>
                    <Typography variant="caption">{prop.adminNotes}</Typography>
                  </Box>
                )}

                {/* Statut actuel */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={prop.moderationStatus === 'en attente' ? 'En attente' : 
                           prop.moderationStatus === 'validé' ? 'Approuvée' : 'Rejetée'}
                    size="small"
                    color={prop.moderationStatus === 'en attente' ? 'warning' : 
                           prop.moderationStatus === 'validé' ? 'success' : 'error'}
                    variant="filled"
                  />
                </Box>
              </CardContent>

              {/* Actions */}
              {prop.moderationStatus === 'en attente' && (
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="success"
                    startIcon={<CheckIcon />}
                    fullWidth
                    onClick={() => handleApprove(prop._id)}
                    disabled={loading}
                  >
                    Approuver
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    startIcon={<CloseIcon />}
                    fullWidth
                    onClick={() => handleOpenRejectDialog(prop)}
                    disabled={loading}
                  >
                    Rejeter
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog pour rejeter une annonce */}
      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeter l'annonce</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Annonce: <strong>{rejectingProperty?.title}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Raison du rejet"
            placeholder="Expliquez pourquoi cette annonce est rejetée..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Annuler</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={loading || !rejectReason.trim()}
          >
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPropertiesModeration;