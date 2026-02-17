import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Mot de passe oublié
        </Typography>
        
        <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          Entrez votre email pour recevoir un lien de réinitialisation.
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Votre adresse Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Envoyer le lien
          </Button>

          <Typography variant="body2" align="center">
            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Retour à la connexion
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;