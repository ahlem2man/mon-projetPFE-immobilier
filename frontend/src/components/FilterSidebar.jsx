import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
  Divider,
  InputAdornment
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';

const FilterSidebar = ({ onApplyFilters, onClearFilters }) => {
  // États des filtres
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Tous');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [amenities, setAmenities] = useState({
    WiFi: false,
    Climatisation: false,
    Ascenseur: false,
  });

  // Gestion des cases à cocher
  const handleAmenityChange = (e) => {
    setAmenities({
      ...amenities,
      [e.target.name]: e.target.checked,
    });
  };

  // Appliquer les filtres
  const handleApplyFilters = () => {
    const selectedAmenities = Object.keys(amenities)
      .filter(key => amenities[key])
      .join(',');

    const filterData = {
      location: location || '',
      type: type || 'Tous',
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
      amenities: selectedAmenities,
    };

    onApplyFilters(filterData);
  };

  // Réinitialiser les filtres
  const handleClearFilters = () => {
    setLocation('');
    setType('Tous');
    setMinPrice('');
    setMaxPrice('');
    setAmenities({
      WiFi: false,
      Climatisation: false,
      Ascenseur: false,
    });
    onClearFilters();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* LOCALISATION */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LocationOnIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight="bold">
              Localisation
            </Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="Ex: Paris, Lyon, Marseille..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            size="small"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* TYPE DE BIEN */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <HomeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight="bold">
              Type de bien
            </Typography>
          </Box>
          <TextField
            select
            fullWidth
            value={type}
            onChange={(e) => setType(e.target.value)}
            size="small"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          >
            <MenuItem value="Tous">Tous les types</MenuItem>
            <MenuItem value="Appartement">Appartement</MenuItem>
            <MenuItem value="Villa">Villa</MenuItem>
            <MenuItem value="Maison">Maison</MenuItem>
            <MenuItem value="Studio">Studio</MenuItem>
            <MenuItem value="Bureau">Bureau</MenuItem>
          </TextField>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* BUDGET */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <AttachMoneyIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight="bold">
              Budget (€)
            </Typography>
          </Box>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              label="Prix minimum"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              size="small"
              variant="outlined"
              placeholder="0"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
            <TextField
              fullWidth
              label="Prix maximum"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              size="small"
              variant="outlined"
              placeholder="50000"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* ÉQUIPEMENTS */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <StarIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight="bold">
              Équipements
            </Typography>
          </Box>
          <FormGroup sx={{ pl: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={amenities.WiFi}
                  onChange={handleAmenityChange}
                  name="WiFi"
                  size="small"
                />
              }
              label={<Typography variant="body2">📶 WiFi</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={amenities.Climatisation}
                  onChange={handleAmenityChange}
                  name="Climatisation"
                  size="small"
                />
              }
              label={<Typography variant="body2">❄️ Climatisation</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={amenities.Ascenseur}
                  onChange={handleAmenityChange}
                  name="Ascenseur"
                  size="small"
                />
              }
              label={<Typography variant="body2">🛗 Ascenseur</Typography>}
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* BOUTONS */}
        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
            size="medium"
            sx={{ 
              fontWeight: 'bold', 
              py: 1.2,
              fontSize: '0.95rem',
              borderRadius: 1.5,
              textTransform: 'none',
              boxShadow: 2
            }}
          >
            🔍 Appliquer les filtres
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={handleClearFilters}
            size="medium"
            sx={{ 
              fontWeight: 'bold', 
              py: 1.2,
              fontSize: '0.95rem',
              borderRadius: 1.5,
              textTransform: 'none'
            }}
          >
            ✕ Réinitialiser
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default FilterSidebar;
