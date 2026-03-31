import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Avatar, 
  Rating, Divider, Chip, CircularProgress, Alert 
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const AgencyReviews = () => {
  const { user } = useContext(AuthContext);
  const [agencyData, setAgencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/agency/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAgencyData(res.data);
      } catch (err) {
        console.error("Erreur récupération agence", err);
        setError("Impossible de charger les avis.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAgencyData();
  }, [user]);

  // Données simulées pour les avis (en production, ce serait depuis la BD)
  const mockReviews = [
    {
      id: 1,
      author: 'Jean Dupont',
      rating: 5,
      date: '2 mars 2026',
      comment: 'Excellente agence ! Très réactifs et professionnels. Je recommande vivement.',
      verified: true,
      helpful: 12
    },
    {
      id: 2,
      author: 'Marie Leblanc',
      rating: 4,
      date: '28 février 2026',
      comment: 'Bonne expérience dans l\'ensemble. Un petit bémol sur la communication.',
      verified: true,
      helpful: 5
    },
    {
      id: 3,
      author: 'Pierre Martin',
      rating: 5,
      date: '25 février 2026',
      comment: 'Très rapides pour trouver mon logement parfait. Équipe super compétente !',
      verified: true,
      helpful: 8
    },
    {
      id: 4,
      author: 'Sophie Rousseau',
      rating: 4,
      date: '20 février 2026',
      comment: 'Service correct mais les frais sont un peu élevés.',
      verified: false,
      helpful: 3
    }
  ];

  if (loading) return <CircularProgress sx={{ display: 'block', m: 'auto', mt: 5 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const avgRating = agencyData?.rating || 4.5;
  const totalReviews = mockReviews.length;
  const totalPositive = mockReviews.filter(r => r.rating >= 4).length;
  const totalNegative = mockReviews.filter(r => r.rating < 4).length;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1A237E' }}>
        ⭐ Notes et Avis des Clients
      </Typography>

      {/* SECTION RÉSUMÉ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CARTE RATING GLOBAL */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: 'linear-gradient(135deg, #FFB300 0%, #FF9800 100%)', color: 'white' }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {avgRating.toFixed(1)}
            </Typography>
            <Rating value={avgRating} readOnly precision={0.5} sx={{ justifyContent: 'center', fontSize: '2rem', mb: 1 }} />
            <Typography variant="body2">
              Basé sur {totalReviews} avis
            </Typography>
          </Paper>
        </Grid>

        {/* STATISTIQUES */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Répartition des avis
            </Typography>
            
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = mockReviews.filter(r => r.rating === stars).length;
              const percentage = (count / totalReviews) * 100;
              return (
                <Box key={stars} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 80 }}>
                    {[...Array(stars)].map((_, i) => (
                      <Typography key={i} sx={{ color: '#FFB300', fontSize: '1.2rem' }}>⭐</Typography>
                    ))}
                    <Typography variant="body2" sx={{ ml: 1, minWidth: 30 }}>{stars}★</Typography>
                  </Box>
                  <Box sx={{ flex: 1, height: 8, bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden', mx: 2 }}>
                    <Box sx={{ height: '100%', bgcolor: '#FFB300', width: `${percentage}%` }} />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* SECTION AVIS DÉTAILLÉS */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Tous les avis ({totalReviews})
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockReviews.map((review) => (
          <Card key={review.id} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              {/* HEADER */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#3F51B5', width: 48, height: 48 }}>
                    {review.author.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {review.author}
                      {review.verified && (
                        <Chip 
                          label="Acheteur vérifié" 
                          size="small" 
                          sx={{ ml: 1, height: 20, bgcolor: '#4CAF50', color: 'white' }} 
                        />
                      )}
                    </Typography>
                    <Rating value={review.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                    <Typography variant="caption" color="textSecondary">
                      {review.date}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* CONTENU */}
              <Typography variant="body2" sx={{ mb: 2, color: '#333' }}>
                {review.comment}
              </Typography>

              {/* FOOTER */}
              <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', gap: 0.5, cursor: 'pointer', color: '#999', '&:hover': { color: '#3F51B5' } }}>
                  <ThumbUpIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption">{review.helpful}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, cursor: 'pointer', color: '#999', '&:hover': { color: '#d32f2f' } }}>
                  <ThumbDownIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption">Signaler</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* CTA CHARGER PLUS */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Vous avez vu tous les avis disponibles
        </Typography>
      </Box>
    </Box>
  );
};

export default AgencyReviews;
