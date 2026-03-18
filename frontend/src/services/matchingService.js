import axios from 'axios';

const API_URL = 'http://localhost:5000/api/matchings';

export const getUserMatchings = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
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
  const response = await axios.post(`${API_URL}/generate`, {}, config);
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
  const response = await axios.get(`${API_URL}/history`, config);
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
    `${API_URL}/${matchingId}/feedback`,
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
  const response = await axios.post(`${API_URL}/${matchingId}/archive`, {}, config);
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
  const response = await axios.put(`${API_URL}/${matchingId}/restore`, {}, config);
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
  const response = await axios.post(`${API_URL}/admin/manual-trigger`, {}, config);
  return response.data;
};