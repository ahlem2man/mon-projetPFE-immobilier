import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const GrowthChart = ({ data, title, color }) => {
  // Transformation des numéros de mois (1, 2...) en noms (Jan, Fév...)
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const formattedData = data.map(item => ({
    name: months[item._id - 1],
    valeur: item.count || item.total
  }));

  return (
    <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>{title}</Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="valeur" 
              stroke={color} 
              fillOpacity={1} 
              fill="url(#colorVal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default GrowthChart;