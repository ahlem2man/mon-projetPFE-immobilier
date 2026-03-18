import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, CircularProgress, Tabs, Tab, Button, Stack, Collapse, LinearProgress,
  IconButton, Tooltip
} from '@mui/material';
import { getMatchingHistory } from '../services/matchingService';
import RestoreIcon from '@mui/icons-material/Restore';
import EmptyStateIcon from '@mui/icons-material/InboxOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EuroIcon from '@mui/icons-material/Euro';
import HomeIcon from '@mui/icons-material/Home';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

const MatchingHistory = ({ token }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filterStatus, setFilterStatus] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getMatchingHistory(token);
        setHistory(res.data);
        setStats(res.stats);
      } catch (err) {
        console.error("Erreur historique:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [token]);

  const getFeedbackColor = (feedback) => {
    switch (feedback) {
      case 'useful':
        return 'success';
      case 'not_useful':
        return 'error';
      default:
        return 'default';
    }
  };

  const getFeedbackLabel = (feedback) => {
    switch (feedback) {
      case 'useful':
        return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ThumbUpIcon sx={{fontSize: '1rem'}}/> Utile</Box>;
      case 'not_useful':
        return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ThumbDownIcon sx={{fontSize: '1rem'}}/> Pas utile</Box>;
      default:
        return 'En attente';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'archived':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckCircleIcon sx={{fontSize: '1rem'}}/> Actif</Box>;
      case 'archived':
        return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ArchiveIcon sx={{fontSize: '1rem'}}/> Archivé</Box>;
      case 'rejected':
        return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ErrorIcon sx={{fontSize: '1rem'}}/> Rejeté</Box>;
      default:
        return status;
    }
  };

  // Composant pour afficher l'analyse détaillée du score
  const ScoreBreakdown = ({ details, score }) => {
    const maxPoints = 100;
    const breakdownItems = [
      { label: 'Localisation', icon: <LocationOnIcon />, value: details?.locationScore || 0, max: 35, color: '#2196F3' },
      { label: 'Prix', icon: <EuroIcon />, value: details?.priceScore || 0, max: 30, color: '#FF9800' },
      { label: 'Type de bien', icon: <HomeIcon />, value: details?.typeScore || 0, max: 20, color: '#9C27B0' },
      { label: 'Équipements', icon: <HomeWorkIcon />, value: details?.amenitiesScore || 0, max: 15, color: '#4CAF50' }
    ];

    return (
      <Box sx={{ 
        bgcolor: '#f9f9f9', 
        p: 2, 
        borderRadius: 2, 
        mt: 2,
        border: '1px solid #eee'
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Analyse Détaillée du Score ({score}%)
        </Typography>
        <Stack spacing={2}>
          {breakdownItems.map((item, idx) => (
            <Box key={idx}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>
                    {item.label}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: item.color }}>
                  {item.value}/{item.max}
                </Typography>
              </Box>
              <Box sx={{ position: 'relative', height: 6, bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={(item.value / item.max) * 100}
                  sx={{ 
                    height: '100%',
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: item.color,
                      borderRadius: 1
                    }
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>
        <Box sx={{ 
          mt: 2, 
          p: 1.5, 
          bgcolor: '#f0f4ff', 
          borderRadius: 1, 
          borderLeft: `4px solid #007b83`
        }}>
          <Typography variant="caption" sx={{ color: '#007b83', fontWeight: 'bold' }}>
           Conseil: Pour améliorer vos recommandations, complétez vos préférences et vérifiez vos critères.
          </Typography>
        </Box>
      </Box>
    );
  };

  const filteredHistory = history.filter((item) => {
    if (filterStatus === 0) return true; // All
    if (filterStatus === 1) return item.status === 'active'; // Active
    if (filterStatus === 2) return item.status === 'archived'; // Archived
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Statistics */}
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
      >
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, flex: 1, minWidth: '120px' }}>
          <Typography variant="body2" color="gray">Actifs</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.active || 0}</Typography>
        </Box>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, flex: 1, minWidth: '120px' }}>
          <Typography variant="body2" color="gray">Archivés</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.archived || 0}</Typography>
        </Box>
        <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, flex: 1, minWidth: '120px' }}>
          <Typography variant="body2" color="gray"> Utiles</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{stats.useful || 0}</Typography>
        </Box>
        <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, flex: 1, minWidth: '120px' }}>
          <Typography variant="body2" color="gray"> Pas utiles</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#c62828' }}>{stats.not_useful || 0}</Typography>
        </Box>
      </Stack>

      {/* Filter Tabs */}
      <Tabs 
        value={filterStatus} 
        onChange={(e, val) => setFilterStatus(val)}
        sx={{ mb: 2 }}
      >
        <Tab label={`Tous (${history.length})`} />
        <Tab label={`Actifs (${stats.active || 0})`} />
        <Tab label={`Archivés (${stats.archived || 0})`} />
      </Tabs>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <EmptyStateIcon sx={{ fontSize: 48, color: 'gray', mb: 1 }} />
          <Typography color="gray">Aucun matching trouvé</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ width: 48 }} />
                <TableCell sx={{ fontWeight: 'bold' }}>Bien</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Prix</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Feedback</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((item) => (
                <React.Fragment key={item._id}>
                  <TableRow hover>
                    <TableCell sx={{ p: 1 }}>
                      <Tooltip title={expandedRow === item._id ? "Masquer détails" : "Afficher détails"}>
                        <IconButton
                          size="small"
                          onClick={() => setExpandedRow(expandedRow === item._id ? null : item._id)}
                          sx={{
                            transform: expandedRow === item._id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: '500', fontSize: '14px' }}>
                        {item.propertyId?.title}
                      </Typography>
                      <Typography variant="caption" color="gray">
                        {item.propertyId?.location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${item.score}%`}
                        color={item.score > 70 ? 'success' : item.score > 40 ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: '500' }}>
                        {item.propertyId?.price}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(item.status)}
                        color={getStatusColor(item.status)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getFeedbackLabel(item.userFeedback)}
                        color={getFeedbackColor(item.userFeedback)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="gray">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} sx={{ p: 0 }}>
                      <Collapse in={expandedRow === item._id} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 3 }}>
                          <ScoreBreakdown details={item.details} score={item.score} />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MatchingHistory;
