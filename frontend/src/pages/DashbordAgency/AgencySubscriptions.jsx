import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Button, 
  Chip, Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Snackbar
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';

const AgencySubscriptions = () => {
  const [currentPlan, setCurrentPlan] = useState('standard');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      description: 'Parfait pour débuter',
      color: '#E0E0E0',
      features: [
        '5 annonces maximum',
        'Support email basique',
        'Tableau de bord simple',
        'Statistiques basiques'
      ],
      cta: 'En souscription',
      isCurrent: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '29€',
      period: '/mois',
      description: 'La formule populaire',
      color: '#3F51B5',
      features: [
        '50 annonces maximum',
        'Support prioritaire',
        'Tableau de bord complet',
        'Statistiques avancées',
        'Photos illimitées',
        'Boost annonces'
      ],
      cta: 'En souscription',
      isCurrent: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '99€',
      period: '/mois',
      description: 'Solutions professionnelles',
      color: '#FFB300',
      features: [
        'Annonces illimitées',
        'Support 24/7 dédié',
        'API intégrée',
        'Analytics avancées',
        'Photos & vidéos illimitées',
        'Boost prioritaire',
        'Co-branding'
      ],
      cta: 'Upgrader',
      isCurrent: false
    }
  ];

  // Historique de facturation
  const billingHistory = [
    { id: 1, date: '15 mars 2026', plan: 'Standard', amount: '29€', status: 'Payé', invoice: '#INV-2026-001' },
    { id: 2, date: '15 février 2026', plan: 'Standard', amount: '29€', status: 'Payé', invoice: '#INV-2026-002' },
    { id: 3, date: '15 janvier 2026', plan: 'Free', amount: '0€', status: 'Gratuit', invoice: '#INV-2026-003' }
  ];

  // Handlers
  const handleOpenDialog = (plan) => {
    setSelectedPlan(plan);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlan(null);
  };

  const handleConfirmPlanChange = () => {
    if (selectedPlan && selectedPlan.id !== 'free') {
      // Simuler redirection Stripe
      setSnackbar({ 
        open: true, 
        message: `Redirection vers Stripe pour ${selectedPlan.name}...` 
      });
      // En production: window.location.href = `${process.env.REACT_APP_API_URL}/api/payment/checkout`;
    } else {
      setCurrentPlan(selectedPlan.id);
      setSnackbar({ 
        open: true, 
        message: `Plan changé vers ${selectedPlan.name}` 
      });
    }
    handleCloseDialog();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#1A237E' }}>
     Nos Formules d'Abonnement
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Choisissez le plan qui correspond à vos besoins et développez votre activité.
      </Typography>

      {/* ALERTE PLAN ACTUEL */}
      <Alert severity="info" sx={{ mb: 4 }}>
        Plan actuel : <strong>Standard</strong> - Prochain renouvellement le 15 Avril 2026
      </Alert>

      {/* GRILLE DES PLANS */}
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: plan.isCurrent ? '0 8px 24px rgba(63, 81, 181, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)',
                border: plan.isCurrent ? '2px solid #3F51B5' : 'none',
                transition: 'all 0.3s',
                position: 'relative',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              {/* BADGE PLAN ACTUEL */}
              {plan.isCurrent && (
                <Chip 
                  icon={<StarIcon />}
                  label="PLAN ACTUEL" 
                  color="primary" 
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
              )}

              <CardContent sx={{ p: 3 }}>
                {/* EN-TÊTE */}
                <Box sx={{ mb: 3, borderBottom: `3px solid ${plan.color}`, pb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {plan.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: plan.color }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                      {plan.period}
                    </Typography>
                  </Box>
                </Box>

                {/* FEATURES LIST */}
                <Box sx={{ mb: 3 }}>
                  {plan.features.map((feature, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <CheckIcon sx={{ color: plan.color, mr: 2, fontSize: 20 }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* CTA BUTTON */}
                <Button 
                  fullWidth 
                  variant={plan.isCurrent ? "outlined" : "contained"}
                  onClick={() => handleOpenDialog(plan)}
                  sx={{ 
                    bgcolor: plan.isCurrent ? 'transparent' : plan.color,
                    color: plan.isCurrent ? plan.color : 'white',
                    border: plan.isCurrent ? `2px solid ${plan.color}` : 'none',
                    fontWeight: 'bold',
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: plan.isCurrent ? `${plan.color}15` : plan.color,
                    }
                  }}
                  disabled={plan.isCurrent}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SECTION FACTURATION */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 3, bgcolor: '#f9f9f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CreditCardIcon sx={{ mr: 1.5, color: '#3F51B5', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Historique de facturation
          </Typography>
        </Box>

        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#E8EAF6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#3F51B5' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#3F51B5' }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#3F51B5' }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#3F51B5' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#3F51B5' }}>Facture</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingHistory.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{row.plan}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={row.status === 'Payé' ? <CheckCircleIcon /> : undefined}
                      label={row.status} 
                      color={row.status === 'Payé' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="text" size="small" sx={{ color: '#3F51B5' }}>
                      {row.invoice}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<CreditCardIcon />}>
            Télécharger PDF
          </Button>
          <Button variant="outlined">
            Ajouter une carte bancaire
          </Button>
        </Box>
      </Paper>

      {/* SECTION FAQ */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
           Questions fréquentes
        </Typography>
        <Paper sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Comment puis-je changer de plan ?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
          </Typography>
        </Paper>
        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Puis-je annuler mon abonnement ?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Oui, vous pouvez annuler à tout moment. Votre accès sera conservé jusqu'à la fin de votre période de facturation.
          </Typography>
        </Paper>
      </Box>

      {/* DIALOG CHANGEMENT DE PLAN */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#F5F7FA', color: '#1A237E' }}>
          Confirmer le changement de plan
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedPlan && (
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Vous allez changer vers le plan <strong>{selectedPlan.name}</strong>
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#F5F7FA', borderLeft: `4px solid ${selectedPlan.color}`, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Prix mensuel:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: selectedPlan.color }}>
                    {selectedPlan.price}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Le changement prendra effet immédiatement. Vous serez facturisé au prorata.
                </Typography>
              </Paper>
              {selectedPlan.id !== 'free' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Vous serez redirigé vers Stripe pour sécuriser votre paiement.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F5F7FA' }}>
          <Button onClick={handleCloseDialog} startIcon={<CloseIcon />}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmPlanChange} 
            variant="contained" 
            sx={{ bgcolor: selectedPlan?.color || '#3F51B5' }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATION */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default AgencySubscriptions;
