import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Container, Grid, Typography, Box, CircularProgress, Stack,
  Pagination, MenuItem, TextField, Drawer, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveIcon from '@mui/icons-material/Save';
import PropertyCard from '../components/PropertyCard';
import FilterSidebar from '../components/FilterSidebar';

const Properties = () => {
  // --- RÉCUPÉRER LES QUERY PARAMS ---
  const [searchParams] = useSearchParams();
  
  // --- ÉTATS (STATES) ---
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('-createdAt');
  const [currentFilters, setCurrentFilters] = useState({});
  const [openFilters, setOpenFilters] = useState(false);

  // États pour sauvegarde de recherche
  const [openSaveSearch, setOpenSaveSearch] = useState(false);
  const [searchLabel, setSearchLabel] = useState('');
  const [savingSearch, setSavingSearch] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

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

      const res = await axios.get(`${API_BASE_URL}/properties?${params.toString()}`);
      
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

  useEffect(() => {
    const filtersFromURL = {};
    
    if (searchParams.get('location')) filtersFromURL.location = searchParams.get('location');
    if (searchParams.get('type')) filtersFromURL.type = searchParams.get('type');
    if (searchParams.get('minPrice')) filtersFromURL.minPrice = searchParams.get('minPrice');
    if (searchParams.get('maxPrice')) filtersFromURL.maxPrice = searchParams.get('maxPrice');
    if (searchParams.get('minRooms')) filtersFromURL.minRooms = searchParams.get('minRooms');
    
    if (Object.keys(filtersFromURL).length > 0) {
      setCurrentFilters(filtersFromURL);
      fetchProperties(filtersFromURL, 1, sort);
      setPage(1);
    } else {
      setCurrentFilters({});
      fetchProperties({}, 1, sort);
      setPage(1);
    }
  }, [searchParams]);

  // --- GESTIONNAIRES ---
  const handleApplyFilters = (filters) => {
    setCurrentFilters(filters);
    setPage(1);
    setOpenFilters(false);
    fetchProperties(filters, 1, sort);
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    setPage(1);
    setOpenFilters(false);
    fetchProperties({}, 1, sort);
  };

  const handleSaveSearch = async () => {
    if (!searchLabel.trim()) {
      setAlertMsg('Veuillez entrer un nom pour la recherche');
      return;
    }

    try {
      setSavingSearch(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAlertMsg('Vous devez être connecté pour sauvegarder une recherche');
        return;
      }

      const filters = {
        location: currentFilters.location || '',
        budgetMax: currentFilters.maxPrice || 0,
        propertyType: currentFilters.type || '',
        minRooms: currentFilters.minRooms || 0
      };

      await axios.post(
        `${API_BASE_URL}/tenants/save-search`,
        { label: searchLabel, filters },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlertMsg('Recherche sauvegardée ! Retrouvez-la dans votre dashboard');
      setSearchLabel('');
      setOpenSaveSearch(false);
    } catch (error) {
      setAlertMsg('Erreur lors de la sauvegarde de la recherche');
      console.error(error);
    } finally {
      setSavingSearch(false);
    }
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
      {/* HEADER */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
          py: 6,
          textAlign: 'center',
          mb: 6,
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              mb: 1,
              letterSpacing: '-1px',
            }}
          >
            Tous nos biens
          </Typography>
          <Typography 
            variant="h6" 
            sx={{
              fontWeight: 400,
              opacity: 0.95,
            }}
          >
            Explorez nos propriétés et trouvez votre logement idéal
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {alertMsg && (
          <Alert 
            severity={alertMsg.includes('Erreur') ? 'error' : 'success'} 
            onClose={() => setAlertMsg(null)} 
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {alertMsg}
          </Alert>
        )}

        {/* TITRE + FILTRES + TRI */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: '700', color: '#0a1930' }}>
              Propriétés disponibles
            </Typography>
            <IconButton
              onClick={() => setOpenFilters(true)}
              sx={{
                bgcolor: '#00BCD4',
                color: 'white',
                '&:hover': { 
                  bgcolor: '#0097A7',
                  transform: 'scale(1.05)',
                },
                width: 45,
                height: 45,
                transition: 'all 0.2s',
              }}
            >
              <FilterListIcon />
            </IconButton>
            {Object.keys(currentFilters).length > 0 && (
              <Button 
                startIcon={<SaveIcon />}
                variant="outlined"
                size="small"
                onClick={() => setOpenSaveSearch(true)}
                sx={{
                  borderColor: '#00BCD4',
                  color: '#00BCD4',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 188, 212, 0.05)',
                  }
                }}
              >
                Sauvegarder
              </Button>
            )}
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
            <CircularProgress sx={{ color: '#00BCD4' }} />
          </Box>
        ) : (
          <>
            {/* GRILLE DE PROPRIÉTÉS */}
            <Grid container spacing={3}>
              {properties.length > 0 ? (
                properties.map((property) => (
                  <Grid item key={property._id} xs={12} sm={6} md={4}>
                    <PropertyCard property={property} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h6" color="textSecondary">
                      Aucune propriété ne correspond à vos critères.
                    </Typography>
                  </Box>
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

      {/* DRAWER - FILTRES */}
      <Drawer
        anchor="left"
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 350 },
            maxHeight: '100%',
            overflowY: 'auto',
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
          color: 'white', 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          fontWeight: 'bold'
        }}>
          <FilterListIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 0.5, flex: 1 }}>
            Affiner votre recherche
          </Typography>
          <IconButton 
            onClick={() => setOpenFilters(false)}
            sx={{ color: 'white' }}
          >
            ✕
          </IconButton>
        </Box>

        <FilterSidebar 
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      </Drawer>

      {/* DIALOG - SAUVEGARDER LA RECHERCHE */}
      <Dialog open={openSaveSearch} onClose={() => setOpenSaveSearch(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0a1930' }}>
          Sauvegarder cette recherche
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Donnez un nom à cette recherche pour la retrouver rapidement plus tard dans votre dashboard
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Nom de la recherche"
            placeholder="Ex: T3 à Lyon, Budget: 800€"
            value={searchLabel}
            onChange={(e) => setSearchLabel(e.target.value)}
            variant="outlined"
            onKeyPress={(e) => e.key === 'Enter' && handleSaveSearch()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveSearch(false)}>Annuler</Button>
          <Button 
            onClick={handleSaveSearch} 
            variant="contained"
            disabled={savingSearch}
            sx={{
              background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0097A7 0%, #006064 100%)',
              }
            }}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Properties;
