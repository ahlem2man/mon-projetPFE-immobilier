import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Grid, Typography, Box, Stack, Button, Card, CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import TimelineIcon from '@mui/icons-material/Timeline';
import HomeIcon from '@mui/icons-material/Home';

const Home = () => {
  return (
    <Box>
      {/* HERO SECTION */}
      <Box 
        sx={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=600&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          py: { xs: 10, md: 16 },
          textAlign: 'center',
          mb: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.5) 100%)', zIndex: 0 }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              lineHeight: 1.2,
              mb: 2,
              color: '#ffffff',
              letterSpacing: '-1px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            Le logement que vous voulez, sans les démarches que vous redoutez.
          </Typography>
          <Typography 
            variant="h6" 
            sx={{
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 400,
              mb: 4,
              color: '#ffffff',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            Trouvez le logement idéal avec nos services personnalisés et un accompagnement sur mesure.
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', mt: 4 }}>
            <Button
              component={Link}
              to="/register"
              size="large"
              sx={{
                background: '#ffffff',
                color: '#0a1930',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: 3,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                border: '2px solid #ffffff',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                }
              }}
            >
              Créer un compte
            </Button>
            <Button
              component={Link}
              to="/properties"
              size="large"
              sx={{
                background: '#ffffff',
                color: '#00bcd4',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: 3,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                border: 'none',
                '&:hover': {
                  background: '#f5f5f5',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              Voir nos biens
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* SECTION - NOS SERVICES */}
      <Container maxWidth="lg" sx={{ mb: 12, mt: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{
              mb: 3,
              color: '#0a1930',
              letterSpacing: '-1px',
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Nos Services
          </Typography>
          <Typography 
            variant="h6" 
            sx={{
              color: '#666',
              fontWeight: 400,
              maxWidth: 750,
              mx: 'auto',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              lineHeight: 1.6,
            }}
          >
            Nous mettons à votre disposition des outils et services pour faciliter votre recherche de logement et accélérer vos démarches.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {/* SERVICE 1 */}
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(0, 188, 212, 0.15)',
                  borderColor: '#00BCD4',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <SearchIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#00BCD4',
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#0a1930' }}>
                  Recherche Intelligente
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.7 }}>
                  Filtrez et explorez les propriétés selon vos critères spécifiques pour trouver le logement qui vous correspond.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* SERVICE 2 */}
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(0, 188, 212, 0.15)',
                  borderColor: '#00BCD4',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <TimelineIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#00BCD4',
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#0a1930' }}>
                  Suivi Simplifié
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.7 }}>
                  Suivez l'évolution de vos candidatures et restez informé en temps réel des réponses des agences.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* SERVICE 3 */}
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(0, 188, 212, 0.15)',
                  borderColor: '#00BCD4',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <SecurityIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#00BCD4',
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#0a1930' }}>
                  Profil Sécurisé
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.7 }}>
                  Créez votre profil locataire avec vos documents et présentez-vous directement aux agences en toute confiance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* SERVICE 4 */}
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(0, 188, 212, 0.15)',
                  borderColor: '#00BCD4',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <HomeIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#00BCD4',
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#0a1930' }}>
                  Recommandations Personnalisées
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.7 }}>
                  Recevez des suggestions de propriétés adaptées à votre profil et vos préférences de recherche.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA SECTION */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
          py: 8,
          textAlign: 'center',
          color: 'white',
          mb: 0,
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            gutterBottom
            sx={{ mb: 3 }}
          >
            Prêt à trouver votre logement ?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              maxWidth: 600, 
              mx: 'auto',
              opacity: 0.95,
            }}
          >
            Explorez nos annonces et postulez dès maintenant pour trouver le logement de vos rêves.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/properties"
              size="large"
              variant="contained"
              sx={{
                background: '#ffffff',
                color: '#00BCD4',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: 3,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: '#f0f0f0',
                  transform: 'translateY(-3px)',
                }
              }}
            >
              Voir tous les biens
            </Button>
            <Button
              component={Link}
              to="/register"
              size="large"
              variant="outlined"
              sx={{
                borderColor: '#ffffff',
                color: '#ffffff',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: 3,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-3px)',
                }
              }}
            >
              Créer un compte
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;