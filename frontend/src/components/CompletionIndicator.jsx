import React from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Stack, 
  Paper, 
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * Composant réutilisable pour afficher l'indicateur de complétude du profil
 * @param {Number} completionPercentage - Pourcentage de complétude (0-100)
 * @param {Object} missingFields - Objet avec les champs manquants (optionnel pour le détail)
 * @param {Boolean} showDetails - Afficher le détail des champs manquants (default: false)
 * @param {Function} onDetailClick - Callback quand on clique sur un champ manquant
 */
export default function CompletionIndicator({ 
  completionPercentage = 0, 
  missingFields = {},
  showDetails = false,
  onDetailClick = null
}) {
  const [expanded, setExpanded] = useState(showDetails);

  // Couleur dynamique selon le pourcentage
  const getStatusColor = () => {
    if (completionPercentage >= 75) return '#00adef'; // Bleu
    if (completionPercentage >= 50) return '#ffa500'; // Orange
    return '#ff6b6b'; // Rouge
  };

  const getStatusLabel = () => {
    if (completionPercentage === 100) return '✓ Profil complet !';
    if (completionPercentage >= 75) return 'Profil complet à 75%';
    if (completionPercentage >= 50) return 'Profil complet à 50%';
    return 'Profil incomplet';
  };

  const missingFieldsList = [
    { key: 'profession', label: 'Profession', section: 'Infos pro' },
    { key: 'employmentType', label: 'Type de contrat', section: 'Infos pro' },
    { key: 'income', label: 'Revenus mensuels', section: 'Infos pro' },
    { key: 'employer', label: 'Employeur/École', section: 'Infos pro' },
    { key: 'location', label: 'Localisation souhaitée', section: 'Préférences' },
    { key: 'budgetMax', label: 'Budget maximum', section: 'Préférences' },
    { key: 'propertyType', label: 'Type de bien', section: 'Préférences' },
    { key: 'moveInDate', label: 'Date d\'emménagement', section: 'Préférences' },
    { key: 'professionalStatus', label: 'Situation professionnelle', section: 'Documents' },
    { key: 'identityCard', label: 'Pièce d\'identité', section: 'Documents' },
    { key: 'income_proof', label: 'Justificatif de revenus', section: 'Documents' },
    { key: 'accommodation_proof', label: 'Justificatif de logement', section: 'Documents' },
    { key: 'utilityBill', label: 'Justificatif de domicile', section: 'Documents' },
  ];

  const missing = missingFieldsList.filter(field => missingFields[field.key]);

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        background: `linear-gradient(135deg, ${getStatusColor()}15 0%, transparent 100%)`,
        border: `1px solid ${getStatusColor()}30`
      }}
    >
      {/* Entête avec pourcentage */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0a1930' }}>
            Complétude du profil
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}
          >
            {getStatusLabel()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography 
            variant="h5" 
            sx={{ color: getStatusColor(), fontWeight: 'bold' }}
          >
            {completionPercentage}%
          </Typography>
        </Box>
      </Stack>

      {/* Barre de progression */}
      <LinearProgress 
        variant="determinate" 
        value={completionPercentage} 
        sx={{ 
          height: 10, 
          borderRadius: 5, 
          bgcolor: '#e0e0e0',
          mb: 2,
          '& .MuiLinearProgress-bar': { 
            bgcolor: getStatusColor(),
            borderRadius: 5
          } 
        }} 
      />

      {/* Message motivant */}
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          color: 'text.secondary',
          mb: 2,
          fontStyle: 'italic'
        }}
      >
        {completionPercentage === 100 
          ? '🎉 Excellent ! Votre profil est maintenant visible par les agences.' 
          : '💡 Complétez votre profil pour augmenter vos chances de trouver un logement.'}
      </Typography>

      {/* Détails des champs manquants */}
      {missing.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Stack 
            direction="row" 
            alignItems="center"
            onClick={() => setExpanded(!expanded)}
            sx={{ cursor: 'pointer', mb: 1 }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            <Typography 
              variant="body2" 
              sx={{ fontWeight: 'bold', ml: 1, color: '#0a1930' }}
            >
              Champs à compléter ({missing.length})
            </Typography>
          </Stack>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List sx={{ pt: 0 }}>
              {missing.map((field) => (
                <ListItem 
                  key={field.key}
                  sx={{ 
                    pl: 4, 
                    py: 1,
                    cursor: onDetailClick ? 'pointer' : 'default',
                    '&:hover': onDetailClick ? { bgcolor: '#f5f5f5' } : {}
                  }}
                  onClick={() => onDetailClick && onDetailClick(field.key)}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CancelIcon sx={{ color: '#ff6b6b', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={field.label}
                    secondary={field.section}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      )}

      {/* Achèvement */}
      {completionPercentage === 100 && (
        <Stack direction="row" alignItems="center" sx={{ mt: 2, pt: 2, borderTop: `1px solid ${getStatusColor()}30` }}>
          <CheckCircleIcon sx={{ color: '#00adef', mr: 1 }} />
          <Typography variant="body2" sx={{ color: '#00adef', fontWeight: 'bold' }}>
            Bravo ! Vous pouvez maintenant postuler à des locations
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}
