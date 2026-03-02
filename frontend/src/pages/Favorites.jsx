import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Box } from '@mui/material';

const Favorites = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection automatique vers le dashboard favoris
    navigate('/dashboard/favorites', { replace: true });
  }, [navigate]);

  return (
    <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    </Container>
  );
};

export default Favorites;