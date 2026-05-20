import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, TextField, MenuItem, Divider } from '@mui/material';
import axios from 'axios';
import PaymentsList from './PaymentsList'; 

const PaymentHistory = () => {
  const [filterStatus, setFilterStatus] = useState('');
  const [report, setReport] = useState({ totalAmount: 0, count: 0 });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFilteredData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const query = filterStatus ? `?status=${filterStatus}` : '';
      console.log('Fetching payments with query:', query);
      const res = await axios.get(`http://localhost:5000/api/admin/payments${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Payments response:', res.data);
      setPayments(res.data.data || []);
      setReport(res.data.report || { 
        totalAmount: (res.data.data || []).reduce((sum, p) => sum + p.amount, 0), 
        count: (res.data.data || []).length 
      });
    } catch (err) {
      console.error("Erreur lors du filtrage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchFilteredData(); 
  }, [filterStatus]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Historique & Rapports Financiers</Typography>

      {/* Barre de Filtres & Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              label="Statut"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              <MenuItem value="complété">Complété</MenuItem>
              <MenuItem value="en attente">En attente</MenuItem>
              <MenuItem value="échoué">Échoué</MenuItem>
            </TextField>
          </Paper>
        </Grid>

        {/* Petit résumé du rapport */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, bgcolor: '#1A237E', color: 'white', textAlign: 'center' }}>
            <Typography variant="overline">Total sur la période</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{report.totalAmount} €</Typography>
            <Typography variant="caption">{report.count} transactions trouvées</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />
      
      {/* Affichage de la liste peuplée */}
      <PaymentsList customData={payments} /> 
    </Box>
  );
};

export default PaymentHistory;