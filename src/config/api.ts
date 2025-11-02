/**
 * API Configuration
 * Centralizes all API endpoints and base URL configuration
 */

// Base URL: Use environment variable or fallback to localhost
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
};

/**
 * API Endpoints
 * All backend API endpoints in one place
 */
export const API_ENDPOINTS = {
  // Crop Health
  analyzeCrop: `${API_CONFIG.baseURL}/analyze-base64`,
  
  // Crop Recommendation
  recommendCrop: `${API_CONFIG.baseURL}/recommend-crop`,
  
  // Field Efficiency
  calculateEfficiency: `${API_CONFIG.baseURL}/calculate-field-efficiency`,
  compareFields: `${API_CONFIG.baseURL}/compare-fields`,
  resourceBreakdown: `${API_CONFIG.baseURL}/resource-breakdown`,
  
  // Harvest Planning
  planHarvest: `${API_CONFIG.baseURL}/plan-harvest`,
  harvestNdviTrend: `${API_CONFIG.baseURL}/harvest-ndvi-trend`,
  
  // Health & Info
  health: `${API_CONFIG.baseURL}/health`,
  modelInfo: `${API_CONFIG.baseURL}/model/info`,
  classes: `${API_CONFIG.baseURL}/classes`,
  statistics: `${API_CONFIG.baseURL}/statistics`,
};

/**
 * Helper function to build API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

/**
 * Fetch helper with error handling
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_CONFIG.baseURL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response;
};

