export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  deals: {
    base: `${API_BASE_URL}/deal`,
    allData: `${API_BASE_URL}/deal/all-data`,
    filter: `${API_BASE_URL}/deal/filter`,
    industries: `${API_BASE_URL}/deal/industries`,
    cantons: `${API_BASE_URL}/deal/cantons`,
    phases: `${API_BASE_URL}/deal/phases`,
    years: `${API_BASE_URL}/deal/years`,
  },
  ai: {
    analyzeAndExplain: `${API_BASE_URL}/ai/analyze-and-explain`,
  },
  metadata: {
    sessions: `${API_BASE_URL}/metadata/sessions`,
  },
} as const;