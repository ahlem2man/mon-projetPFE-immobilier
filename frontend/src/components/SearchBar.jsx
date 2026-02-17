import { Box, TextField, MenuItem, Button, Stack, Paper } from '@mui/material';

const SearchBar = () => (
  <Paper elevation={3} sx={{ p: 3, mt: -4, mx: 'auto', maxWidth: 900, borderRadius: 2 }}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <TextField fullWidth label="Localisation" placeholder="Ex: Tunis" />
      <TextField select fullWidth label="Type" defaultValue="Appartement">
        <MenuItem value="Appartement">Appartement</MenuItem>
        <MenuItem value="Maison">Maison</MenuItem>
        <MenuItem value="Studio">Studio</MenuItem>
      </TextField>
      <TextField fullWidth type="number" label="Prix Max" />
      <TextField 
  select 
  fullWidth 
  label="Pièces" 
  defaultValue="S+1"
>
  <MenuItem value="S+0">S+0 (Studio)</MenuItem>
  <MenuItem value="S+1">S+1</MenuItem>
  <MenuItem value="S+2">S+2</MenuItem>
  <MenuItem value="S+3+">S+3 ou plus</MenuItem>
</TextField>
      <Button variant="contained" size="large" sx={{ px: 8 }}>Rechercher</Button>
    </Stack>
  </Paper>
);

export default SearchBar; 