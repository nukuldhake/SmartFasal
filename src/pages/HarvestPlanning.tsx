import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Calendar, CloudRain, Sun, Wind, Droplets, AlertTriangle, TrendingUp, Leaf, Loader2 } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";

const HarvestPlanning = () => {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<any[]>([]);
  const [harvestPlans, setHarvestPlans] = useState<any[]>([]);
  const [overallPlan, setOverallPlan] = useState<any>(null);
  const [ndviData, setNdviData] = useState<any[]>([]);
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHarvestPlanning();
    }
  }, [user]);

  const fetchHarvestPlanning = async () => {
    setLoading(true);
    try {
      // Fetch user's fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);

      if (!fieldsData || fieldsData.length === 0) {
        toast.info("No fields found. Add fields to get harvest planning.");
        setLoading(false);
        return;
      }

      // Calculate harvest plan for each field
      const plans: any[] = [];
      let allNdviData: any[] = [];
      let allWeatherForecast: any[] = [];

      for (const field of fieldsData) {
        try {
          // Calculate harvest plan
          const harvestResponse = await fetch(API_ENDPOINTS.planHarvest, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              planting_date: field.planting_date,
              crop_type: field.crop_type
            })
          });

          if (!harvestResponse.ok) throw new Error('Failed to plan harvest');

          const harvestResult = await harvestResponse.json();
          
          if (harvestResult.success && harvestResult.harvest_plan) {
            plans.push({
              ...field,
              plan: harvestResult.harvest_plan
            });

            // Get NDVI trend for first field only
            if (plans.length === 1 && !allNdviData.length) {
              const ndviResponse = await fetch(API_ENDPOINTS.harvestNdviTrend, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  planting_date: field.planting_date,
                  crop_type: field.crop_type
                })
              });

              if (ndviResponse.ok) {
                const ndviResult = await ndviResponse.json();
                if (ndviResult.success && ndviResult.trend_data) {
                  allNdviData = ndviResult.trend_data;
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error planning harvest for field ${field.id}:`, error);
        }
      }

      setHarvestPlans(plans);
      
      // Set overall plan from first field
      if (plans.length > 0) {
        setOverallPlan(plans[0].plan);
        
        // Generate sample weather forecast if we have optimal days
        if (plans[0].plan.optimal_window_days && plans[0].plan.optimal_window_days.length > 0) {
          allWeatherForecast = plans[0].plan.optimal_window_days.map((day: any) => ({
            date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            temp: day.temperature,
            rain: day.rainfall,
            wind: day.wind_speed
          }));
        }
      }

      // Use defaults if no data
      if (allNdviData.length === 0) {
        allNdviData = [
          { date: "Sep 15", ndvi: 0.32, maturity: 25 },
          { date: "Sep 22", ndvi: 0.45, maturity: 38 },
          { date: "Sep 29", ndvi: 0.58, maturity: 52 },
          { date: "Oct 06", ndvi: 0.68, maturity: 65 },
          { date: "Oct 13", ndvi: 0.75, maturity: 78 },
          { date: "Oct 20", ndvi: 0.81, maturity: 88 },
          { date: "Oct 27", ndvi: 0.84, maturity: 94 },
          { date: "Nov 03", ndvi: 0.85, maturity: 98 },
          { date: "Nov 10", ndvi: 0.83, maturity: 96 },
        ];
      }

      if (allWeatherForecast.length === 0) {
        allWeatherForecast = [
          { date: "Oct 11", temp: 28, rain: 0, wind: 12 },
          { date: "Oct 12", temp: 29, rain: 0, wind: 10 },
          { date: "Oct 13", temp: 27, rain: 5, wind: 15 },
          { date: "Oct 14", temp: 26, rain: 2, wind: 18 },
          { date: "Oct 15", temp: 28, rain: 0, wind: 14 },
          { date: "Oct 16", temp: 29, rain: 0, wind: 11 },
          { date: "Oct 17", temp: 30, rain: 0, wind: 9 },
          { date: "Oct 18", temp: 28, rain: 0, wind: 12 },
          { date: "Oct 19", temp: 27, rain: 0, wind: 13 },
          { date: "Oct 20", temp: 29, rain: 0, wind: 10 },
          { date: "Oct 21", temp: 28, rain: 0, wind: 11 },
          { date: "Oct 22", temp: 26, rain: 8, wind: 22 },
          { date: "Oct 23", temp: 25, rain: 15, wind: 25 },
          { date: "Oct 24", temp: 27, rain: 3, wind: 18 },
        ];
      }

      setNdviData(allNdviData);
      setWeatherForecast(allWeatherForecast);

    } catch (error: any) {
      console.error('Error fetching harvest planning:', error);
      toast.error("Failed to load harvest planning data");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDateRange = (start: string, end: string) => {
    try {
      const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startDate} - ${endDate}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Smart Harvest Planning</h1>
            <p className="text-muted-foreground">Optimal harvest timing using satellite data and weather forecasts</p>
          </div>

          {!overallPlan ? (
            <Card className="shadow-medium">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No harvest planning data available. Add fields with planting dates to get started.</p>
                <Button variant="hero" className="mt-4" onClick={() => navigate('/fields')}>
                  Add Fields
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Optimal Harvest Window */}
              <Card className="shadow-strong mb-8 bg-gradient-subtle border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Badge variant="default" className="bg-success text-success-foreground mb-4 text-sm px-4 py-1">
                      Recommended Harvest Window
                    </Badge>
                    <div className="text-5xl font-bold text-foreground mb-2">
                      {formatDateRange(overallPlan.optimal_start_date, overallPlan.optimal_end_date)}
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                      {overallPlan.recommendation || "Peak maturity with favorable weather conditions"}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <Leaf className="w-5 h-5 text-success" />
                        <span className="font-medium">{overallPlan.maturity_percentage}% Crop Maturity</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Sun className="w-5 h-5 text-warning" />
                        <span className="font-medium">{overallPlan.current_stage}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <TrendingUp className="w-5 h-5 text-info" />
                        <span className="font-medium">{overallPlan.harvest_readiness}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Crop Maturity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{overallPlan.maturity_percentage}%</div>
                    <p className="text-xs text-muted-foreground mt-1">current stage</p>
                    <Badge variant="default" className="bg-success text-success-foreground mt-2">
                      {overallPlan.current_stage}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Days to Peak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{overallPlan.days_remaining}</div>
                    <p className="text-xs text-muted-foreground mt-1">days remaining</p>
                    <Badge variant="default" className="bg-info text-info-foreground mt-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {overallPlan.maturity_date ? new Date(overallPlan.maturity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Weather Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{overallPlan.weather_risk || 'Medium'}</div>
                    <p className="text-xs text-muted-foreground mt-1">14-day outlook</p>
                    <Badge variant="default" className={getRiskColor(overallPlan.weather_risk) + " mt-2"}>
                      {overallPlan.weather_risk === 'low' ? 'Favorable' : overallPlan.weather_risk === 'high' ? 'Risky' : 'Moderate'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Harvest Readiness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-success">{overallPlan.harvest_readiness}</div>
                    <p className="text-xs text-muted-foreground mt-1">status</p>
                    <Button variant="hero" size="sm" className="mt-2 w-full">
                      Schedule Harvest
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* NDVI & Maturity Curve */}
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-success" />
                      Crop Maturity Analysis (NDVI)
                    </CardTitle>
                    <CardDescription>
                      Satellite-based vegetation index and maturity progression
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={ndviData}>
                        <defs>
                          <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                        <Legend />
                        <ReferenceLine yAxisId="right" y={95} stroke="hsl(var(--warning))" strokeDasharray="3 3" label="Optimal" />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="ndvi" 
                          stroke="hsl(var(--success))" 
                          fill="url(#ndviGradient)"
                          name="NDVI Index"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="maturity" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          name="Maturity %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-4 p-3 bg-success/10 rounded-lg">
                      <p className="text-xs text-foreground">
                        <strong>Analysis:</strong> Current maturity at {overallPlan.maturity_percentage}%. {overallPlan.recommendation || "Monitor progress regularly."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Weather Forecast */}
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CloudRain className="w-5 h-5 text-info" />
                      14-Day Weather Forecast
                    </CardTitle>
                    <CardDescription>
                      Temperature, rainfall, and wind conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={weatherForecast}>
                        <defs>
                          <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                        <Legend />
                        <Area 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="rain" 
                          stroke="hsl(var(--info))" 
                          fill="url(#rainGradient)"
                          name="Rainfall (mm)"
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="temp" 
                          stroke="hsl(var(--warning))" 
                          strokeWidth={2}
                          name="Temperature (°C)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className={`mt-4 p-3 rounded-lg border ${overallPlan.weather_risk === 'high' ? 'bg-warning/10 border-warning/20' : 'bg-success/10 border-success/20'}`}>
                      <p className="text-xs text-foreground">
                        <strong>{overallPlan.weather_risk === 'high' ? 'Alert:' : 'Status:'}</strong> {overallPlan.recommendation || "Conditions look favorable for harvest."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Field-Specific Recommendations */}
              {harvestPlans.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {harvestPlans.slice(0, 3).map((fieldPlan, idx) => (
                    <Card key={fieldPlan.id || idx} className="shadow-medium">
                      <CardHeader>
                        <CardTitle className="text-lg">{fieldPlan.name || `Field ${String.fromCharCode(65 + idx)}`}</CardTitle>
                        <CardDescription>{fieldPlan.area_acres} acres • {fieldPlan.crop_type}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Maturity Status</span>
                            <Badge variant="default" className={fieldPlan.plan.maturity_percentage >= 90 ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                              {fieldPlan.plan.maturity_percentage}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Optimal Harvest</span>
                            <span className="font-semibold text-foreground">
                              {formatDateRange(fieldPlan.plan.optimal_start_date, fieldPlan.plan.optimal_end_date)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Weather Window</span>
                            <Badge variant="default" className={getRiskColor(fieldPlan.plan.weather_risk)}>
                              {fieldPlan.plan.weather_risk === 'low' ? 'Excellent' : fieldPlan.plan.weather_risk === 'medium' ? 'Good' : 'Risky'}
                            </Badge>
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg ${fieldPlan.plan.maturity_percentage >= 90 ? 'bg-success/10' : 'bg-warning/10 border border-warning/20'}`}>
                          <p className="text-xs font-semibold text-foreground mb-1">Recommendation</p>
                          <p className="text-xs text-foreground">
                            {fieldPlan.plan.recommendation || `Crop progressing well. Plan harvest for optimal window.`}
                          </p>
                        </div>

                        <Button variant="hero" size="sm" className="w-full">
                          Schedule {fieldPlan.name || `Field ${String.fromCharCode(65 + idx)}`} Harvest
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Weather Details & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detailed Weather Conditions */}
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle>Detailed Weather Conditions</CardTitle>
                    <CardDescription>
                      Key factors affecting harvest timing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Sun className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">Temperature</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Monitor temperature during harvest window. Optimal range 20-32°C for best quality.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Droplets className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">Rainfall</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Plan harvest during dry periods to avoid quality loss and reduce post-harvest challenges.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Wind className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">Wind Speed</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Moderate winds are suitable for harvest. Avoid high wind conditions above 25 km/h.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                      <Calendar className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">Best Days</p>
                        <p className="text-xs text-foreground mt-1">
                          <strong>Recommended window:</strong> {formatDateRange(overallPlan.optimal_start_date, overallPlan.optimal_end_date)}. Clear conditions expected.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Factors & Alerts */}
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      Risk Assessment & Alerts
                    </CardTitle>
                    <CardDescription>
                      Factors to monitor before harvest
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`p-3 rounded-lg border ${overallPlan.weather_risk === 'low' ? 'bg-success/10 border-success/20' : overallPlan.weather_risk === 'high' ? 'bg-destructive/10 border-destructive/20' : 'bg-warning/10 border-warning/20'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${overallPlan.weather_risk === 'low' ? 'bg-success' : overallPlan.weather_risk === 'high' ? 'bg-destructive' : 'bg-warning'}`}></div>
                        <p className="font-semibold text-sm text-foreground">Overall Risk: {overallPlan.weather_risk || 'Medium'}</p>
                      </div>
                      <p className="text-xs text-foreground">
                        {overallPlan.weather_risk === 'low' 
                          ? "Conditions are favorable for harvest. No major risks identified."
                          : overallPlan.weather_risk === 'high'
                          ? "Significant weather risks detected. Consider postponing harvest or taking precautions."
                          : "Moderate conditions. Monitor closely and plan harvest during optimal windows."}
                      </p>
                    </div>

                    <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-4 h-4 text-info" />
                        <p className="font-semibold text-sm text-foreground">Maturity Status</p>
                      </div>
                      <p className="text-xs text-foreground">
                        Crop at {overallPlan.maturity_percentage}% maturity ({overallPlan.current_stage}). {overallPlan.days_remaining} days remaining until peak.
                      </p>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-foreground" />
                        <p className="font-semibold text-sm text-foreground">Recommendation</p>
                      </div>
                      <p className="text-xs text-foreground">
                        {overallPlan.recommendation || "Continue monitoring crop development and weather conditions."}
                      </p>
                    </div>

                    <Button variant="outline" className="w-full">
                      Set Harvest Reminders
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HarvestPlanning;
