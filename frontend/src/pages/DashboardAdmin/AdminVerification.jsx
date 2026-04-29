import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Checkbox, Toolbar, Tooltip, TextField
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';

const AdminVerification = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [token] = useState(localStorage.getItem('token'));
  const [tabValue, setTabValue] = useState(0);
  
  // Pour le détail d'un utilisateur
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [agencyDocs, setAgencyDocs] = useState([]);
  
  // Pour le rejet
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectingUser, setRejectingUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const API_URL = 'http://localhost:5000/api/admin';

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users?isVerified=false`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedUsers(pendingUsers.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (id) => {
    const index = selectedUsers.indexOf(id);
    if (index > -1) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/users/${userId}`,
        { isVerified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Utilisateur vérifié avec succès');
      setOpenDetailDialog(false);
      fetchPendingUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUser = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/users/${rejectingUser._id}`,
        { 
          isVerified: false,
          isSuspended: true,
          suspensionReason: `Vérification rejetée: ${rejectReason}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Utilisateur rejeté et suspendu');
      setOpenRejectDialog(false);
      setRejectingUser(null);
      setRejectReason('');
      fetchPendingUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/users/bulk-action`,
        { ids: selectedUsers, action: 'verify' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`${selectedUsers.length} utilisateurs vérifiés`);
      setSelectedUsers([]);
      fetchPendingUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la vérification groupée');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    if (user.role === 'agency') {
      // Récupérer les documents de vérification de l'agence
      // Pour l'instant, on simule
      setAgencyDocs(user.verificationDocs || []);
    }
    setOpenDetailDialog(true);
  };

  const filteredUsers = pendingUsers.filter(user => {
    if (tabValue === 0) return true; // Tous
    if (tabValue === 1) return user.role === 'tenant'; // Locataires
    if (tabValue === 2) return user.role === 'agency'; // Agences
    return true;
  });

  return (
    <Box>
      {/* Messages d'alerte */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1A237E' }}>
        Vérification des Comptes
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0' }}>
            <Typography color="textSecondary" variant="overline">
              En Attente
            </Typography>
            <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
              {pendingUsers.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0' }}>
            <Typography color="textSecondary" variant="overline">
              Locataires
            </Typography>
            <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
              {pendingUsers.filter(u => u.role === 'tenant').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0' }}>
            <Typography color="textSecondary" variant="overline">
              Agences
            </Typography>
            <Typography variant="h4" sx={{ color: '#3F51B5', fontWeight: 'bold' }}>
              {pendingUsers.filter(u => u.role === 'agency').length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Tous" />
          <Tab label="Locataires" />
          <Tab label="Agences" />
        </Tabs>
      </Box>

      {/* Toolbar pour actions groupées */}
      {selectedUsers.length > 0 && (
        <Toolbar sx={{ bgcolor: '#f0f4ff', borderRadius: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="primary" variant="subtitle1">
            {selectedUsers.length} sélectionné(s)
          </Typography>
          <Button
            startIcon={<CheckCircleIcon />}
            color="success"
            onClick={handleBulkVerify}
            disabled={loading}
          >
            Vérifier Tout
          </Button>
        </Toolbar>
      )}

      {/* Tableau */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    Aucun compte en attente de vérification
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user._id} hover selected={selectedUsers.includes(user._id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectOne(user._id)}
                    />
                  </TableCell>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: user.role === 'agency' ? '#3F51B5' : '#4CAF50' }}>
                      {user.name?.[0] || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role === 'agency' ? 'Agence' : 'Locataire'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir détails">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(user)}
                        disabled={loading}
                      >
                        <DescriptionIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Vérifier">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleVerifyUser(user._id)}
                        disabled={loading}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rejeter">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setRejectingUser(user);
                          setOpenRejectDialog(true);
                        }}
                        disabled={loading}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog: Détails utilisateur */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails du compte</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedUser && (
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">Nom:</Typography>
              <Typography sx={{ mb: 2 }}>{selectedUser.name}</Typography>

              <Typography variant="subtitle2" fontWeight="bold">Email:</Typography>
              <Typography sx={{ mb: 2 }}>{selectedUser.email}</Typography>

              <Typography variant="subtitle2" fontWeight="bold">Rôle:</Typography>
              <Typography sx={{ mb: 2 }}>{selectedUser.role}</Typography>

              {selectedUser.role === 'agency' && agencyDocs.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight="bold">Documents de vérification:</Typography>
                  <Box sx={{ mb: 2, pl: 2 }}>
                    {agencyDocs.map((doc, idx) => (
                      <Typography key={idx} variant="body2">
                        • {doc.docType}: {doc.fileUrl}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Fermer</Button>
          <Button
            onClick={() => {
              handleVerifyUser(selectedUser._id);
            }}
            variant="contained"
            color="success"
            disabled={loading}
          >
            Vérifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Rejeter */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeter le compte</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir rejeter ce compte ? L'utilisateur sera suspendu.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Raison du rejet"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Entrez la raison du rejet..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Annuler</Button>
          <Button
            onClick={handleRejectUser}
            variant="contained"
            color="error"
            disabled={!rejectReason || loading}
          >
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminVerification;
