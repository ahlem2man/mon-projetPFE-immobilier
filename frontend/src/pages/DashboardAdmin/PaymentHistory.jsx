import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, TextField, MenuItem, Button, Divider } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
      const res = await axios.get(`http://localhost:5000/api/admin/payments?status=${filterStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data.data);
      setReport(res.data.report || { 
        totalAmount: res.data.data.reduce((sum, p) => sum + p.amount, 0), 
        count: res.data.data.length 
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

  // --- FONCTION EXPORT CSV ---
  const handleExportCSV = () => {
    if (payments.length === 0) return alert("Aucune donnée à exporter");
    
    const headers = "ID_Transaction,Utilisateur,Email,Montant,Date,Statut\n";
    const rows = payments.map(p => (
      `${p._id},${p.userId?.name || 'N/A'},${p.userId?.email || 'N/A'},${p.amount},${new Date(p.createdAt).toLocaleDateString()},${p.status}`
    )).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport_HOMA_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FONCTION EXPORT PDF ---
  const handleExportPDF = () => {
    if (payments.length === 0) return alert("Aucune donnée à exporter");
    
    const doc = new jsPDF();
    doc.text("HOMA Admin - Rapport des Paiements", 14, 15);
    doc.setFontSize(10);
    doc.text(`Filtre : ${filterStatus || 'Tous'} | Total : ${report.totalAmount} €`, 14, 25);

    const tableColumn = ["ID", "Utilisateur", "Montant", "Date", "Statut"];
    const tableRows = payments.map(p => [
      p._id.substring(0, 8),
      p.userId?.name || 'N/A',
      `${p.amount} €`,
      new Date(p.createdAt).toLocaleDateString(),
      p.status
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`rapport_HOMA_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>📊 Historique & Rapports Financiers</Typography>

      {/* Barre de Filtres & Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              select
              label="Statut"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              <MenuItem value="complété">Complété</MenuItem>
              <MenuItem value="en attente">En attente</MenuItem>
              <MenuItem value="échoué">Échoué</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="success"
                startIcon={<TableChartIcon />} 
                onClick={handleExportCSV}
              >
                CSV (Excel)
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<PictureAsPdfIcon />} 
                onClick={handleExportPDF}
              >
                PDF
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Petit résumé du rapport */}
        <Grid item xs={12} md={4}>
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