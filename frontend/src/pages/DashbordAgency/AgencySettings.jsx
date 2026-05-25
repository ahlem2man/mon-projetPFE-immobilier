// src/pages/DashbordAgency/AgencySettings.jsx
import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, 
  Switch, FormControlLabel, Divider, Alert, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AgencySettings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifs, setNotifs] = useState({ emailAlerts: true, marketingEmails: false });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Charger les préférences actuelles
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.preferences) {
          setNotifs({
            emailAlerts: res.data.preferences.emailAlerts || false,
            marketingEmails: res.data.preferences.marketingEmails || false
          });
        }
      } catch (err) {
        console.error('Erreur chargement préférences:', err);
      }
    };
    if (token) loadSettings();
  }, [token]);

  // Changer le mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setStatus({ type: 'error', msg: 'Les nouveaux mots de passe ne correspondent pas.' });
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return setStatus({ type: 'error', msg: 'Tous les champs sont obligatoires.' });
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStatus({ type: 'success', msg: '✅ Mot de passe mis à jour !' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Erreur lors du changement' });
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les notifications
  const handleNotifChange = async (field, value) => {
    const newNotifs = { ...notifs, [field]: value };
    setNotifs(newNotifs);

    try {
      await axios.patch(
        `${API_BASE_URL}/auth/notifications`,
        {
          emailAlerts: newNotifs.emailAlerts,
          marketingEmails: newNotifs.marketingEmails
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ type: 'success', msg: '✅ Préférences mises à jour !' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Erreur lors de la mise à jour' });
      setNotifs(notifs); // Revenir à l'état précédent
    }
  };

  // Supprimer le compte
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setStatus({ type: 'error', msg: 'Le mot de passe est requis' });
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE_URL}/auth/account`,
        {
          data: { password: deletePassword },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setStatus({ type: 'success', msg: '✅ Compte supprimé. Redirection...' });
      localStorage.removeItem('token');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Erreur lors de la suppression' });
    } finally {
      setLoading(false);
      setDeleteDialog(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1A237E' }}>
        Paramètres du compte
      </Typography>

      {status && (
        <Alert severity={status.type} sx={{ mb: 3 }} onClose={() => setStatus(null)}>
          {status.msg}
        </Alert>
      )}

      <Grid container spacing={4}>
        
        {/* --- SECTION 1 : SÉCURITÉ --- */}
        <Grid sx={{ width: '100%' }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ mr: 1, color: '#3F51B5' }} />
              <Typography variant="h6">Sécurité & Mot de passe</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={handlePasswordChange}>
              <Grid container spacing={2}>
                <Grid sx={{ width: '100%' }}>
                  <TextField 
                    fullWidth 
                    type="password" 
                    label="Mot de passe actuel" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    disabled={loading}
                  />
                </Grid>
                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField 
                    fullWidth 
                    type="password" 
                    label="Nouveau mot de passe" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    disabled={loading}
                  />
                </Grid>
                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField 
                    fullWidth 
                    type="password" 
                    label="Confirmer le nouveau mot de passe" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    disabled={loading}
                  />
                </Grid>
                <Grid sx={{ width: '100%' }}>
                  <Button 
                    variant="contained" 
                    type="submit" 
                    sx={{ bgcolor: '#3F51B5' }}
                    disabled={loading}
                  >
                    {loading ? 'Traitement...' : 'Mettre à jour le mot de passe'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* --- SECTION 2 : NOTIFICATIONS --- */}
        <Grid sx={{ width: '100%' }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1, color: '#3F51B5' }} />
              <Typography variant="h6">Préférences de notifications</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifs.emailAlerts} 
                    onChange={(e) => handleNotifChange('emailAlerts', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Recevoir un email pour chaque nouvelle candidature"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifs.marketingEmails} 
                    onChange={(e) => handleNotifChange('marketingEmails', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Recevoir les actualités du marché immobilier"
              />
            </Box>
          </Paper>
        </Grid>

        {/* --- SECTION 3 : ZONE DE DANGER --- */}
        <Grid sx={{ width: '100%' }}>
          <Card sx={{ border: '1px solid #ffcdd2', bgcolor: '#fffbfa' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#d32f2f' }}>
                <DeleteForeverIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Zone de danger</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Une fois votre compte agence supprimé, toutes vos annonces et données seront définitivement effacées.
              </Typography>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => setDeleteDialog(true)}
                disabled={loading}
              >
                Désactiver le compte agence
              </Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* DIALOG DE CONFIRMATION SUPPRESSION */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>⚠️ Confirmation de suppression</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
            Cette action est irréversible. Vous perdrez toutes vos annonces et données.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Entrez votre mot de passe pour confirmer :
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Mot de passe"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={loading}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            color="error" 
            variant="contained"
            disabled={!deletePassword || loading}
          >
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgencySettings;