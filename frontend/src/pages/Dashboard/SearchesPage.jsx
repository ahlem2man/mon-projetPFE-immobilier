import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, IconButton, Button, Container, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SearchesPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = () => {
    // Charger les données du locataire (qui incluent savedSearches)
    axios.get('http://localhost:5000/api/tenant/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setSearches(res.data.savedSearches || []))
      .catch(err => setAlertMsg('Erreur lors du chargement des recherches'));
  };

  const handleDelete = async (searchId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/tenant/delete-search/${searchId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAlertMsg('Recherche supprimée !');
      fetchSearches();
    } catch (error) {
      setAlertMsg('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleRelancer = async (searchId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/tenant/search/${searchId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const { filters } = response.data;
      // Naviguer vers Home avec les filtres en query params
      navigate('/', {
        state: {
          searchFilters: filters,
          fromSavedSearch: true
        }
      });
    } catch (error) {
      setAlertMsg('Erreur lors du lancement de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight="bold" color="#0a1930" gutterBottom>
        Mes recherches sauvegardées
      </Typography>

      {alertMsg && (
        <Alert 
          severity={alertMsg.includes('Erreur') ? 'error' : 'success'} 
          onClose={() => setAlertMsg(null)} 
          sx={{ mt: 2, mb: 2 }}
        >
          {alertMsg}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mt: 3 }}>
        {searches.length === 0 ? (
          <Typography color="text.secondary">Vous n'avez pas encore de recherches enregistrées.</Typography>
        ) : (
          searches.map((s) => (
            <Paper key={s._id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{s.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.filters.location} • Max {s.filters.budgetMax}€ • {s.filters.propertyType}
                </Typography>
              </Box>
              <Box>
                <Button 
                  startIcon={<SearchIcon />} 
                  size="small" 
                  variant="contained" 
                  sx={{ bgcolor: '#0a1930', mr: 1 }}
                  onClick={() => handleRelancer(s._id)}
                  disabled={loading}
                >
                  Relancer
                </Button>
                <IconButton 
                  color="error" 
                  size="small"
                  onClick={() => handleDelete(s._id)}
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))
        )}
      </Stack>
    </Container>
  );
}