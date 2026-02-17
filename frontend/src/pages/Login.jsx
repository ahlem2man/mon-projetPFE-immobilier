import React, { useState, useContext } from 'react';
import { 
  Container, Paper, TextField, Button, Typography, 
  Box, Alert, CircularProgress 
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  
  const successMsg = location.state?.successMessage;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
      setLoading(false);
      navigate('/'); 
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Identifiants invalides');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Connexion
        </Typography>
        
        {/* Affichage du message de SUCCÈS (Vert) après reset mdp */}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {/* Affichage du message d'ERREUR (Rouge) */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Adresse Email"
            name="email"
            type="email"
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Mot de passe"
            name="password"
            type="password"
            margin="normal"
            onChange={handleChange}
            required
          />

          {/* Lien Mot de passe oublié ajouté ici pour la visibilité */}
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}>
              Mot de passe oublié ?
            </Link>
          </Box>
          
          <Button
            fullWidth
            variant="contained"
            type="submit"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Pas encore de compte ? <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>Inscrivez-vous ici</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;