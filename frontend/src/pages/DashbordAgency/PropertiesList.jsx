import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, Avatar, Tooltip, 
  CircularProgress, Checkbox, Select, MenuItem 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import { buildImageUrl } from '../../utils/imageUrl';
import API_BASE_URL from '../../config/api';

const PropertiesList = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]); // Pour les actions groupées
  const token = localStorage.getItem('token');

  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/properties/mine/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(res.data.data);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS INDIVIDUELLES ---

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/properties/${id}/status`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchProperties();
    } catch (err) {
      alert("Erreur changement statut");
    }
  };

  const handleEdit = (id) => {
    navigate(`/agency/properties/${id}/edit`);
  };

  const handleDuplicate = async (id) => {
    if (window.confirm("Dupliquer cette annonce ?")) {
      try {
        await axios.post(`${API_BASE_URL}/properties/${id}/duplicate`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProperties();
      } catch (err) {
        alert("Erreur duplication");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette annonce ?")) {
      try {
        await axios.delete(`${API_BASE_URL}/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProperties(properties.filter(p => p._id !== id));
      } catch (err) {
        alert("Erreur suppression");
      }
    }
  };

  // --- BULK DELETE (ACTIONS GROUPÉES) ---

  const handleBulkDelete = async () => {
    if (selected.length === 0) {
      alert("Veuillez sélectionner au moins une propriété");
      return;
    }

    if (window.confirm(`Supprimer ${selected.length} annonce(s) ? Cette action est irréversible.`)) {
      try {
        await axios.post(`${API_BASE_URL}/properties/bulk-delete`, 
          { ids: selected }, 
          { headers: { Authorization: `Bearer ${token}` }}
        );
        // Recharger les propriétés et réinitialiser la sélection
        setSelected([]);
        fetchProperties();
        alert(`${selected.length} annonce(s) supprimée(s)`);
      } catch (err) {
        console.error(err);
        alert("Erreur suppression groupée: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // --- LOGIQUE DE SÉLECTION ---

  const handleSelectOne = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    setSelected(e.target.checked ? properties.map(p => p._id) : []);
  };

  useEffect(() => { fetchProperties(); }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header avec bouton Add */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Mon Catalogue Immobilier</Typography>
        <Box>
          {selected.length > 0 && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />} 
              sx={{ mr: 2 }}
              onClick={handleBulkDelete}
            >
              Supprimer ({selected.length})
            </Button>
          )}
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/agency/properties/add')}
            sx={{ borderRadius: 2, bgcolor: '#1A237E' }}
          >
            Nouvelle Annonce
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8F9FA' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox 
                  indeterminate={selected.length > 0 && selected.length < properties.length}
                  checked={properties.length > 0 && selected.length === properties.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Bien</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((prop) => (
              <TableRow key={prop._id} hover selected={selected.includes(prop._id)}>
                <TableCell padding="checkbox">
                  <Checkbox 
                    checked={selected.includes(prop._id)} 
                    onChange={() => handleSelectOne(prop._id)} 
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={buildImageUrl(prop.images[0])} 
                      variant="rounded" 
                      sx={{ width: 50, height: 50, mr: 2, border: '1px solid #eee' }} 
                    />
                    <Box>
                      <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>{prop.title}</Typography>
                      <Typography variant="caption" color="textSecondary">{prop.location}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{prop.price.toLocaleString()} EUR</Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={prop.status}
                    onChange={(e) => handleStatusChange(prop._id, e.target.value)}
                    size="small"
                    sx={{ 
                      height: 30, 
                      fontSize: '0.75rem', 
                      borderRadius: 2,
                      bgcolor: prop.status === 'disponible' ? '#e8f5e9' : 
                             prop.status === 'louée' ? '#fff3e0' : 
                             prop.status === 'en attente' ? '#e3f2fd' : '#ffebee'
                    }}
                  >
                    <MenuItem value="disponible">Disponible</MenuItem>
                    <MenuItem value="louée">Louée</MenuItem>
                    <MenuItem value="en attente">En attente</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <VisibilityIcon sx={{ fontSize: '1rem' }} />
                      <Typography variant="caption"><b>{prop.views || 0}</b> vues</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FavoriteIcon sx={{ fontSize: '1rem', color: '#e91e63' }} />
                      <Typography variant="caption"><b>{prop.favorites?.length || 0}</b> favoris</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Analytics"><IconButton onClick={() => navigate(`/agency/properties/${prop._id}/analytics`)} color="success" size="small"><AnalyticsIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Dupliquer"><IconButton onClick={() => handleDuplicate(prop._id)} color="secondary" size="small"><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Modifier"><IconButton onClick={() => handleEdit(prop._id)} color="primary" size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton onClick={() => handleDelete(prop._id)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PropertiesList;