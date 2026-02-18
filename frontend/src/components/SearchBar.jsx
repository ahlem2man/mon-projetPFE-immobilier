import React, { useState } from 'react';
import { 
  Paper, Stack, TextField, MenuItem, IconButton, 
  Tooltip, Typography, Divider, Box 
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Tous');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // État simple pour les équipements
  const [amenities, setAmenities] = useState({
    WiFi: false,
    Climatisation: false,
    Ascenseur: false,
  });

  const toggleAmenity = (name) => {
    setAmenities(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSearchClick = () => {
    const selectedAmenities = Object.keys(amenities).filter(k => amenities[k]).join(',');
    onSearch({
      location: location || undefined,
      type: type !== 'Tous' ? type : undefined,
      minPrice,
      maxPrice,
      amenities: selectedAmenities || undefined
    });
  };

  return (
    <Paper 
      elevation={6} 
      sx={{ 
        p: '8px 12px', 
        mt: -4, 
        mx: 'auto', 
        maxWidth: 1100, 
        borderRadius: '100px', // Forme pilule parfaite
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #ebebeb'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
        
        {/* SECTION : LOCALISATION */}
        <Box sx={{ flex: 2, px: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', ml: 1, color: '#000' }}>Localisation</Typography>
          <TextField 
            placeholder="Où cherchez-vous ?" 
            variant="standard" 
            fullWidth
            InputProps={{ disableUnderline: true, sx: { fontSize: '0.9rem' } }}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Box>

        <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

        {/* SECTION : TYPE */}
        <Box sx={{ flex: 1, px: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#000' }}>Type</Typography>
          <TextField 
            select value={type} variant="standard" fullWidth
            InputProps={{ disableUnderline: true, sx: { fontSize: '0.9rem' } }}
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="Tous">Tous</MenuItem>
            <MenuItem value="Appartement">Appartement</MenuItem>
            <MenuItem value="Villa">Villa</MenuItem>
            <MenuItem value="Studio">Studio</MenuItem>
          </TextField>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

        {/* SECTION : BUDGET */}
        <Box sx={{ flex: 1.5, px: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#000' }}>Budget (DT)</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TextField 
              placeholder="Min" variant="standard" type="number"
              InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem' } }}
              value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            />
            <Typography variant="body2" color="textSecondary">-</Typography>
            <TextField 
              placeholder="Max" variant="standard" type="number"
              InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem' } }}
              value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            />
          </Stack>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

        {/* SECTION : ÉQUIPEMENTS (ICÔNES INTERACTIVES) */}
        <Stack direction="row" spacing={0.5} sx={{ px: 1 }}>
          <Tooltip title="WiFi">
            <IconButton 
              size="small" 
              onClick={() => toggleAmenity('WiFi')}
              sx={{ color: amenities.WiFi ? 'primary.main' : 'action.disabled', bgcolor: amenities.WiFi ? '#e3f2fd' : 'transparent' }}
            >
              <WifiIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Climatisation">
            <IconButton 
              size="small" 
              onClick={() => toggleAmenity('Climatisation')}
              sx={{ color: amenities.Climatisation ? 'primary.main' : 'action.disabled', bgcolor: amenities.Climatisation ? '#e3f2fd' : 'transparent' }}
            >
              <AcUnitIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ascenseur">
            <IconButton 
              size="small" 
              onClick={() => toggleAmenity('Ascenseur')}
              sx={{ color: amenities.Ascenseur ? 'primary.main' : 'action.disabled', bgcolor: amenities.Ascenseur ? '#e3f2fd' : 'transparent' }}
            >
              <ApartmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* BOUTON RECHERCHE (CERCLE BLEU) */}
        <IconButton 
          onClick={handleSearchClick}
          sx={{ 
            bgcolor: '#1976d2', 
            color: 'white', 
            '&:hover': { bgcolor: '#115293' },
            width: 48, 
            height: 48,
            ml: 1
          }}
        >
          <SearchIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export default SearchBar;