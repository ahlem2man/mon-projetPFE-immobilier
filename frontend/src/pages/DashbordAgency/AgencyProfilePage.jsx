import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Paper, Avatar, 
  IconButton, Alert, CircularProgress 
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { buildImageUrl } from '../../utils/imageUrl';
import API_BASE_URL from '../../config/api'; 

const AgencyProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  
  // On récupère le token une seule fois pour le réutiliser
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    agencyName: '',
    licenseNumber: '',
    address: '',
    phoneNumber: '',
    website: '',
    description: '',
    logo: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/agency/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // On fusionne les données reçues avec l'état initial pour éviter les champs undefined
        if (res.data) setFormData(prev => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error("Erreur de chargement", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      // Afficher une preview du logo
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    
    const logoFormData = new FormData();
    logoFormData.append('logo', logoFile);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/agency/upload-logo`, 
        logoFormData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setFormData({ ...formData, logo: res.data.data.logo });
      setLogoFile(null);
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement du logo.' });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    // Uploader le logo si changé
    if (logoFile) {
      const logoSuccess = await uploadLogo();
      if (!logoSuccess) {
        setSaving(false);
        return;
      }
    }
    
    try {
      await axios.put(`${API_BASE_URL}/agency/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recharger les données depuis le serveur pour s'assurer que tout est à jour
      const res = await axios.get('http://localhost:5000/api/agency/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) setFormData(prev => ({ ...prev, ...res.data }));
      
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', m: 'auto', mt: 5 }} />;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#1A237E' }}>
        Gestion du Profil
      </Typography>

      {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Section Logo */}
            <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar 
                  src={buildImageUrl(formData.logo)} 
                  sx={{ width: 120, height: 120, mb: 1, border: '3px solid #3F51B5', boxShadow: 2 }} 
                />
                <IconButton 
                  color="primary" 
                  component="label" 
                  sx={{ position: 'absolute', bottom: 10, right: -5, bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  <input 
                    id="logo-upload"
                    hidden 
                    accept="image/*" 
                    type="file"
                    onChange={handleLogoChange}
                  />
                  <PhotoCamera />
                </IconButton>
              </Box>
              <Typography variant="body2" color="textSecondary">Logo officiel de l'agence</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Nom de l'agence" name="agencyName" value={formData.agencyName} onChange={handleChange} required variant="outlined" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="N° de Carte Professionnelle" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required variant="outlined" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Adresse Siège Social" name="address" value={formData.address} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField fullWidth label="Téléphone" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField fullWidth label="Site Web" name="website" value={formData.website} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField fullWidth multiline rows={4} label="Description & Spécialités" name="description" value={formData.description} onChange={handleChange} variant="outlined" />
            </Grid>

            <Grid sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large" 
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={saving}
                  sx={{ borderRadius: 2, px: 6, py: 1.5, bgcolor: '#3F51B5', fontWeight: 'bold' }}
                >
                  {saving ? "Enregistrement..." : "Sauvegarder le profil"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AgencyProfilePage;