import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Chip, Box, Button 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(res.data.data);
      } catch (err) {
        console.error("Erreur chargement paiements", err);
      }
    };
    fetchPayments();
  }, [token]);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Dernières Transactions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => exportToCSV(payments, 'paiements')}
            size="small"
          >
            CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PictureAsPdfIcon />}
            onClick={() => exportToPDF(payments, 'paiements')}
            size="small"
          >
            PDF
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #eee' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8F9FA' }}>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Méthode</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{p.userId?.name || 'Inconnu'}</Typography>
                  <Typography variant="caption" color="textSecondary">{p.userId?.email}</Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{p.amount} €</TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>
                  <Chip 
                    label={p.status} 
                    size="small"
                    color={p.status === 'complété' ? 'success' : 'warning'}
                    sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Carte Bancaire</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PaymentsList;