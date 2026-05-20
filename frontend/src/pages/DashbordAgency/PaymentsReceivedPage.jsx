import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Chip, Box, Button, CircularProgress, Alert,
  Card, CardContent
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import API_BASE_URL from '../../config/api';

const PaymentsReceivedPage = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/agency/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data.data || []);
      setStats(res.data.stats || {});
      setError(null);
    } catch (err) {
      console.error("Erreur chargement paiements reçus", err);
      setError(err.response?.data?.message || "Erreur lors du chargement des paiements");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const paymentsByType = {};
  payments.forEach(p => {
    if (!paymentsByType[p.type]) {
      paymentsByType[p.type] = 0;
    }
    if (p.status === 'complété') {
      paymentsByType[p.type] += p.amount;
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
           Paiements Reçus
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => exportToCSV(payments, 'paiements-recus')}
            size="small"
            disabled={payments.length === 0}
          >
            CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PictureAsPdfIcon />}
            onClick={() => exportToPDF(payments, 'paiements-recus')}
            size="small"
            disabled={payments.length === 0}
          >
            PDF
          </Button>
        </Box>
      </Box>

      {/* CARTES DE RÉSUMÉ */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#C8E6C9', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">Total Reçu</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#388E3C', mt: 1 }}>
            {stats?.totalAmount?.toFixed(2) || '0.00'} €
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#BBDEFB', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">Paiements Complétés</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976D2', mt: 1 }}>
            {stats?.completedCount || 0}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF9C4', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">En Attente</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F57F17', mt: 1 }}>
            {stats?.pendingCount || 0}
          </Typography>
        </Paper>
      </Box>

      {/* DÉTAIL PAR TYPE */}
      {Object.keys(paymentsByType).length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#F5F5F5', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Répartition par Type de Paiement
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {Object.entries(paymentsByType).map(([type, amount]) => (
              <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="body2">{type}:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#388E3C' }}>
                  {amount.toFixed(2)} €
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* ERREUR */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* CHARGEMENT */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* TABLE */}
      {!loading && payments.length === 0 && (
        <Alert severity="info">Aucun paiement reçu pour le moment</Alert>
      )}

      {!loading && payments.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #eee' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8F9FA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Locataire</TableCell>
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
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {p.userId?.name || 'Inconnu'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {p.userId?.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#388E3C' }}>
                    {p.amount} €
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={p.type} 
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
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
    </Box>
  );
};

export default PaymentsReceivedPage;
