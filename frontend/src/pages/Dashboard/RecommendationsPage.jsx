// src/pages/Dashboard/RecommendationsPage.jsx
import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Alert, CircularProgress, Tab, Tabs } from '@mui/material';
import RecommendedSection from '../../components/RecommendedSection';
import MatchingHistory from '../../components/MatchingHistory';
import { generateMatchings } from '../../services/matchingService';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const RecommendationsPage = () => {
  const token = localStorage.getItem('token');
  const [tabValue, setTabValue] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const handleGenerateMatchings = async () => {
    setGenerating(true);
    try {
      const result = await generateMatchings(token);
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 3000);
      // Refresh the component after generation
      window.location.reload();
    } catch (err) {
      console.error("Erreur génération:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <HomeIcon sx={{ fontSize: '2rem', color: '#007b83' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0a1930' }}>
              Mes Recommandations
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'gray' }}>
            Voici les biens qui correspondent le mieux à votre profil et vos préférences.
          </Typography>
        </Box>

        <Button
          variant="contained"
          endIcon={<RefreshIcon />}
          onClick={handleGenerateMatchings}
          disabled={generating}
          sx={{ bgcolor: '#007b83', whiteSpace: 'nowrap' }}
        >
          {generating ? <CircularProgress size={20} sx={{ mr: 1 }} /> : 'Générer'}
        </Button>
      </Box>

      {generationSuccess && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon />
          <span>Matchings générés avec succès! Les nouveaux biens recommandés s'affichent ci-dessous.</span>
        </Alert>
      )}

      {/* Tabs pour Recommandations et Historique */}
      <Tabs 
        value={tabValue} 
        onChange={(e, val) => setTabValue(val)}
        sx={{ mb: 2, borderBottom: '1px solid #eee' }}
      >
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LocationOnIcon /> Recommandations Actuelles</Box>} />
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><HistoryIcon /> Historique</Box>} />
      </Tabs>

      {/* Contenu des tabs */}
      {tabValue === 0 && <RecommendedSection token={token} />}
      {tabValue === 1 && <MatchingHistory token={token} />}
    </Box>
  );
};

export default RecommendationsPage;