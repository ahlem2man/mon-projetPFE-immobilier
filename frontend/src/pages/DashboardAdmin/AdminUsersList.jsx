import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Chip, Tooltip, Avatar, TextField, MenuItem, Box, 
  Button, Checkbox, Toolbar, Typography, Dialog, DialogTitle, DialogContent, 
  DialogActions, Alert
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('Tous');
  const [selected, setSelected] = useState([]);
  const [token] = useState(localStorage.getItem('token'));
  const [editingUser, setEditingUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_URL = 'http://localhost:5000/api/admin';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = roleFilter === 'Tous' 
        ? `${API_URL}/users` 
        : `${API_URL}/users?role=${roleFilter.toLowerCase()}`;
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
      setError(null);
    } catch (err) { 
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
  }, [roleFilter]);

  // --- Logique de Sélection ---
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(users.map((n) => n._id));
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else {
      newSelected = selected.filter(item => item !== id);
    }
    setSelected(newSelected);
  };

  // --- Actions Groupées ---
  const handleBulkAction = async (action, confirmMsg = '') => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await axios.post(`${API_URL}/users/bulk-action`, {
        ids: selected,
        action: action,
        suspensionReason: action === 'suspend' ? 'Suspendu par administration' : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`${selected.length} utilisateurs ont été ${
        action === 'verify' ? 'vérifiés' : 
        action === 'suspend' ? 'suspendus' :
        action === 'delete' ? 'supprimés' : 'mis à jour'
      }`);
      setSelected([]);
      fetchUsers();
    } catch (err) { 
      setError(err.response?.data?.message || "Erreur lors de l'action"); 
    } finally {
      setLoading(false);
    }
  };

  // --- Actions Individuelles ---
  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isSuspended: user.isSuspended
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingUser(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/users/${editingUser._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Utilisateur mis à jour avec succès');
      setOpenEditDialog(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr ? Cette action est irréversible.')) return;

    try {
      setLoading(true);
      await axios.delete(
        `${API_URL}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Utilisateur supprimé');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualAction = async (userId, action) => {
    try {
      setLoading(true);
      if (action === 'verify') {
        await axios.patch(
          `${API_URL}/users/${userId}/status`,
          { isVerified: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Utilisateur vérifié');
      } else if (action === 'suspend') {
        await axios.patch(
          `${API_URL}/users/${userId}/status`,
          { isSuspended: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Utilisateur suspendu');
      }
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Messages d'alerte */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Barre d'actions groupées */}
      {selected.length > 0 && (
        <Toolbar sx={{ bgcolor: '#f0f4ff', borderRadius: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="primary" variant="subtitle1">{selected.length} sélectionné(s)</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              startIcon={<VerifiedUserIcon />} 
              onClick={() => handleBulkAction('verify')}
              size="small"
            >
              Vérifier tout
            </Button>
            <Button 
              color="warning" 
              startIcon={<BlockIcon />} 
              onClick={() => handleBulkAction('suspend', 'Suspendre les utilisateurs sélectionnés ?')}
              size="small"
            >
              Suspendre tout
            </Button>
            <Button 
              color="error" 
              startIcon={<DeleteIcon />} 
              onClick={() => handleBulkAction('delete', 'ATTENTION : Cela supprimera définitivement ces utilisateurs et leurs annonces. Continuer ?')}
              size="small"
            >
              Supprimer tout
            </Button>
          </Box>
        </Toolbar>
      )}

      {/* Filtres */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          select size="small" label="Filtrer par rôle"
          value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="Tous">Tous</MenuItem>
          <MenuItem value="tenant">Locataires</MenuItem>
          <MenuItem value="agency">Agences</MenuItem>
          <MenuItem value="admin">Administrateurs</MenuItem>
        </TextField>
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < users.length}
                  checked={users.length > 0 && selected.length === users.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover selected={selected.includes(user._id)}>
                <TableCell padding="checkbox">
                  <Checkbox 
                    checked={selected.includes(user._id)} 
                    onChange={() => handleSelectOne(user._id)}
                  />
                </TableCell>
                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: user.role === 'agency' ? '#3f51b5' : '#4caf50' }}>
                    {user.name?.[0] || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={user.role} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {user.isVerified && <Chip icon={<CheckCircleIcon />} label="Vérifié" color="success" size="small" />}
                    {user.isSuspended && <Chip label="Suspendu" color="error" size="small" />}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Éditer">
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenEditDialog(user)}
                      disabled={loading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {!user.isVerified && (
                    <Tooltip title="Vérifier">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleIndividualAction(user._id, 'verify')}
                        disabled={loading}
                      >
                        <VerifiedUserIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {!user.isSuspended && (
                    <Tooltip title="Suspendre">
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handleIndividualAction(user._id, 'suspend')}
                        disabled={loading}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Supprimer">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={loading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog d'édition */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Éditer l'utilisateur</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth label="Nom" margin="normal"
            value={editFormData.name || ''}
            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
          />
          <TextField
            fullWidth label="Email" margin="normal" type="email"
            value={editFormData.email || ''}
            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
          />
          <TextField
            select fullWidth label="Rôle" margin="normal"
            value={editFormData.role || 'tenant'}
            onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
          >
            <MenuItem value="tenant">Locataire</MenuItem>
            <MenuItem value="agency">Agence</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
          </TextField>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Checkbox
              checked={editFormData.isVerified || false}
              onChange={(e) => setEditFormData({...editFormData, isVerified: e.target.checked})}
              label="Vérifié"
            />
            <Typography variant="body2">Vérifié</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Checkbox
              checked={editFormData.isSuspended || false}
              onChange={(e) => setEditFormData({...editFormData, isSuspended: e.target.checked})}
              label="Suspendu"
            />
            <Typography variant="body2">Suspendu</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Annuler</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={loading}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersList;