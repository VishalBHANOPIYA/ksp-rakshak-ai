import axios from 'axios';
import { AgentChatMessage } from '@shared/types';

const rawBase = import.meta.env.VITE_API_BASE_URL;
const isValidUrl = rawBase && rawBase.startsWith('http');
const API_BASE = isValidUrl ? `${rawBase}/api/v1` : '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    const contentType = response.headers?.['content-type'] || '';
    if (typeof response.data === 'string' || contentType.includes('text/html')) {
      return Promise.reject(new Error('Received non-JSON response — request likely hit the wrong host (check VITE_API_BASE_URL).'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Set bearer token for authenticated requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const fetchHealthCheck = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const loginOfficer = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  if (res.data?.access_token) {
    setAuthToken(res.data.access_token);
  }
  return res.data;
};

export const fetchPoliceStations = async () => {
  const res = await api.get('/stations');
  return res.data;
};

export const fetchFIRCases = async (params: { query?: string; district?: string; station_id?: string; crime_head?: string; page?: number; page_size?: number }) => {
  const res = await api.get('/cases', { params });
  return res.data;
};

export const fetchCaseDetail = async (firId: string) => {
  const res = await api.get(`/cases/${firId}`);
  return res.data;
};

export const fetchAccusedDirectory = async (query?: string, gang?: string) => {
  const res = await api.get('/accused', { params: { query, gang } });
  return res.data;
};

export const fetchEntityKnowledgeGraph = async (entityId: string, depth: number = 2) => {
  const res = await api.get(`/graph/${entityId}`, { params: { depth } });
  return res.data;
};

export const fetchAnalyticsOverview = async () => {
  const res = await api.get('/analytics/overview');
  return res.data;
};

export const fetchAuditLogs = async (limit: number = 50) => {
  const res = await api.get('/audit', { params: { limit } });
  return res.data;
};

export const verifyAuditChain = async () => {
  const res = await api.get('/audit/verify-chain');
  return res.data;
};

export const generateReport = async (payload: { report_type: string; district?: string; station_id?: string; crime_head?: string; title?: string }) => {
  const res = await api.post('/reports/generate', payload);
  return res.data;
};

export const fetchReports = async () => {
  const res = await api.get('/reports');
  return res.data;
};

export const fetchReportDetail = async (reportId: string) => {
  const res = await api.get(`/reports/${reportId}`);
  return res.data;
};

export const sendConversationalAIQuery = async (query: string, stationContext?: string) => {
  const res = await api.post('/chat', { query, station_context: stationContext });
  return res.data;
};
