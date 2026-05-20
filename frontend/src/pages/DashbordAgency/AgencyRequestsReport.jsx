import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography, CircularProgress, Alert,
  Grid, Paper, Button, Stack, Chip, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Divider
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const AgencyRequestsReport = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const token = localStorage.getItem('token');

  // Couleurs pour les graphiques
  const COLORS = ['#3F51B5', '#FF9800', '#4CAF50', '#F44336', '#2196F3', '#9C27B0'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/requests/agency/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Préparer les données pour le graphique de répartition par statut
  const statusChartData = stats ? [
    { name: 'En attente', value: stats.byStatus['En attente'] || 0, color: '#FF9800' },
    { name: 'En cours', value: stats.byStatus['En cours'] || 0, color: '#2196F3' },
    { name: 'Acceptée', value: stats.byStatus['Acceptée'] || 0, color: '#4CAF50' },
    { name: 'Refusée', value: stats.byStatus['Refusée'] || 0, color: '#F44336' },
    { name: 'Infos requises', value: stats.byStatus['Infos requises'] || 0, color: '#9C27B0' }
  ].filter(item => item.value > 0) : [];

  // Préparer données tendance (simulée)
  const trendData = stats ? [
    { month: 'Cette semaine', demandes: stats.thisWeek, approuvées: Math.round(stats.thisWeek * (stats.approvalRate / 100)) },
    { month: 'Ce mois', demandes: stats.thisMonth, approuvées: Math.round(stats.thisMonth * (stats.approvalRate / 100)) }
  ] : [];

  // Préparer données tendance temporelle (simulation par jour sur 30 jours)
  const generateTrendData = () => {
    if (!stats) return [];
    const data = [];
    const days = 30;
    const dailyRequests = Math.max(1, Math.round(stats.thisMonth / 30));
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        demandes: Math.max(0, dailyRequests + Math.floor(Math.random() * 3) - 1),
        cumul: stats.total
      });
    }
    return data;
  };

  const trendDataDetailed = stats ? generateTrendData() : [];

  

  // Export CSV
  const handleExport = () => {
    if (!stats) return;

    // Créer les lignes du CSV
    const rows = [
      ['Rapport Statistiques Demandes Locatives'],
      ['Date', new Date().toLocaleDateString('fr-FR')],
      [],
      ['INDICATEURS CLÉS'],
      ['Total des demandes', stats.total],
      ['Demandes cette semaine', stats.thisWeek],
      ['Demandes ce mois', stats.thisMonth],
      ['Taux d\'approbation', `${stats.approvalRate}%`],
      ['Revenu moyen candidat', `${stats.averageIncome} DA`],
      ['Documents moyens/dossier', stats.avgDocuments],
      [],
      ['RÉPARTITION PAR STATUT'],
      ['Statut', 'Nombre'],
      ['En attente', stats.byStatus['En attente'] || 0],
      ['En cours', stats.byStatus['En cours'] || 0],
      ['Acceptée', stats.byStatus['Acceptée'] || 0],
      ['Refusée', stats.byStatus['Refusée'] || 0],
      ['Infos requises', stats.byStatus['Infos requises'] || 0],
      [],
      ['DOSSIERS'],
      ['Statut', 'Nombre'],
      ['Complétés (Acceptée + Refusée)', stats.completedDossiers],
      ['En attente de réponse', stats.pendingDossiers],
      [],
      ['TENDANCES - 30 DERNIERS JOURS'],
      ['Date', 'Demandes/jour'],
      ...trendDataDetailed.map(d => [d.date, d.demandes]),
      [],
    ];

    // Convertir en CSV avec échappement approprié
    const csvContent = rows
      .map(row =>
        row
          .map(cell => {
            const cellStr = String(cell || '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(',')
      )
      .join('\n');

    // Créer un Blob au lieu d'une data URL pour une meilleure compatibilité Excel
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport-demandes-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Rapports Demandes Locatives</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<RefreshIcon />} variant="outlined" onClick={fetchStats}>
            Actualiser
          </Button>
          <Button startIcon={<FileDownloadIcon />} variant="contained" onClick={handleExport}>
            Exporter CSV
          </Button>
        </Stack>
      </Box>

      {/* SECTION 2: STATUS RÉPARTITION */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Graphique Camembert */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Répartition par Statut" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} dossier(s)`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tableau Statuts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Détail par Statut" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Nombre</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statusChartData.map((row) => (
                      <TableRow key={row.name} hover>
                        <TableCell>
                          <Chip label={row.name} size="small" sx={{ bgcolor: row.color, color: 'white' }} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{row.value}</TableCell>
                        <TableCell align="right">{stats.total > 0 ? Math.round((row.value / stats.total) * 100) : 0}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SECTION 3: TENDANCES TEMPORELLES */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Tendances Temporelles" />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="demandes" fill="#3F51B5" name="Total Demandes" />
              <Bar dataKey="approuvées" fill="#4CAF50" name="Approuvées" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SECTION 4: ANALYSE PAR DEMANDES - TENDANCES */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Graphique tendance temporelle */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardHeader title="Tendance des Demandes (30 derniers jours)" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendDataDetailed}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="demandes" stroke="#3F51B5" name="Demandes/jour" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SECTION 6: RÉSUMÉ DOSSIERS */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Statut des Dossiers" />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#E8F5E9', borderRadius: 1 }}>
                  <Typography>Dossiers Complétés</Typography>
                  <Chip label={stats.completedDossiers} color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#FFF3E0', borderRadius: 1 }}>
                  <Typography>En Attente de Réponse</Typography>
                  <Chip label={stats.pendingDossiers} sx={{ bgcolor: '#FF9800', color: 'white' }} />
                </Box>
                <Divider />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', pt: 1 }}>
                  Taux de complétude: <strong>{stats.total > 0 ? Math.round((stats.completedDossiers / stats.total) * 100) : 0}%</strong>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Période Actuelle" />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#E3F2FD', borderRadius: 1 }}>
                  <Typography>Cette Semaine</Typography>
                  <Chip label={`${stats.thisWeek} demandes`} color="primary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#F3E5F5', borderRadius: 1 }}>
                  <Typography>Ce Mois</Typography>
                  <Chip label={`${stats.thisMonth} demandes`} sx={{ bgcolor: '#9C27B0', color: 'white' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgencyRequestsReport;
