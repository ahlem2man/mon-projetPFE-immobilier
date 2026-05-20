import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Card, CardContent, CircularProgress 
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ErrorIcon from '@mui/icons-material/Error';
import EuroIcon from '@mui/icons-material/Euro'; 
import axios from 'axios';

// --- AJOUT ÉTAPE 5 : IMPORT RECHARTS ---
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  // --- AJOUT ÉTAPE 5 : ÉTAT POUR LES DONNÉES DE CROISSANCE ---
  const [growthData, setGrowthData] = useState([]);
  const [propertiesGrowthData, setPropertiesGrowthData] = useState([]);
  const [revenueGrowthData, setRevenueGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setLoading(true);
        
        // --- MODIFICATION ÉTAPE 5 : APPEL SIMULTANÉ DE TOUS LES ENDPOINTS ---
        const [globalRes, growthRes, propsGrowthRes, revenueGrowthRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats/global', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/stats/growth', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/stats/properties-growth', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/stats/revenue-growth', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStats(globalRes.data.data);
        
        // Formatage des mois pour les graphiques (ex: 1 -> Jan)
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        
        // Croissance utilisateurs
        const formattedGrowth = growthRes.data.data.map(item => ({
          name: monthNames[item._id - 1] || `Mois ${item._id}`,
          utilisateurs: item.count
        }));
        setGrowthData(formattedGrowth);

        // Croissance annonces
        const formattedPropsGrowth = propsGrowthRes.data.data.map(item => ({
          name: monthNames[item._id - 1] || `Mois ${item._id}`,
          annonces: item.count
        }));
        setPropertiesGrowthData(formattedPropsGrowth);

        // Croissance revenus
        const formattedRevenueGrowth = revenueGrowthRes.data.data.map(item => ({
          name: monthNames[item._id - 1] || `Mois ${item._id}`,
          revenus: item.total
        }));
        setRevenueGrowthData(formattedRevenueGrowth);

      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [token]);

  const StatCard = ({ icon, title, value, color, subtext }) => (
    <Card 
      sx={{ 
        borderRadius: 2, 
        boxShadow: 'none',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" variant="overline" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mt: 1 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              {subtext}
            </Typography>
          </Box>
          <Box sx={{ fontSize: '3rem', color: color, opacity: 0.2 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1A237E' }}>
        Vue d'ensemble Analytics
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<EuroIcon />}
            title="Revenus"
            value={`${stats?.revenue?.total || 0} €`}
            color="#2E7D32"
            subtext="Chiffre d'affaires total"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<PeopleIcon />}
            title="Utilisateurs"
            value={stats?.users?.total || 0}
            color="#3F51B5"
            subtext={`${stats?.users?.agencies || 0} agences actives`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<HomeWorkIcon />}
            title="Annonces"
            value={stats?.properties?.total || 0}
            color="#009688"
            subtext={`${stats?.properties?.active || 0} en ligne`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<ErrorIcon />}
            title="Demandes"
            value={stats?.applications?.total || 0}
            color="#F44336"
            subtext="Candidatures locataires"
          />
        </Grid>
      </Grid>

      {/* --- AJOUT ÉTAPE 5 : GRAPHIQUE DE CROISSANCE --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Croissance des Inscriptions (Mensuel)
            </Typography>
            <Box sx={{ width: '100%', height: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3F51B5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3F51B5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="utilisateurs" 
                    stroke="#3F51B5" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Croissance des Annonces (Mensuel)
            </Typography>
            <Box sx={{ width: '100%', height: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={propertiesGrowthData}>
                  <defs>
                    <linearGradient id="colorProperties" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009688" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#009688" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="annonces" 
                    stroke="#009688" 
                    fillOpacity={1} 
                    fill="url(#colorProperties)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Croissance des Revenus (Mensuel)
            </Typography>
            <Box sx={{ width: '100%', height: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueGrowthData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}€`} />
                  <Area 
                    type="monotone" 
                    dataKey="revenus" 
                    stroke="#2E7D32" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
          border: '1px solid rgba(63, 81, 181, 0.2)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1A237E' }}>
          Console de Monitoring
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Les données et graphiques sont synchronisés avec les modèles User, Property et Payment.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;