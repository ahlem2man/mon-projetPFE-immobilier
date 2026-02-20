import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Grid, Typography, Box, CircularProgress, 
  Pagination, MenuItem, TextField, Drawer, IconButton
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import PropertyCard from '../components/PropertyCard';
import FilterSidebar from '../components/FilterSidebar';
import API_BASE_URL from '../config/api';

const Home = () => {
  // --- ÉTATS (STATES) ---
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('-createdAt');
  const [currentFilters, setCurrentFilters] = useState({});
  const [openFilters, setOpenFilters] = useState(false);

  // --- LOGIQUE DE RÉCUPÉRATION ---
  const fetchProperties = async (filters = {}, activePage = 1, activeSort = '-createdAt') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.location) params.append('location', filters.location);
      if (filters.type && filters.type !== 'Tous') params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.amenities) params.append('amenities', filters.amenities);

      params.append('page', activePage);
      params.append('sort', activeSort);
      params.append('limit', 6);

      const res = await axios.get(`http://localhost:5000/api/properties?${params.toString()}`);
      
      setProperties(res.data.data);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Erreur lors de la récupération des propriétés");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(currentFilters, page, sort);
  }, [page, sort]);

  // --- GESTIONNAIRES ---
  const handleApplyFilters = (filters) => {
    setCurrentFilters(filters);
    setPage(1);
    setOpenFilters(false); // Fermer le drawer
    fetchProperties(filters, 1, sort);
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    setPage(1);
    setOpenFilters(false); // Fermer le drawer
    fetchProperties({}, 1, sort);
  };

  const handleSortChange = (e) => {
    const newSortValue = e.target.value;
    console.log("Nouveau tri sélectionné :", newSortValue);
    setSort(newSortValue);
    setPage(1);
    fetchProperties(currentFilters, 1, newSortValue);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, textAlign: 'center', mb: 4 }}>
        <Container>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Trouvez votre futur foyer
          </Typography>
          <Typography variant="h6">
            Des milliers d'annonces vérifiées par nos agences partenaires
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mb: 8 }}>
        {/* LIGNE DE TITRE + BOUTON FILTRES + TRI */}
        <Box sx={{ mt: 6, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Propriétés disponibles
            </Typography>
            <IconButton
              onClick={() => setOpenFilters(true)}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 45,
                height: 45
              }}
              title="Ouvrir les filtres"
            >
              <FilterListIcon />
            </IconButton>
          </Box>

          <TextField
            select
            label="Trier par"
            value={sort}
            onChange={handleSortChange}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="-createdAt">Plus récentes</MenuItem>
            <MenuItem value="price">Prix : Croissant</MenuItem>
            <MenuItem value="-price">Prix : Décroissant</MenuItem>
            <MenuItem value="surface">Surface : Croissante</MenuItem>
          </TextField>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* LISTE DES PROPRIÉTÉS */}
            <Grid container spacing={3}>
              {properties.length > 0 ? (
                properties.map((property) => (
                  <Grid item key={property._id} xs={12} sm={6} md={4}>
                    <PropertyCard property={property} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="h6" color="textSecondary" textAlign="center" sx={{ mt: 4 }}>
                    Aucune propriété ne correspond à vos critères.
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* PAGINATION */}
            {properties.length > 0 && (
              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={(e, value) => setPage(value)} 
                  color="primary" 
                  size="large"
                  variant="outlined"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* DRAWER - FILTRES LATÉRAL */}
      <Drawer
        anchor="left"
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 350 },
            maxHeight: '100%',
            overflowY: 'auto'
          }
        }}
      >
        {/* En-tête du drawer */}
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          fontWeight: 'bold'
        }}>
          <FilterListIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 0.5, flex: 1 }}>
            Filtres
          </Typography>
          <IconButton 
            onClick={() => setOpenFilters(false)}
            sx={{ color: 'white' }}
          >
            ✕
          </IconButton>
        </Box>

        {/* Contenu des filtres */}
        <FilterSidebar 
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      </Drawer>
    </Box>
  );
};

export default Home;