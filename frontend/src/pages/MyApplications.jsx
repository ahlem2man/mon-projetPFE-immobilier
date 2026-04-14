import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Grid, 
  Chip, Box, CircularProgress, Alert, Stack, Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { buildImageUrl } from '../utils/imageUrl';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
 

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const token = localStorage.getItem('token'); // Assure-toi que le token est bien là
        const res = await axios.get(`${API_BASE_URL}/requests/my-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Ton controller renvoie directement le tableau 'requests'
        setApplications(res.data); 
      } catch (err) {
        setError("Impossible de charger vos candidatures.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyApplications();
  }, []);

  // Fonction pour styliser le badge selon le statut
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Acceptée': return { color: 'success', label: 'Acceptée' };
      case 'Refusée': return { color: 'error', label: 'Refusée' };
      case 'En cours': return { color: 'warning', label: 'En cours' };
      default: return { color: 'info', label: 'En attente' };
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Suivi de mes candidatures
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {applications.length === 0 ? (
        <Alert severity="info">Vous n'avez pas encore envoyé de candidature.</Alert>
      ) : (
        <Stack spacing={3}>
          {applications.map((app) => {
            const statusStyle = getStatusStyle(app.status);
            return (
              <Card 
  key={app._id} 
  onClick={() => navigate(`/dashboard/applications/${app._id}`)}
  sx={{ 
    borderRadius: 3, 
    cursor: 'pointer', 
    transition: '0.3s',
    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' }
  }}
>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    {/* Image miniature du bien */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Box 
                        component="img"
                        src={buildImageUrl(app.propertyId?.images?.[0])}
                        sx={{ width: '100%', height: 100, borderRadius: 2, objectFit: 'cover' }}
                      />
                    </Grid>

                    {/* Infos du bien */}
<Grid size={{ xs: 12, sm: 6 }}>
  <Typography variant="h6" fontWeight="bold">
    {app.propertyId?.title || "Bien immobilier"}
  </Typography>
  <Typography variant="body2" color="text.secondary">
    {app.propertyId?.location} • {app.propertyId?.price} €/mois
  </Typography>
  
  {/* CETTE PARTIE POUR L'HISTORIQUE */}
  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
      Postulé le : {new Date(app.createdAt).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </Typography>
  </Stack>
</Grid>
                    {/* Statut */}
                    <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: { sm: 'right', xs: 'left' } }}>
                      <Stack spacing={1} alignItems={{ sm: 'flex-end', xs: 'flex-start' }}>
                        <Chip 
                          label={statusStyle.label} 
                          color={statusStyle.color} 
                          variant="filled" 
                          sx={{ fontWeight: 'bold', minWidth: 100 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                          sx={{ color: '#00BCD4', borderColor: '#00BCD4' }}
                        >
                          Voir détails
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
};

export default MyApplications;