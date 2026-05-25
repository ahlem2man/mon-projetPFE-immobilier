import { Box, Typography, Paper, Grid, Card, CardContent, Icon } from '@mui/material';
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Favorite, AssignmentTurnedIn, Description, Settings, Home, TrendingUp } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function DashboardHomePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    favorites: 0,
    searches: 0,
    documents: 0,
    applications: 0
  });

  // Extraire le prénom et nom
  const getUserName = () => {
    if (!user) return 'Utilisateur';
    if (user.name) {
      const parts = user.name.split(' ');
      return parts[0]; // Retourne le prénom
    }
    return 'Utilisateur';
  };

  const getFullName = () => {
    if (!user) return '';
    return user.name || '';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch favorites
        const favRes = await axios.get(`${API_BASE_URL}/tenants/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch applications (NOTE: /requests avec 's', pas /request)
        const appRes = await axios.get(`${API_BASE_URL}/requests/my-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats({
          favorites: favRes.data?.length || 0,
          applications: appRes.data?.length || 0,
          documents: 0,
          searches: 0
        });
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        // Valeurs par défaut si erreur
        setStats({
          favorites: 0,
          applications: 0,
          documents: 0,
          searches: 0
        });
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      icon: <Favorite sx={{ color: '#FF6B6B', fontSize: 28 }} />,
      label: 'Favoris',
      value: stats.favorites,
      color: '#ffe0e0'
    },
    {
      icon: <AssignmentTurnedIn sx={{ color: '#4ECDC4', fontSize: 28 }} />,
      label: 'Candidatures',
      value: stats.applications,
      color: '#e0f7f6'
    },
    {
      icon: <Description sx={{ color: '#FFD93D', fontSize: 28 }} />,
      label: 'Documents',
      value: stats.documents,
      color: '#fff8e0'
    },
    {
      icon: <Settings sx={{ color: '#A8E6CF', fontSize: 28 }} />,
      label: 'Préférences',
      value: '✓',
      color: '#e0f5f3'
    }
  ];

  return (
    <Box sx={{ pb: 4 }}>
      {/* SECTION BIENVENUE */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Home sx={{ fontSize: 36, color: 'white' }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }
            }}
          >
            Bienvenue, {getUserName()}!
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 300,
            fontSize: { xs: '0.95rem', sm: '1.1rem' },
            opacity: 0.95,
            maxWidth: '600px'
          }}
        >
          {getFullName()} • Locataire HOMA
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            opacity: 0.9,
            maxWidth: '600px',
            fontSize: '0.95rem'
          }}
        >
          Trouvez le logement idéal avec nos recommandations personnalisées et un accompagnement sur mesure.
        </Typography>
      </Paper>

      {/* SECTION STATISTIQUES */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          mb: 2.5,
          color: '#0a1930',
          fontSize: '1.3rem'
        }}
      >
        Votre Espace
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid key={index} sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 1.25 }}>
            <Card
              sx={{
                background: stat.color,
                borderRadius: 2.5,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Box sx={{ mb: 1.5 }}>
                  {stat.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: '#0a1930',
                    mb: 0.5
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontWeight: 500,
                    fontSize: '0.9rem'
                  }}
                >
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SECTION D'ACTIONS RAPIDES */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          mb: 2.5,
          color: '#0a1930',
          fontSize: '1.3rem'
        }}
      >
        Actions Rapides
      </Typography>

      <Grid container spacing={2.5}>
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, px: 1.25 }}>
          <Card
            onClick={() => navigate('/dashboard/recommendations')}
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: 2.5,
              color: 'white',
              p: 3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(245, 87, 108, 0.3)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Home sx={{ fontSize: 24, color: 'white' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Découvrir des Logements
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              Consultez nos recommandations personnalisées basées sur vos préférences.
            </Typography>
          </Card>
        </Grid>

        <Grid sx={{ width: { xs: '100%', sm: '50%' }, px: 1.25 }}>
          <Card
            onClick={() => navigate('/dashboard/preferences')}
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: 2.5,
              color: 'white',
              p: 3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(79, 172, 254, 0.3)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Settings sx={{ fontSize: 24, color: 'white' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Mettre à Jour Mes Préférences
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              Affinez vos critères de recherche pour de meilleures recommandations.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* SECTION D'INFOS */}
      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f7fa', borderRadius: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TrendingUp sx={{ fontSize: 24, color: '#667eea' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0a1930' }}>
            Besoin d'aide?
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.8 }}>
          Consultez notre <strong>FAQ</strong> pour répondre à vos questions ou contactez notre équipe support disponible 24/7.
        </Typography>
      </Box>
    </Box>
  );
}
