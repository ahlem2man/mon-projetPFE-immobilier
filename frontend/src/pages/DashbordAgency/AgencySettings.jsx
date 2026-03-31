// src/pages/DashbordAgency/AgencySettings.jsx
import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, 
  Switch, FormControlLabel, Divider, Alert, Card, CardContent 
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import axios from 'axios';

const AgencySettings = () => {
  const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
  const [notifs, setNotifs] = useState({ emailAlerts: true, marketing: false });
  const [status, setStatus] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.next !== passwordData.confirm) {
      return setStatus({ type: 'error', msg: 'Les nouveaux mots de passe ne correspondent pas.' });
    }
    // Appel API (à créer côté backend plus tard)
    setStatus({ type: 'success', msg: 'Mot de passe mis à jour !' });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1A237E' }}>
        Paramètres du compte
      </Typography>

      {status && <Alert severity={status.type} sx={{ mb: 3 }}>{status.msg}</Alert>}

      <Grid container spacing={4}>
        
        {/* --- SECTION 1 : SÉCURITÉ --- */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ mr: 1, color: '#3F51B5' }} />
              <Typography variant="h6">Sécurité & Mot de passe</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={handlePasswordChange}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth type="password" label="Mot de passe actuel" 
                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="password" label="Nouveau mot de passe" 
                    onChange={(e) => setPasswordData({...passwordData, next: e.target.value})} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="password" label="Confirmer le nouveau mot de passe" 
                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" type="submit" sx={{ bgcolor: '#3F51B5' }}>
                    Mettre à jour le mot de passe
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* --- SECTION 2 : NOTIFICATIONS --- */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1, color: '#3F51B5' }} />
              <Typography variant="h6">Préférences de notifications</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={<Switch checked={notifs.emailAlerts} onChange={(e) => setNotifs({...notifs, emailAlerts: e.target.checked})} />}
                label="Recevoir un email pour chaque nouvelle candidature"
              />
              <FormControlLabel
                control={<Switch checked={notifs.marketing} onChange={(e) => setNotifs({...notifs, marketing: e.target.checked})} />}
                label="Recevoir les actualités du marché immobilier"
              />
            </Box>
          </Paper>
        </Grid>

        {/* --- SECTION 3 : ZONE DE DANGER --- */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid #ffcdd2', bgcolor: '#fffbfa' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#d32f2f' }}>
                <DeleteForeverIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Zone de danger</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Une fois votre compte agence supprimé, toutes vos annonces et données seront définitivement effacées.
              </Typography>
              <Button variant="outlined" color="error">
                Désactiver le compte agence
              </Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AgencySettings;