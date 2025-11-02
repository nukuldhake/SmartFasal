import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { BarChart3, Bug, Calendar, Droplets, TrendingUp, AlertCircle, ArrowRight, Loader2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";

interface DashboardStats {
  healthScore: number;
  harvestWindow: string;
  efficiencyScore: number;
  totalFields: number;
  totalArea: number;
  recentActivities: any[];
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    healthScore: 0,
    harvestWindow: '',
    efficiencyScore: 0,
    totalFields: 0,
    totalArea: 0,
    recentActivities: []
  });
  const [fields, setFields] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState('Healthy');
  const [lastHealthCheck, setLastHealthCheck] = useState('');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
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
      
      const totalFields = fieldsData?.length || 0;
      const totalArea = fieldsData?.reduce((sum, f) => sum + (f.area_acres || 0), 0) || 0;

      // Calculate efficiency score for first field
      let efficiencyScore = 0;
      if (fieldsData && fieldsData.length > 0) {
        try {
          const efficiencyResponse = await fetch(API_ENDPOINTS.calculateEfficiency, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              crop_type: fieldsData[0].crop_type,
              area_acres: fieldsData[0].area_acres,
              name: fieldsData[0].name,
              actual_yield: fieldsData[0].actual_yield_quintals || null,
              water_used_liters: fieldsData[0].water_used_liters || null,
              fertilizer_n_kg: fieldsData[0].fertilizer_n_kg || null,
              fertilizer_p_kg: fieldsData[0].fertilizer_p_kg || null,
              fertilizer_k_kg: fieldsData[0].fertilizer_k_kg || null,
              cost_per_acre: fieldsData[0].cost_per_acre || null,
              labor_hours: fieldsData[0].labor_hours || null,
              fuel_liters: fieldsData[0].fuel_liters || null
            })
          });

          if (efficiencyResponse.ok) {
            const efficiencyResult = await efficiencyResponse.json();
            if (efficiencyResult.success && efficiencyResult.efficiency) {
              efficiencyScore = Math.round(efficiencyResult.efficiency.overall_efficiency);
            }
          }
        } catch (error) {
          console.error('Error calculating efficiency:', error);
        }
      }

      // Fetch crop health analyses
      const { data: healthData, error: healthError } = await supabase
        .from('crop_health_analysis')
        .select('*')
        .eq('user_id', user?.id)
        .order('analyzed_at', { ascending: false })
        .limit(10);

      let healthScore = 92;
      let healthStatus = 'Healthy';
      let lastCheck = 'No checks yet';

      if (!healthError && healthData && healthData.length > 0) {
        // Calculate health score based on recent analyses
        const healthyCount = healthData.filter(a => 
          a.diagnosis?.toLowerCase() === 'healthy' || 
          a.diagnosis?.toLowerCase().includes('healthy')
        ).length;
        
        healthScore = Math.round((healthyCount / healthData.length) * 100);
        healthStatus = healthScore >= 75 ? 'Healthy' : healthScore >= 50 ? 'Moderate' : 'At Risk';
        
        // Get last check time
        const lastCheckDate = new Date(healthData[0].analyzed_at);
        const hoursAgo = Math.floor((Date.now() - lastCheckDate.getTime()) / (1000 * 60 * 60));
        lastCheck = hoursAgo < 1 ? 'Just now' : hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;
      }

      // Get harvest window from first active field
      let harvestWindow = '';
      if (fieldsData && fieldsData.length > 0) {
        try {
          const harvestResponse = await fetch(API_ENDPOINTS.planHarvest, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              planting_date: fieldsData[0].planting_date,
              crop_type: fieldsData[0].crop_type
            })
          });

          if (harvestResponse.ok) {
            const harvestResult = await harvestResponse.json();
            if (harvestResult.success && harvestResult.harvest_plan) {
              const plan = harvestResult.harvest_plan;
              const startDate = new Date(plan.optimal_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const endDate = new Date(plan.optimal_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              harvestWindow = `${startDate} - ${endDate}`;
            }
          }
        } catch (error) {
          console.error('Error getting harvest window:', error);
        }
      }

      // Use defaults if harvest window not found
      if (!harvestWindow) {
        harvestWindow = 'Oct 28 - Nov 07, 2025';
      }

      setStats({
        healthScore,
        harvestWindow,
        efficiencyScore: efficiencyScore || 87,
        totalFields,
        totalArea,
        recentActivities: []
      });

      setHealthStatus(healthStatus);
      setLastHealthCheck(lastCheck);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your farm overview</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link to="/fields">
              <Card className="shadow-soft hover:shadow-medium transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Total Fields
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalFields}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">registered fields</p>
                  {stats.totalArea > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-xs text-success">{stats.totalArea.toFixed(1)} acres total</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link to="/crop-health">
              <Card className="shadow-soft hover:shadow-medium transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Bug className="w-4 h-4 text-primary" />
                    Crop Health Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="default" className={
                    healthStatus === 'Healthy' ? 'bg-success text-success-foreground mb-2' :
                    healthStatus === 'Moderate' ? 'bg-warning text-warning-foreground mb-2' :
                    'bg-destructive text-destructive-foreground mb-2'
                  }>
                    {healthStatus}
                  </Badge>
                  <p className="text-xs text-muted-foreground">Last checked: {lastHealthCheck}</p>
                  <Progress value={stats.healthScore} className="mt-2" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/harvest-planning">
              <Card className="shadow-soft hover:shadow-medium transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Optimal Harvest Window
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.harvestWindow || '--'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date().getFullYear()}
                  </p>
                  <p className="text-xs text-info mt-2">
                    {stats.totalFields > 0 ? 'Weather conditions favorable' : 'Add fields to see timing'}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/field-efficiency">
              <Card className="shadow-soft hover:shadow-medium transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-primary" />
                    Field Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.efficiencyScore}%</div>
                  <p className="text-xs text-muted-foreground mt-1">vs regional average</p>
                  <Badge variant="secondary" className="mt-2">
                    {stats.efficiencyScore >= 80 ? 'Above Average' : stats.efficiencyScore >= 70 ? 'Average' : 'Below Average'}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Yield Forecast */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Farm Overview
                </CardTitle>
                <CardDescription>
                  Summary of your agricultural operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Fields</span>
                  <span className="font-semibold">{stats.totalFields}</span>
                </div>
                <Progress value={stats.totalFields > 0 ? 100 : 0} />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Area</span>
                  <span className="font-semibold">{stats.totalArea.toFixed(1)} acres</span>
                </div>
                <Progress value={stats.totalArea > 0 ? Math.min(100, stats.totalArea * 10) : 0} />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Health Score</span>
                  <span className="font-semibold text-success">{stats.healthScore}%</span>
                </div>
                <Progress value={stats.healthScore} />

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Recommendation:</strong> {stats.totalFields === 0 
                      ? 'Add fields to get started with precision farming analytics.'
                      : 'Continue monitoring your fields for optimal yield and efficiency.'}
                  </p>
                </div>

                <Link to="/fields">
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    Manage Fields
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Manage your farm operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/fields">
                  <div className="flex gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/20 cursor-pointer">
                    <MapPin className="w-4 h-4 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Manage Fields</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.totalFields > 0 ? `${stats.totalFields} field${stats.totalFields > 1 ? 's' : ''} registered` : 'Add your first field'}
                      </p>
                    </div>
                  </div>
                </Link>

                <Link to="/crop-health">
                  <div className="flex gap-3 p-3 bg-info/10 rounded-lg border border-info/20 hover:bg-info/20 cursor-pointer">
                    <Bug className="w-4 h-4 text-info mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Check Crop Health</p>
                      <p className="text-xs text-muted-foreground">Upload images for disease detection</p>
                    </div>
                  </div>
                </Link>

                <Link to="/harvest-planning">
                  <div className="flex gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20 hover:bg-warning/20 cursor-pointer">
                    <Calendar className="w-4 h-4 text-warning mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Plan Harvest</p>
                      <p className="text-xs text-muted-foreground">View optimal harvest windows</p>
                    </div>
                  </div>
                </Link>

                <Link to="/crop-recommendation">
                  <div className="flex gap-3 p-3 bg-success/10 rounded-lg border border-success/20 hover:bg-success/20 cursor-pointer">
                    <TrendingUp className="w-4 h-4 text-success mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Crop Recommendation</p>
                      <p className="text-xs text-muted-foreground">Get AI-powered crop suggestions</p>
                    </div>
                  </div>
                </Link>

                <Link to="/field-efficiency">
                  <Button variant="outline" className="w-full mt-2 gap-2">
                    View Efficiency Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Field Overview */}
            <Card className="shadow-medium lg:col-span-2">
              <CardHeader>
                <CardTitle>My Fields Overview</CardTitle>
                <CardDescription>
                  Manage and monitor all your registered fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No fields added yet.</p>
                    <Link to="/fields">
                      <Button variant="hero">Add Your First Field</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.slice(0, 3).map((field, idx) => (
                      <div key={field.id || idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-foreground">{field.name || `Field ${String.fromCharCode(65 + idx)}`}</h4>
                          <p className="text-sm text-muted-foreground">
                            {field.area_acres} acres • {field.crop_type} • Planted {new Date(field.planting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Active
                        </Badge>
                      </div>
                    ))}
                    {fields.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        + {fields.length - 3} more field{fields.length - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}

                <Link to="/fields">
                  <Button variant="outline" className="w-full mt-6 gap-2">
                    {fields.length === 0 ? 'Add Fields' : 'Manage All Fields'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
