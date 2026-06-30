import axios from 'axios';
import API_BASE_URL from '../config/api';

export const getUserMatchings = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_BASE_URL}/matchings`, config);
  return response.data; // Retourne { success: true, count: X, data: [...] }
};

/**
 * Générer les matchings pour l'utilisateur
 */
export const generateMatchings = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_BASE_URL}/matchings/generate`, {}, config);
  return response.data;
};

/**
 * Obtenir l'historique des matchings (actifs et archivés)
 */
export const getMatchingHistory = async (token, status = null) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: status ? { status } : {}
  };
  const response = await axios.get(`${API_BASE_URL}/matchings/history`, config);
  return response.data;
};

/**
 * Soumettre un feedback sur un matching
 */
export const submitMatchingFeedback = async (token, matchingId, feedback) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(
    `${API_BASE_URL}/matchings/${matchingId}/feedback`,
    { feedback },
    config
  );
  return response.data;
};

/**
 * Archiver un matching
 */
export const archiveMatching = async (token, matchingId) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Modifié : API_BASE_URL + ajout de /matchings pour rester cohérent avec le backend
  const response = await axios.post(`${API_BASE_URL}/matchings/${matchingId}/archive`, {}, config);
  return response.data;
};

/**
 * Restaurer un matching archivé
 */
export const restoreMatching = async (token, matchingId) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Modifié : API_BASE_URL + ajout de /matchings
  const response = await axios.put(`${API_BASE_URL}/matchings/${matchingId}/restore`, {}, config);
  return response.data;
};

/**
 * Déclencher manuellement le matching (admin seulement)
 */
export const triggerManualMatching = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Modifié : API_BASE_URL + correction de la route si nécessaire
  const response = await axios.post(`${API_BASE_URL}/matchings/admin/manual-trigger`, {}, config);
  return response.data;
};