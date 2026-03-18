import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserMatchings, submitMatchingFeedback, archiveMatching } from '../services/matchingService';
import { 
  Box, Typography, Grid, Card, CardContent, CardActions, 
  Button, Chip, Divider, CircularProgress, Stack, Collapse, LinearProgress,
  IconButton, Tooltip, Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EuroIcon from '@mui/icons-material/Euro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const RecommendedSection = ({ token }) => {
  const navigate = useNavigate();
  const [matchings, setMatchings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmingFeedback, setConfirmingFeedback] = useState({}); // État temporaire de confirmation

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getUserMatchings(token);
        setMatchings(res.data);
      } catch (err) {
        console.error("Erreur", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFeedback = async (matchingId, newFeedback) => {
    try {
      // Déterminer le feedback actuel du matching
      const currentMatching = matchings.find(m => m._id === matchingId);
      const currentFeedback = currentMatching?.userFeedback;
      
      // Si on clique sur le même feedback, on toggle (le supprime)
      const feedbackToSend = currentFeedback === newFeedback ? null : newFeedback;
      
      // Mettre à jour l'UI immédiatement (optimistic update)
      setMatchings(matchings.map(m => 
        m._id === matchingId ? { ...m, userFeedback: feedbackToSend } : m
      ));
      
      // Afficher un feedback de confirmation pendant 1s
      setConfirmingFeedback({ ...confirmingFeedback, [matchingId]: true });
      setTimeout(() => {
        setConfirmingFeedback(prev => {
          const updated = { ...prev };
          delete updated[matchingId];
          return updated;
        });
      }, 1000);
      
      // Envoyer au backend
      await submitMatchingFeedback(token, matchingId, feedbackToSend);
    } catch (err) {
      console.error("Erreur feedback:", err);
      // Revenir à l'état précédent en cas d'erreur
      window.location.reload();
    }
  };

  const handleArchive = async (matchingId) => {
    try {
      await archiveMatching(token, matchingId);
      setMatchings(matchings.filter(m => m._id !== matchingId));
    } catch (err) {
      console.error("Erreur archivage:", err);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  if (matchings.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Aucune recommandation disponible. Complétez vos préférences pour obtenir des matchings!
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, mt: 2 }}>
      <Typography variant="body2" sx={{ mb: 2, color: 'gray' }}>
        {matchings.length} propriété{matchings.length > 1 ? 's' : ''} trouvée{matchings.length > 1 ? 's' : ''} selon vos critères
      </Typography>

      <Grid container spacing={3}>
        {matchings.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item._id}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }
            }}>
              {/* Header with score */}
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                bgcolor: '#fcfcfc',
                borderBottom: '1px solid #eee'
              }}>
                <Chip 
                  label={`${item.score}% Adéquation`} 
                  color={item.score > 70 ? "success" : item.score > 40 ? "warning" : "default"}
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '12px', color: 'gray' }}>
                  {item.score > 80 ? (
                    <>
                      <StarIcon sx={{ fontSize: '16px', color: '#FFD700' }} />
                      <span>Excellent match</span>
                    </>
                  ) : item.score > 60 ? (
                    <>
                      <CheckCircleIcon sx={{ fontSize: '16px', color: '#2196F3' }} />
                      <span>Bon match</span>
                    </>
                  ) : (
                    <>
                      <FavoriteBorderIcon sx={{ fontSize: '16px', color: '#FF9800' }} />
                      <span>À considérer</span>
                    </>
                  )}
                </Box>
              </Box>

              <CardContent>
                {/* Property Info */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#0a1930' }}>
                  {item.propertyId?.title}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    icon={<LocationOnIcon />}
                    label={item.propertyId?.location} 
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={`${item.propertyId?.price}€/mois`} 
                    sx={{ fontWeight: 'bold', bgcolor: '#e8f5e9', color: '#2e7d32' }}
                    size="small"
                  />
                  <Chip 
                    label={item.propertyId?.type}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                {/* Show amenities if available */}
                {item.propertyId?.amenities && item.propertyId.amenities.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
                      Équipements: 
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                      {item.propertyId.amenities.slice(0, 3).map((amenity, idx) => (
                        <Chip 
                          key={idx}
                          label={amenity}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '11px' }}
                        />
                      ))}
                      {item.propertyId.amenities.length > 3 && (
                        <Typography variant="caption" sx={{ alignSelf: 'center', color: 'gray' }}>
                          +{item.propertyId.amenities.length - 3}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* "Why this matching" Button */}
                <Button 
                  onClick={() => handleExpandClick(item._id)}
                  endIcon={<ExpandMoreIcon sx={{ transform: expandedId === item._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />}
                  fullWidth
                  sx={{ textTransform: 'none', fontWeight: 'bold', mb: 1 }}
                >
                  Pourquoi ce matching ?
                </Button>

                {/* Matching Details Section */}
                <Collapse in={expandedId === item._id} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f7f8', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AssignmentIcon sx={{ color: '#007b83', fontSize: '24px' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#007b83' }}>
                        Analyse détaillée du score
                      </Typography>
                    </Box>
                    
                    <ScoreDetail 
                      label="Budget & Prix" 
                      icon={<EuroIcon sx={{ fontSize: '18px', color: '#4caf50' }} />}
                      value={item.details?.priceScore} 
                      max={30} 
                      color="#4caf50"
                      explanation="Correspond à votre budget maximum"
                    />
                    <ScoreDetail 
                      label="Localisation" 
                      icon={<LocationOnIcon sx={{ fontSize: '18px', color: '#2196f3' }} />}
                      value={item.details?.locationScore} 
                      max={35} 
                      color="#2196f3"
                      explanation="Proximité avec votre ville préférée"
                    />
                    <ScoreDetail 
                      label="Type de bien" 
                      icon={<HomeIcon sx={{ fontSize: '18px', color: '#ff9800' }} />}
                      value={item.details?.typeScore} 
                      max={20} 
                      color="#ff9800"
                      explanation="Correspond à votre type de bien préféré"
                    />
                    <ScoreDetail 
                      label="Équipements" 
                      icon={<StarIcon sx={{ fontSize: '18px', color: '#9c27b0' }} />}
                      value={item.details?.amenitiesScore} 
                      max={15} 
                      color="#9c27b0"
                      explanation="Présence de vos équipements souhaités"
                    />
                    
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: 'gray' }}>
                      (*) Score calculé automatiquement selon vos préférences
                    </Typography>
                  </Box>
                </Collapse>
              </CardContent>

              {/* Actions Footer */}
              <CardActions sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, pt: 1 }}>
                <Tooltip title={item.userFeedback === 'useful' ? "Retirer le feedback" : "Utile"}>
                  <IconButton 
                    size="small"
                    color={item.userFeedback === 'useful' ? 'success' : 'default'}
                    onClick={() => handleFeedback(item._id, 'useful')}
                    sx={{
                      transition: 'all 0.2s ease',
                      transform: confirmingFeedback[item._id] && item.userFeedback === 'useful' ? 'scale(1.2)' : 'scale(1)',
                      opacity: confirmingFeedback[item._id] && item.userFeedback === 'useful' ? 1 : 0.7,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    {item.userFeedback === 'useful' ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={item.userFeedback === 'not_useful' ? "Retirer le feedback" : "Pas utile"}>
                  <IconButton 
                    size="small"
                    color={item.userFeedback === 'not_useful' ? 'error' : 'default'}
                    onClick={() => handleFeedback(item._id, 'not_useful')}
                    sx={{
                      transition: 'all 0.2s ease',
                      transform: confirmingFeedback[item._id] && item.userFeedback === 'not_useful' ? 'scale(1.2)' : 'scale(1)',
                      opacity: confirmingFeedback[item._id] && item.userFeedback === 'not_useful' ? 1 : 0.7,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    {item.userFeedback === 'not_useful' ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOutlinedIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Archiver">
                  <IconButton 
                    size="small"
                    onClick={() => handleArchive(item._id)}
                  >
                    <ArchiveOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => navigate(`/property/${item.propertyId._id}`)}
                  sx={{ ml: 'auto', bgcolor: '#007b83' }}
                >
                  Voir le bien
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

/**
 * Composant réutilisable pour afficher une ligne de score avec barre
 */
const ScoreDetail = ({ label, icon, value, max, color, explanation }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: color }}>
        {value} / {max}
      </Typography>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={(value / max) * 100} 
      sx={{ 
        height: 8, 
        borderRadius: 5, 
        bgcolor: '#e0e0e0', 
        '& .MuiLinearProgress-bar': { bgcolor: color } 
      }} 
    />
    {explanation && (
      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'gray', fontStyle: 'italic' }}>
        {explanation}
      </Typography>
    )}
  </Box>
);

export default RecommendedSection;