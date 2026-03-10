import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, IconButton, Button, Container, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SearchesPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const navigate = useNavigate();

  // ✨ ÉTATS pour l'édition
  const [editingSearchId, setEditingSearchId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editFilters, setEditFilters] = useState({
    location: '',
    propertyType: 'Tous',
    minPrice: '',
    budgetMax: '',
    minRooms: ''
  });

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = () => {
    axios.get('http://localhost:5000/api/tenant/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setSearches(res.data.savedSearches || []))
      .catch(err => setAlertMsg('Erreur lors du chargement des recherches'));
  };

  //  OUVRIR LE DIALOG POUR ÉDITER
  const handleEditOpen = (search) => {
    setEditingSearchId(search._id);
    setEditLabel(search.label);
    setEditFilters({
      location: search.filters.location || '',
      propertyType: search.filters.propertyType || 'Tous',
      minPrice: search.filters.minPrice || '',
      budgetMax: search.filters.budgetMax || '',
      minRooms: search.filters.minRooms || ''
    });
  };

  //  FERMER LE DIALOG
  const handleEditClose = () => {
    setEditingSearchId(null);
    setEditLabel('');
    setEditFilters({ location: '', propertyType: 'Tous', minPrice: '', budgetMax: '', minRooms: '' });
  };

  //  SAUVEGARDER LES MODIFICATIONS
  const handleSaveEdit = async () => {
    if (!editLabel.trim()) {
      setAlertMsg('Le nom de la recherche ne peut pas être vide');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/tenant/update-search/${editingSearchId}`,
        { label: editLabel, filters: editFilters },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setAlertMsg(' Recherche mise à jour !');
      fetchSearches();
      handleEditClose();
    } catch (error) {
      setAlertMsg(' Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
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
      
      const queryParams = new URLSearchParams();
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.propertyType && filters.propertyType !== 'Tous') queryParams.append('type', filters.propertyType);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.budgetMax) queryParams.append('maxPrice', filters.budgetMax);
      if (filters.minRooms) queryParams.append('minRooms', filters.minRooms);
      
      navigate(`/?${queryParams.toString()}`);
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
          severity={alertMsg.includes('❌') || alertMsg.includes('Erreur') ? 'error' : 'success'} 
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
              <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleEditOpen(s)}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ '&:hover': { textDecoration: 'underline', color: '#00BCD4' } }}>
                  {s.label}
                </Typography>
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
                  color="info" 
                  size="small"
                  onClick={() => handleEditOpen(s)}
                  title="Éditer cette recherche"
                  disabled={loading}
                >
                  <EditIcon />
                </IconButton>
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

      {/* ✨ DIALOG D'ÉDITION */}
      <Dialog open={!!editingSearchId} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Éditer la recherche</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nom de la recherche"
            fullWidth
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            placeholder="Ex: Appartement 3 pièces à Paris"
          />

          <TextField
            label="Localisation"
            fullWidth
            value={editFilters.location}
            onChange={(e) => setEditFilters({ ...editFilters, location: e.target.value })}
            placeholder="Paris, Lyon, etc."
          />

          <FormControl fullWidth>
            <InputLabel>Type de propriété</InputLabel>
            <Select
              value={editFilters.propertyType}
              onChange={(e) => setEditFilters({ ...editFilters, propertyType: e.target.value })}
              label="Type de propriété"
            >
              <MenuItem value="Tous">Tous</MenuItem>
              <MenuItem value="Appartement">Appartement</MenuItem>
              <MenuItem value="Maison">Maison</MenuItem>
              <MenuItem value="Studio">Studio</MenuItem>
              <MenuItem value="Penthouse">Penthouse</MenuItem>
              <MenuItem value="Villa">Villa</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Budget minimum"
            type="number"
            fullWidth
            value={editFilters.minPrice}
            onChange={(e) => setEditFilters({ ...editFilters, minPrice: e.target.value })}
            placeholder="0"
          />

          <TextField
            label="Budget maximum"
            type="number"
            fullWidth
            value={editFilters.budgetMax}
            onChange={(e) => setEditFilters({ ...editFilters, budgetMax: e.target.value })}
            placeholder="50000"
          />

          <TextField
            label="Nombre de chambres minimum"
            type="number"
            fullWidth
            value={editFilters.minRooms}
            onChange={(e) => setEditFilters({ ...editFilters, minRooms: e.target.value })}
            placeholder="0"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Annuler</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: '#0a1930' }} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}