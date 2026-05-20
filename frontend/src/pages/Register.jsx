import React, { useState } from 'react';
import { 
  Container, Paper, TextField, Button, Typography, 
  MenuItem, Box, Alert, CircularProgress, Grid 
} from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant' // Rôle par défaut
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      
      await axios.post(`${API_BASE_URL}/auth/register`, formData);
      setLoading(false);
     
      navigate('/login'); 
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Erreur lors de l’inscription');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          Créer un compte
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Nom complet" name="name"
                variant="outlined" onChange={handleChange} required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Email" name="email" type="email"
                variant="outlined" onChange={handleChange} required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Mot de passe" name="password" type="password"
                variant="outlined" onChange={handleChange} required
              />
            </Grid>
            <Grid item xs={12}>
              {/* Sélection du rôle : Spécificité de ton Sprint 2 */}
              <TextField
                fullWidth select label="Type de compte" name="role"
                value={formData.role} variant="outlined" onChange={handleChange}
              >
                <MenuItem value="tenant">Locataire</MenuItem>
                <MenuItem value="agency">Agence Immobilière</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Button
            fullWidth variant="contained" type="submit" size="large"
            disabled={loading} sx={{ mt: 4, mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "S'inscrire"}
          </Button>

          <Typography variant="body2" align="center">
            Déjà inscrit ? <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>Connectez-vous</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;