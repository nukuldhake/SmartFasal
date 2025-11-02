# Smart Fasal Backend Setup Guide

## Overview

The Smart Fasal backend is built using Supabase, providing a complete backend-as-a-service solution with PostgreSQL database, authentication, real-time subscriptions, and Edge Functions for serverless compute.

## Architecture

```
Frontend (React) 
    ↓
Supabase Client
    ↓
Supabase Backend
├── PostgreSQL Database
├── Authentication
├── Real-time Subscriptions
├── Storage (for images)
└── Edge Functions (Deno)
    ├── analyze-crop-health
    ├── predict-yield
    ├── calculate-field-efficiency
    ├── schedule-harvest
    ├── get-dashboard-stats
    └── get-weather-data
```

## Environment Setup

### 1. Required Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://hhctinfwuemapjrsiusz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# Supabase Service Role (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI API Configuration
AI_API_KEY=your_ai_api_key_here

# Optional: External API Keys
WEATHER_API_KEY=your_weather_api_key_here
SATELLITE_API_KEY=your_satellite_api_key_here
```

### 2. Getting Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key
5. Copy the service_role key (keep this secret!)

## Database Schema

### Core Tables

1. **profiles** - User profile information
2. **fields** - Agricultural field data
3. **crop_health_analysis** - Disease detection results
4. **yield_predictions** - AI-generated yield forecasts
5. **field_efficiency_metrics** - Resource usage analytics
6. **harvest_schedules** - Optimal harvest timing data

### Enhanced Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Database Functions** - Pre-built functions for complex queries
- **Triggers** - Automatic profile creation on user signup
- **Indexes** - Optimized for performance

## Edge Functions

### 1. analyze-crop-health
**Purpose**: AI-powered crop disease detection
**Input**: Image URL, field ID, crop type, location
**Output**: Diagnosis, confidence, severity, treatment recommendations

**Enhanced Features**:
- Indian agriculture context
- Affected area percentage
- Urgency level assessment
- Prevention tips
- Location-based analysis

### 2. predict-yield
**Purpose**: AI-powered yield forecasting
**Input**: Field ID, historical data
**Output**: Predicted yield, confidence level, contributing factors

### 3. calculate-field-efficiency
**Purpose**: Resource usage optimization
**Input**: Field ID, usage data
**Output**: Efficiency scores, recommendations

### 4. schedule-harvest
**Purpose**: Optimal harvest timing
**Input**: Field ID, weather data
**Output**: Harvest window, risk assessment

### 5. get-dashboard-stats
**Purpose**: Dashboard analytics
**Input**: User authentication
**Output**: Field statistics, recent activities, health scores

### 6. get-weather-data
**Purpose**: Weather integration
**Input**: Coordinates, days
**Output**: Current weather, forecast, alerts

## API Integration

### Frontend Integration

```typescript
// Example: Calling Edge Functions from frontend
const { data, error } = await supabase.functions.invoke('analyze-crop-health', {
  body: {
    imageUrl: 'https://example.com/crop-image.jpg',
    fieldId: 'field-uuid',
    cropType: 'wheat',
    location: { lat: 19.0760, lng: 72.8777 }
  }
});
```

### Error Handling

All Edge Functions return standardized responses:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

## Storage Configuration

### Buckets

1. **crop-images** (public) - Crop photos for analysis
2. **field-data** (private) - Field documentation
3. **reports** (private) - Generated reports

### Usage

```typescript
// Upload crop image
const { data, error } = await supabase.storage
  .from('crop-images')
  .upload(`crops/${fieldId}/${Date.now()}.jpg`, file);

// Get public URL
const { data } = supabase.storage
  .from('crop-images')
  .getPublicUrl(data.path);
```

## Security Features

### Authentication
- JWT-based authentication
- Automatic token refresh
- Secure password policies

### Authorization
- Row Level Security (RLS) policies
- User-specific data access
- Function-level permissions

### Data Protection
- Encrypted connections
- Secure environment variables
- Input validation and sanitization

## Performance Optimizations

### Database
- Optimized indexes
- Connection pooling
- Query optimization

### Edge Functions
- Deno runtime for fast startup
- Shared utility functions
- Efficient error handling

### Caching
- Supabase built-in caching
- CDN for static assets
- Optimized API responses

## Monitoring and Logging

### Edge Function Logs
- Console logging for debugging
- Error tracking and reporting
- Performance metrics

### Database Monitoring
- Query performance tracking
- Connection monitoring
- Resource usage analytics

## Deployment

### Local Development
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Deploy functions
supabase functions deploy
```

### Production Deployment
1. Set up production Supabase project
2. Configure environment variables
3. Deploy Edge Functions
4. Run database migrations
5. Set up monitoring

## Testing

### Unit Tests
- Edge Function testing
- Database function testing
- Utility function testing

### Integration Tests
- API endpoint testing
- Database integration
- Authentication flow testing

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check JWT token validity
   - Verify RLS policies
   - Ensure proper headers

2. **Function Errors**
   - Check environment variables
   - Verify input validation
   - Review error logs

3. **Database Errors**
   - Check connection strings
   - Verify table permissions
   - Review query performance

### Debug Tools

- Supabase Dashboard logs
- Edge Function logs
- Database query analyzer
- Network request inspector

## Next Steps

1. Set up environment variables
2. Deploy Edge Functions
3. Run database migrations
4. Test API endpoints
5. Configure monitoring
6. Set up CI/CD pipeline

## Support

For backend-related issues:
- Check Supabase documentation
- Review Edge Function logs
- Test with Postman/curl
- Contact development team



