import React, { useState, useEffect } from 'react';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Button, TextField, MenuItem, Pagination,
  Collapse, IconButton, Chip, Stack, Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
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
      
      // Convertir les dates au format ISO
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        params.append('startDate', startDate.toISOString());
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Jusqu'à la fin du jour
        params.append('endDate', endDate.toISOString());
      }

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
      // Actions ADMIN
      'user_verified': 'Utilisateur vérifié',
      'user_suspended': 'Utilisateur suspendu',
      'user_unsuspended': 'Suspension levée',
      'user_deleted': 'Utilisateur supprimé',
      'property_moderated': 'Annonce modérée',
      'document_verified': 'Document vérifié',
      'payment_processed': 'Paiement traité',
      'bulk_action': 'Action groupée',
      'admin_login': 'Connexion admin',
      // Actions CLIENT
      'property_favorited': 'Ajouté aux favoris',
      'property_unfavorited': 'Retiré des favoris',
      'request_created': 'Candidature créée',
      'profile_updated': 'Profil mis à jour',
      // Actions AGENCE
      'property_created': 'Annonce créée',
      'property_updated': 'Annonce modifiée',
      'property_deleted': 'Annonce supprimée',
      'agency_profile_updated': 'Profil agence mis à jour'
    };
    return labels[action] || action;
  };

  const getPerformerName = (log) => {
    if (log.performedByType === 'admin' && log.adminId) {
      return `${log.adminId.name || 'Admin'}`;
    } else if (log.performedByType === 'client' && log.userId) {
      const name = log.userId?.fullName || log.userId?.name || log.userId?.email || 'Client';
      return `${name}`;
    } else if (log.performedByType === 'agency' && log.agencyId) {
      const name = log.agencyId?.agencyName || log.agencyId?.name || 'Agence';
      return `${name}`;
    }
    return `${log.performedByType || 'Unknown'}`;
  };

  const getPerformerBadgeColor = (performedByType) => {
    const colors = {
      'admin': '#d32f2f',
      'client': '#1976d2',
      'agency': '#f57c00'
    };
    return colors[performedByType] || '#666';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Journaux d’activité et pistes d’audit 
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
          <MenuItem value="">— ADMIN —</MenuItem>
          <MenuItem value="user_verified">Utilisateur vérifié</MenuItem>
          <MenuItem value="user_suspended">Utilisateur suspendu</MenuItem>
          <MenuItem value="property_moderated">Annonce modérée</MenuItem>
          <MenuItem value="document_verified">Document vérifié</MenuItem>
          <MenuItem value="">— CLIENT —</MenuItem>
          <MenuItem value="property_favorited">Ajouté aux favoris</MenuItem>
          <MenuItem value="property_unfavorited">Retiré des favoris</MenuItem>
          <MenuItem value="request_created">Candidature créée</MenuItem>
          <MenuItem value="profile_updated">Profil mis à jour</MenuItem>
          <MenuItem value="">— AGENCE —</MenuItem>
          <MenuItem value="property_created">Annonce créée</MenuItem>
          <MenuItem value="property_updated">Annonce modifiée</MenuItem>
          <MenuItem value="property_deleted">Annonce supprimée</MenuItem>
          <MenuItem value="agency_profile_updated">Profil agence mis à jour</MenuItem>
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
              <TableCell sx={{ width: 50 }}></TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acteur</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cible</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  Aucun log à afficher
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <React.Fragment key={log._id}>
                  {/* Ligne principale */}
                  <TableRow hover sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                      >
                        {expandedId === log._id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleString('fr-FR')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getPerformerName(log)}
                        size="small"
                        sx={{ 
                          bgcolor: getPerformerBadgeColor(log.performedByType),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.performedByType?.toUpperCase() || 'ADMIN'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{getActionLabel(log.action)}</TableCell>
                    <TableCell>{log.targetType}</TableCell>
                    <TableCell>
                      <span style={{ 
                        color: log.success ? '#2e7d32' : '#d32f2f',
                        fontWeight: 'bold'
                      }}>
                        {log.success ? 'OK' : 'ERREUR'}
                      </span>
                    </TableCell>
                  </TableRow>

                  {/* Ligne d'expansion - Piste d'Audit */}
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 0, bgcolor: '#fafafa' }}>
                      <Collapse in={expandedId === log._id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            Piste d'Audit Détaillée
                          </Typography>
                          
                          <Stack spacing={2}>
                            {/* ID et Raison */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                                  ID Cible
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                                  {log.targetId}
                                </Typography>
                              </Box>
                              {log.details?.reason && (
                                <Box>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                                    Raison
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5, color: '#d32f2f' }}>
                                    {log.details.reason}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            <Divider />

                            {/* État AVANT */}
                            {log.details?.before && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                                  État Avant (BEFORE)
                                </Typography>
                                <Box sx={{ 
                                  bgcolor: '#e3f2fd', 
                                  p: 2, 
                                  borderRadius: 1, 
                                  fontFamily: 'monospace',
                                  fontSize: '0.85rem',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  maxHeight: '200px',
                                  overflowY: 'auto'
                                }}>
                                  {JSON.stringify(log.details.before, null, 2)}
                                </Box>
                              </Box>
                            )}

                            {/* État APRÈS */}
                            {log.details?.after && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                                  État Après (AFTER)
                                </Typography>
                                <Box sx={{ 
                                  bgcolor: '#e8f5e9', 
                                  p: 2, 
                                  borderRadius: 1, 
                                  fontFamily: 'monospace',
                                  fontSize: '0.85rem',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  maxHeight: '200px',
                                  overflowY: 'auto'
                                }}>
                                  {JSON.stringify(log.details.after, null, 2)}
                                </Box>
                              </Box>
                            )}

                            {/* Notes */}
                            {log.details?.notes && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#f57c00' }}>
                                  Notes Additionnelles
                                </Typography>
                                <Box sx={{ 
                                  bgcolor: '#fff3e0', 
                                  p: 2, 
                                  borderRadius: 1, 
                                  borderLeft: '4px solid #f57c00'
                                }}>
                                  <Typography variant="body2">
                                    {log.details.notes}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            {/* Pas de détails */}
                            {!log.details?.before && !log.details?.after && !log.details?.reason && !log.details?.notes && (
                              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                Aucun détail supplémentaire pour cette action
                              </Typography>
                            )}

                            {/* Informations Système */}
                            <Divider />
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                                INFORMATIONS SYSTÈME
                              </Typography>
                              <Stack spacing={1} sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" sx={{ color: '#666' }}>User Agent:</Typography>
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#333' }}>
                                    {log.userAgent ? log.userAgent.substring(0, 60) + '...' : 'N/A'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" sx={{ color: '#666' }}>IP Address:</Typography>
                                  <Chip label={log.ipAddress || 'N/A'} size="small" />
                                </Box>
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
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
