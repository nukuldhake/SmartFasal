// Common utility functions for Supabase Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export function createApiResponse<T>(
  success: boolean, 
  data?: T, 
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(error: string, status: number = 500): Response {
  return new Response(
    JSON.stringify(createApiResponse(false, undefined, error)),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function createSuccessResponse<T>(data: T): Response {
  return new Response(
    JSON.stringify(createApiResponse(true, data)),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export async function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function authenticateUser(authHeader: string | null) {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  const supabase = await getSupabaseClient();
  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  
  return { user, supabase };
}

export function validateRequiredFields(data: any, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCropSeason(cropType: string): string {
  const seasons: Record<string, string> = {
    'wheat': 'Rabi (Winter)',
    'rice': 'Kharif (Monsoon)',
    'cotton': 'Kharif (Monsoon)',
    'sugarcane': 'Year-round',
    'vegetables': 'Year-round',
    'pulses': 'Kharif/Rabi',
    'maize': 'Kharif (Monsoon)',
    'bajra': 'Kharif (Monsoon)',
    'jowar': 'Kharif/Rabi',
    'groundnut': 'Kharif (Monsoon)',
    'soybean': 'Kharif (Monsoon)',
    'sunflower': 'Rabi (Winter)',
    'mustard': 'Rabi (Winter)',
  };
  
  return seasons[cropType.toLowerCase()] || 'Unknown';
}

export function getOptimalPlantingDates(cropType: string): { start: string; end: string } {
  const dates: Record<string, { start: string; end: string }> = {
    'wheat': { start: '2024-10-15', end: '2024-11-30' },
    'rice': { start: '2024-06-01', end: '2024-07-31' },
    'cotton': { start: '2024-05-01', end: '2024-06-15' },
    'sugarcane': { start: '2024-02-01', end: '2024-04-30' },
    'vegetables': { start: '2024-01-01', end: '2024-12-31' },
    'pulses': { start: '2024-06-01', end: '2024-07-15' },
    'maize': { start: '2024-06-01', end: '2024-07-15' },
    'bajra': { start: '2024-06-01', end: '2024-07-31' },
    'jowar': { start: '2024-06-01', end: '2024-07-15' },
    'groundnut': { start: '2024-06-01', end: '2024-07-15' },
    'soybean': { start: '2024-06-01', end: '2024-07-15' },
    'sunflower': { start: '2024-10-01', end: '2024-11-30' },
    'mustard': { start: '2024-10-01', end: '2024-11-15' },
  };
  
  return dates[cropType.toLowerCase()] || { start: '2024-01-01', end: '2024-12-31' };
}

