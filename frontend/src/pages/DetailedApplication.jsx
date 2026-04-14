import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Card, CardContent, Grid, Box, 
  CircularProgress, Alert, Button, Paper, Chip, Stack, Divider,
  Snackbar, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../context/AuthContext';
import { buildImageUrl } from '../utils/imageUrl';

const DetailedApplication = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/requests/${requestId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setApplication(res.data);
      } catch (err) {
        setError("Impossible de charger les détails de la candidature.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [requestId]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Acceptée': return { color: 'success', icon: '✓', label: 'Acceptée' };
      case 'Refusée': return { color: 'error', icon: '✗', label: 'Refusée' };
      case 'En cours': return { color: 'warning', icon: '⏳', label: 'En cours' };
      default: return { color: 'info', icon: '⏱️', label: 'En attente' };
    }
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleStatusChange = async () => {
    if (!newStatus) {
      showToast('Veuillez sélectionner un statut', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `http://localhost:5000/api/requests/${requestId}`,
        { status: newStatus, comment },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setApplication(res.data.request);
      showToast(`✓ Candidature mise à jour: ${newStatus}`, 'success');
      setOpenDialog(false);
      setNewStatus('');
      setComment('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 5 }}>{error}</Alert>;
  if (!application) return <Alert severity="error" sx={{ mt: 5 }}>Candidature non trouvée</Alert>;

  const currentStatusStyle = getStatusStyle(application.status);
  const history = application.statusHistory || [];

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Bouton retour */}
      <Button 
        onClick={() => navigate('/dashboard/applications')}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: '#0a1930' }}
      >
        Retour aux candidatures
      </Button>

      {/* En-tête: Propriété */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Image de la propriété */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              component="img"
              src={buildImageUrl(application.propertyId?.images?.[0])}
              sx={{ width: '100%', height: 200, borderRadius: 2, objectFit: 'cover' }}
            />
          </Grid>

          {/* Infos de la propriété */}
          <Grid size={{ xs: 12, sm: 8 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              {application.propertyId?.title || "Bien immobilier"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
               {application.propertyId?.location}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
               {application.propertyId?.price} €/mois
            </Typography>

            {/* Statut actuel */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">Statut actuel :</Typography>
              <Chip
                label={currentStatusStyle.label}
                color={currentStatusStyle.color}
                sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}
              />
              
              {/* Bouton changement statut (visible SEULEMENT si propriétaire) */}
              {user && application.ownerId._id === user.id && (
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => {
                    setNewStatus(application.status);
                    setOpenDialog(true);
                  }}
                  sx={{ ml: 2, color: '#0a1930', textTransform: 'none', fontSize: '0.9rem' }}
                >
                  Modifier
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Message personnalisé */}
      {application.message && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5', borderLeft: '4px solid #00BCD4' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Votre message :
          </Typography>
          <Typography variant="body2" color="text.secondary">
            "{application.message}"
          </Typography>
        </Paper>
      )}

      {/* Timeline de l'historique */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
           Historique de votre candidature
        </Typography>

        {history.length === 0 ? (
          <Alert severity="info">
            Aucun changement pour le moment. Votre candidature est {application.status.toLowerCase()}.
          </Alert>
        ) : (
          <Stack spacing={3}>
            {history.map((event, index) => {
              const eventStyle = getStatusStyle(event.status);
              const eventDate = new Date(event.date);

              const getColorForStatus = (status) => {
                switch (status) {
                  case 'success': return '#4caf50';
                  case 'error': return '#f44336';
                  case 'warning': return '#ff9800';
                  default: return '#2196f3';
                }
              };

              return (
                <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                  {/* Colonne gauche : point de timeline */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                    {/* Point coloré */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: getColorForStatus(eventStyle.color),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {eventStyle.icon}
                    </Box>
                    {/* Ligne connectrice jusqu'au prochain event */}
                    {index < history.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          bgcolor: '#ddd',
                          mt: -0.5,
                          mb: -0.5
                        }}
                      />
                    )}
                  </Box>

                  {/* Colonne droite : contenu du card */}
                  <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, mt: 0.5 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={eventStyle.label}
                          color={eventStyle.color}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {eventDate.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>

                      {/* Commentaire si disponible */}
                      {event.comment && (
                        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                           {event.comment}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      {/* Dialog pour changer le statut */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le statut de la candidature</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Nouveau statut</InputLabel>
              <Select
                value={newStatus}
                label="Nouveau statut"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="En cours">En cours</MenuItem>
                <MenuItem value="Acceptée">Acceptée</MenuItem>
                <MenuItem value="Refusée">Refusée</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Commentaire optionnel"
              multiline
              rows={3}
              fullWidth
              placeholder="Ex: Raison du refus, demandes supplémentaires, etc."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            disabled={submitting}
            sx={{ background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)' }}
          >
            {submitting ? 'En cours...' : 'Valider'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default DetailedApplication;
