import { Container, Box, Typography, Grid, Card, CardContent } from '@mui/material';

export default function About() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
          À propos de HOMA
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 4 }}>
          Votre agence spécialisée dans l'organisation du parcours locatif
        </Typography>
      </Box>

      {/* Mission Section */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
          Notre Mission
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontSize: '16px', maxWidth: '800px', mx: 'auto' }}>
          Nous sommes HOMA. Votre agence spécialisée dans l'organisation du parcours locatif en France. 
          Notre mission est simple : Faire le match parfait entre vous et votre propriétaire.
        </Typography>
      </Box>

      {/* Services Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, color: '#333', textAlign: 'center' }}>
          Les Services HOMA
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', mb: 4 }}>
          Nous trouvons votre logement idéal, à vous de choisir le pack adapté.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ h: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0099cc' }}>
                  Pack Essentiel
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Pour les clients autonomes qui veulent un bon coup de pouce
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ h: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0099cc' }}>
                  Pack Confort
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  La relocation clé en main : vous arrivez, tout est prêt
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ h: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0099cc' }}>
                  Pack Premium
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Votre logement clé en main avec accompagnement personnalisé
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Why Choose Us */}
      <Box sx={{ mb: 8, bgcolor: '#f9f9f9', p: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
          Pourquoi choisir HOMA ?
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
              ✓ Nous défendons votre dossier auprès des agences et propriétaires en les contactant directement pour maximiser vos chances
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
              ✓ Un suivi sur mesure, jusqu'à l'emménagement
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
              ✓ Logements issus de notre réseau de partenaires
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
              ✓ Accompagnement renforcé et personnalisé
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}