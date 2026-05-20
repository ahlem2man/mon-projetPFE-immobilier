import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Stack } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password/${token}`, { password });
      
      navigate('/login', { state: { successMessage: res.data.message } });
    } catch (err) {
      setError(err.response?.data?.message || "Lien invalide ou expiré");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ fontWeight: 700 }}>
            Nouveau mot de passe
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Choisissez un mot de passe fort pour sécuriser votre compte.
          </Typography>
        </Stack>

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
          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            error={confirmPassword.length > 0 && !passwordsMatch}
            helperText={confirmPassword.length > 0 && !passwordsMatch ? 'Les mots de passe sont différents' : 'Au moins 8 caractères recommandés'}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={saving || !passwordsMatch}
          >
            {saving ? 'Validation...' : 'Valider le changement'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;