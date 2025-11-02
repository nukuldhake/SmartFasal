import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  authenticateUser,
  validateRequiredFields,
  validateCoordinates 
} from "../_shared/utils.ts";

interface WeatherRequest {
  lat: number;
  lng: number;
  days?: number;
}

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    condition: string;
  };
  forecast: Array<{
    date: string;
    temperature: { min: number; max: number };
    precipitation: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  }>;
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    validUntil: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const { user } = await authenticateUser(authHeader);

    const { lat, lng, days = 7 }: WeatherRequest = await req.json();
    
    validateRequiredFields({ lat, lng }, ['lat', 'lng']);
    
    if (!validateCoordinates(lat, lng)) {
      throw new Error('Invalid coordinates provided');
    }

    const WEATHER_API_KEY = Deno.env.get("WEATHER_API_KEY");
    
    // If no weather API key, return mock data for development
    if (!WEATHER_API_KEY) {
      console.log('No weather API key found, returning mock data');
      
      const mockWeatherData: WeatherData = {
        current: {
          temperature: 28 + Math.random() * 10,
          humidity: 60 + Math.random() * 30,
          windSpeed: 5 + Math.random() * 15,
          precipitation: Math.random() * 5,
          condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
        },
        forecast: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          temperature: {
            min: 20 + Math.random() * 10,
            max: 30 + Math.random() * 10
          },
          precipitation: Math.random() * 10,
          humidity: 50 + Math.random() * 40,
          windSpeed: 3 + Math.random() * 12,
          condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'][Math.floor(Math.random() * 5)]
        })),
        alerts: Math.random() > 0.7 ? [{
          type: 'Rain Alert',
          severity: 'medium' as const,
          message: 'Heavy rainfall expected in the next 24 hours',
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }] : []
      };

      return createSuccessResponse(mockWeatherData);
    }

    // Real weather API integration (using OpenWeatherMap as example)
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    const processedWeatherData: WeatherData = {
      current: {
        temperature: Math.round(weatherData.current.temp),
        humidity: weatherData.current.humidity,
        windSpeed: Math.round(weatherData.current.wind_speed * 3.6), // Convert m/s to km/h
        precipitation: weatherData.current.rain?.['1h'] || 0,
        condition: weatherData.current.weather[0].description
      },
      forecast: weatherData.daily.slice(0, days).map((day: any) => ({
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max)
        },
        precipitation: day.rain || 0,
        humidity: day.humidity,
        windSpeed: Math.round(day.wind_speed * 3.6),
        condition: day.weather[0].description
      })),
      alerts: weatherData.alerts?.map((alert: any) => ({
        type: alert.event,
        severity: alert.tags.includes('Extreme') ? 'high' : 
                 alert.tags.includes('Severe') ? 'medium' : 'low',
        message: alert.description,
        validUntil: new Date(alert.end * 1000).toISOString()
      })) || []
    };

    return createSuccessResponse(processedWeatherData);

  } catch (error) {
    console.error('Error in get-weather-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return createErrorResponse(errorMessage);
  }
});

