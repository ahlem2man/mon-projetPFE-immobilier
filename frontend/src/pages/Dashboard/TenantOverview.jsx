import { Box, Typography, Grid } from '@mui/material';
import RecommendedSection from '../components/RecommendedSection'; // Le composant créé précédemment

export default function TenantOverview() {
  const token = localStorage.getItem('token');

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#0a1930' }}>
        Tableau de bord
      </Typography>
      <Typography variant="body1" sx={{ color: 'gray', mb: 4 }}>
        Retrouvez ici les meilleures offres sélectionnées par notre algorithme.
      </Typography>

      {/* --- C'EST ICI QUE LE SPRINT 6 APPARAÎT --- */}
      <RecommendedSection token={token} />
    </Box>
  );
}