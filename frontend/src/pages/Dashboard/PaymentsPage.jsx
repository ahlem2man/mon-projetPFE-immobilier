import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Chip, Box, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  FormControl, InputLabel, Select, Card, CardContent
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import API_BASE_URL from '../../config/api';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'Loyer',
    paymentMethod: 'Carte Bancaire',
    agencyId: '',
    propertyId: ''
  });
  const token = localStorage.getItem('token');

  // Récupérer les paiements
  useEffect(() => {
    fetchPayments();
    fetchAgencies();
  }, [token]);

  const fetchAgencies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tenants/agencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgencies(res.data.data || []);
    } catch (err) {
      console.error("Erreur chargement agences", err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/tenants/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data.data || []);
      setError(null);
    } catch (err) {{
      const updated = {
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) || '' : value
      };
      
      // Si on change l'agence, réinitialiser les propriétés
      if (name === 'agencyId') {
        updated.propertyId = '';
      }
      return updated;
    }setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Gérer le formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  // Soumettre le paiement
  const handlePayment = async () => {
    try {
      if (!formData.amount || formData.amount <= 0) {
        setError('Veuillez entrer un montant valide');
        return;
      }

      setProcessingPayment(true);
      
      // Étape 1 : Initier le paiement
      const initiateRes = await axios.post(
        `${API_BASE_URL}/tenants/payments/initiate`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paymentId = initiateRes.data.data._id;

      // Étape 2 : Simuler le traitement de la carte (normalement c'est Stripe/PayPal)
      // Ici on simule avec un délai puis on confirme automatiquement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Étape 3 : Confirmer le paiement
      await axios.patch(
        `${API_BASE_URL}/tenants/payments/${paymentId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(' Paiement complété avec succès !');
      setOpenDialog(false);
      setFormData({ amount: '', type: 'Abonnement', paymentMethod: 'Carte Bancaire' });
      setError(null);
      
      // Recharger les paiements
      setTimeout(() => {
        fetchPayments();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Erreur paiement", err);
      setError(err.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setProcessingPayment(false);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedCount = payments.filter(p => p.status === 'complété').length;
  const pendingCount = payments.filter(p => p.status === 'en attente').length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Mes Paiements
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Effectuer un Paiement
        </Button>
      </Box>

      {/* MESSAGES */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* CARTES DE RÉSUMÉ */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E3F2FD', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">Total Payé</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976D2', mt: 1 }}>
            {totalAmount.toFixed(2)} €
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#C8E6C9', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">Paiements Complétés</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#388E3C', mt: 1 }}>
            {completedCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF9C4', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">En Attente</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F57F17', mt: 1 }}>
            {pendingCount}
          </Typography>
        </Paper>
      </Box>

      {/* CHARGEMENT */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* TABLE */}
      {!loading && payments.length === 0 && (
        <Alert severity="info">Aucun paiement enregistré. Cliquez sur "Effectuer un Paiement" pour débuter.</Alert>
      )}

      {!loading && payments.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #eee' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8F9FA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Référence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p._id} hover sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{p.amount} €</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={p.status === 'complété' ? 'Complété' : 'En Attente'} 
                      size="small"
                      color={p.status === 'complété' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {p.reference}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* DIALOG PAIEMENT */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Effectuer un Paiement</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* AGENCE */}
          <FormControl fullWidth disabled={processingPayment} required>
            <InputLabel>Agence</InputLabel>
            <Select
              name="agencyId"
              value={formData.agencyId}
              onChange={handleFormChange}
              label="Agence"
            >
              <MenuItem value="">Sélectionner une agence</MenuItem>
              {agencies.map(agency => (
                <MenuItem key={agency._id} value={agency._id}>
                  {agency.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* MONTANT */}
          <TextField
            label="Montant (€)"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleFormChange}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
            disabled={processingPayment}
            required
          />

          {/* TYPE DE PAIEMENT */}
          <FormControl fullWidth disabled={processingPayment} required>
            <InputLabel>Type de Paiement</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              label="Type de Paiement"
            >
              <MenuItem value="Loyer">Loyer</MenuItem>
              <MenuItem value="Dépôt de Garantie">Dépôt de Garantie</MenuItem>
              <MenuItem value="Frais de Dossier">Frais de Dossier</MenuItem>
              <MenuItem value="Option Boost">Option Boost</MenuItem>
              <MenuItem value="Frais de vérification">Frais de vérification</MenuItem>
            </Select>
          </FormControl>

          {/* MÉTHODE DE PAIEMENT */}
          <FormControl fullWidth disabled={processingPayment}>
            <InputLabel>Méthode de Paiement</InputLabel>
            <Select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleFormChange}
              label="Méthode de Paiement"
            >
              <MenuItem value="Carte Bancaire">Carte Bancaire</MenuItem>
              <MenuItem value="PayPal">PayPal</MenuItem>
              <MenuItem value="Virement Bancaire">Virement Bancaire</MenuItem>
            </Select>
          </FormControl>

          {/* INFO PAIEMENT */}
          {formData.amount && formData.agencyId && (
            <Card sx={{ bgcolor: '#F5F5F5', border: '1px solid #ddd' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 'bold' }}>
                  📋 Résumé du paiement
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pb: 1, borderBottom: '1px solid #ddd' }}>
                    <Typography>Agence:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {agencies.find(a => a._id === formData.agencyId)?.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pb: 1, borderBottom: '1px solid #ddd' }}>
                    <Typography>Montant:</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#d32f2f' }}>{formData.amount} €</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pb: 1, borderBottom: '1px solid #ddd' }}>
                    <Typography>Type:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{formData.type}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Méthode:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{formData.paymentMethod}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={processingPayment}>
            Annuler
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            color="primary"
            disabled={processingPayment || !formData.amount}
          >
            {processingPayment ? <CircularProgress size={24} /> : 'Payer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsPage;
