import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
const STATUS_COLORS = {
  disponible: '#4ECDC4',
  louée: '#AA96DA',
  en_attente: '#FFA07A',
  inactive: '#95E1D3'
};

export default function GlobalAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGlobalAnalytics();
  }, []);

  const fetchGlobalAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/agency/analytics/global', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token
        }
      });
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des analytics:', err);
      setError('Impossible de charger les données d\'analyse');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!analytics) {
    return <Alert severity="info">Aucune donnée disponible</Alert>;
  }

  // Préparation des données pour les graphiques
  const statusData = [
    { name: 'Disponible', value: analytics.propertiesByStatus.disponible },
    { name: 'Louée', value: analytics.propertiesByStatus.louée },
    { name: 'En Attente', value: analytics.propertiesByStatus.en_attente },
    { name: 'Inactive', value: analytics.propertiesByStatus.inactive }
  ];

  const viewsPerProperty = analytics.propertyList
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        📊 Tableau de Bord Global des Analytics
      </Typography>

      {/* Cartes KPI */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#E8F5E9', borderLeft: '4px solid #4CAF50' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Propriétés
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {analytics.totalProperties}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#E3F2FD', borderLeft: '4px solid #2196F3' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Vues Totales
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {analytics.totalViews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#FCE4EC', borderLeft: '4px solid #E91E63' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Favoris
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {analytics.totalFavorites}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Candidatures
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {analytics.totalRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Pie Chart - Statut des propriétés */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Distribution par Statut
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={Object.values(STATUS_COLORS)[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart - Top 10 propriétés par vues */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Top 10 Propriétés par Vues
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={viewsPerProperty}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table des propriétés */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Détail de Toutes les Propriétés
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Titre</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Statut
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Vues
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Favoris
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Prix (EUR)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.propertyList.map((property) => (
                  <TableRow key={property._id}>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {property.title}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={property.status}
                        size="small"
                        sx={{
                          backgroundColor: STATUS_COLORS[property.status] || '#ccc',
                          color: '#fff'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">{property.views}</TableCell>
                    <TableCell align="right">{property.favorites}</TableCell>
                    <TableCell align="right">{property.price.toLocaleString()} €</TableCell>
                    <TableCell>{property.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
