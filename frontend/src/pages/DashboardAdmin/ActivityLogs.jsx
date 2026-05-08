import React, { useState, useEffect } from 'react';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Button, TextField, MenuItem, Pagination
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: ''
  });
  const token = localStorage.getItem('token');

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', 20);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await axios.get(`http://localhost:5000/api/admin/logs/activity?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLogs(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      console.error('Erreur chargement logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  const handleExport = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/logs/export-csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Erreur export:', err);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'user_verified': '✓ Utilisateur vérifié',
      'user_suspended': '⊘ Utilisateur suspendu',
      'user_unsuspended': '↺ Suspension levée',
      'user_deleted': '✕ Utilisateur supprimé',
      'property_moderated': '🏠 Annonce modérée',
      'document_verified': '📄 Document vérifié',
      'payment_processed': '💰 Paiement traité',
      'bulk_action': '⚙ Action groupée',
      'admin_login': '🔑 Connexion admin'
    };
    return labels[action] || action;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          📋 Journal d'Activité
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Exporter
        </Button>
      </Box>

      {/* Filtres */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Action"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Toutes les actions</MenuItem>
          <MenuItem value="user_verified">Utilisateur vérifié</MenuItem>
          <MenuItem value="user_suspended">Utilisateur suspendu</MenuItem>
          <MenuItem value="property_moderated">Annonce modérée</MenuItem>
          <MenuItem value="document_verified">Document vérifié</MenuItem>
          <MenuItem value="payment_processed">Paiement traité</MenuItem>
        </TextField>

        <TextField
          type="date"
          label="Du"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="date"
          label="Au"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  Aucun log à afficher
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell>{new Date(log.createdAt).toLocaleString('fr-FR')}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{log.adminId?.name || 'N/A'}</TableCell>
                  <TableCell>{getActionLabel(log.action)}</TableCell>
                  <TableCell>{log.targetType}</TableCell>
                  <TableCell>
                    <span style={{ 
                      color: log.success ? '#2e7d32' : '#d32f2f',
                      fontWeight: 'bold'
                    }}>
                      {log.success ? '✓ OK' : '✕ ERREUR'}
                    </span>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{log.ipAddress || 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page}
            onChange={(e, value) => fetchLogs(value)}
          />
        </Box>
      )}
    </Box>
  );
};

export default ActivityLogs;
