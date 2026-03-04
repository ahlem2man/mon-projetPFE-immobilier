import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Card, CardContent, Grid, 
  Chip, Box, CircularProgress, Alert, Stack 
} from '@mui/material';
import axios from 'axios';


const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const token = localStorage.getItem('token'); // Assure-toi que le token est bien là
        const res = await axios.get('http://localhost:5000/api/requests/my-requests', {
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
              <Card key={app._id} variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    {/* Image miniature du bien */}
                    <Grid item xs={12} sm={3}>
                      <Box 
                        component="img"
                        src={app.propertyId?.images?.[0] || 'https://via.placeholder.com/150'}
                        sx={{ width: '100%', height: 100, borderRadius: 2, objectFit: 'cover' }}
                      />
                    </Grid>

                    {/* Infos du bien */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" fontWeight="bold">
                        {app.propertyId?.title || "Bien immobilier"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {app.propertyId?.location} • {app.propertyId?.price} €/mois
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Envoyée le : {new Date(app.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>

                    {/* Statut */}
                    <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right', xs: 'left' } }}>
                      <Chip 
                        label={statusStyle.label} 
                        color={statusStyle.color} 
                        variant="filled" 
                        sx={{ fontWeight: 'bold', minWidth: 100 }}
                      />
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