import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      
      navigate('/login', { state: { successMessage: res.data.message } });
    } catch (err) {
      setError(err.response?.data?.message || "Lien invalide ou expiré");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Nouveau mot de passe
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Valider le changement
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;