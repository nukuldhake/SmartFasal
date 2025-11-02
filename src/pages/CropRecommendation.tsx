import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import { 
  Leaf, Sparkles, TrendingUp, Droplets, Cloud, Sun, 
  Wind, CheckCircle, AlertCircle, Info, Activity 
} from "lucide-react";
import { toast } from "sonner";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { API_ENDPOINTS } from "@/config/api";

interface CropRecommendation {
  crop: string;
  confidence: number;
  suitability: number;
  expected_yield: number;
  profit_potential: "High" | "Medium" | "Low";
  reasons: string[];
  market_demand: "High" | "Medium" | "Low";
}

const CropRecommendationPage = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    nitrogen: [50],
    phosphorus: [40],
    potassium: [40],
    ph: [6.5],
    temperature: [25],
    humidity: [80],
    rainfall: [200]
  });

  const handleRecommendation = async () => {
    setLoading(true);
    
    try {
      // Call FastAPI backend for crop recommendation
      const response = await fetch(API_ENDPOINTS.recommendCrop, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          N: formData.nitrogen[0],
          P: formData.phosphorus[0],
          K: formData.potassium[0],
          ph: formData.ph[0],
          temperature: formData.temperature[0],
          humidity: formData.humidity[0],
          rainfall: formData.rainfall[0]
        })
      });

      if (!response.ok) {
        throw new Error('Recommendation failed');
      }

      const result = await response.json();
      
      // Use ML model results from backend
      if (result.success && result.recommendations) {
        setRecommendations(result.recommendations);
        toast.success("AI-powered crop recommendations generated!");
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: unknown) {
      console.error('Error getting recommendations:', error);
      toast.error("Failed to get recommendations. Using mock data.");
      
      // Use mock data on error
      const mockRecommendations: CropRecommendation[] = [
        {
          crop: "Rice",
          confidence: 95,
          suitability: 92,
          expected_yield: 35,
          profit_potential: "High",
          market_demand: "High",
          reasons: [
            "Optimal pH and nutrient levels for rice cultivation",
            "Favorable temperature and humidity conditions",
            "Adequate rainfall for kharif season",
            "High market demand in your region"
          ]
        },
        {
          crop: "Maize",
          confidence: 87,
          suitability: 85,
          expected_yield: 28,
          profit_potential: "High",
          market_demand: "Medium",
          reasons: [
            "Good nitrogen levels support maize growth",
            "Temperature range is ideal for corn cultivation",
            "Moderate rainfall suitable for maize"
          ]
        }
      ];
      setRecommendations(mockRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const getProfitColor = (profit: string) => {
    switch (profit) {
      case "High": return "bg-success text-success-foreground";
      case "Medium": return "bg-warning text-warning-foreground";
      case "Low": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted";
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "High": return "text-success";
      case "Medium": return "text-warning";
      case "Low": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  // Prepare radar chart data
  const radarData = recommendations.length > 0 ? [
    {
      parameter: "Nitrogen",
      value: (formData.nitrogen[0] / 100) * 100,
    },
    {
      parameter: "Phosphorus",
      value: (formData.phosphorus[0] / 100) * 100,
    },
    {
      parameter: "Potassium",
      value: (formData.potassium[0] / 100) * 100,
    },
    {
      parameter: "pH",
      value: (formData.ph[0] / 14) * 100,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Crop Recommendation</h1>
            <p className="text-muted-foreground">Get AI-powered crop suggestions based on your soil and weather conditions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
            {/* Input Form */}
            <Card className="lg:col-span-1 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Soil & Weather Parameters
                </CardTitle>
                <CardDescription>
                  Enter your field conditions for personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nitrogen */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-info" />
                      Nitrogen (N)
                    </Label>
                    <span className="text-sm font-medium">{formData.nitrogen[0]} ppm</span>
                  </div>
                  <Slider
                    value={formData.nitrogen}
                    onValueChange={(value) => setFormData({...formData, nitrogen: value})}
                    min={0}
                    max={150}
                    step={1}
                  />
                </div>

                {/* Phosphorus */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-success" />
                      Phosphorus (P)
                    </Label>
                    <span className="text-sm font-medium">{formData.phosphorus[0]} ppm</span>
                  </div>
                  <Slider
                    value={formData.phosphorus}
                    onValueChange={(value) => setFormData({...formData, phosphorus: value})}
                    min={0}
                    max={150}
                    step={1}
                  />
                </div>

                {/* Potassium */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-warning" />
                      Potassium (K)
                    </Label>
                    <span className="text-sm font-medium">{formData.potassium[0]} ppm</span>
                  </div>
                  <Slider
                    value={formData.potassium}
                    onValueChange={(value) => setFormData({...formData, potassium: value})}
                    min={0}
                    max={150}
                    step={1}
                  />
                </div>

                {/* pH */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Soil pH
                    </Label>
                    <span className="text-sm font-medium">{formData.ph[0]}</span>
                  </div>
                  <Slider
                    value={formData.ph}
                    onValueChange={(value) => setFormData({...formData, ph: value})}
                    min={4}
                    max={10}
                    step={0.1}
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-warning" />
                      Temperature
                    </Label>
                    <span className="text-sm font-medium">{formData.temperature[0]}°C</span>
                  </div>
                  <Slider
                    value={formData.temperature}
                    onValueChange={(value) => setFormData({...formData, temperature: value})}
                    min={10}
                    max={40}
                    step={0.5}
                  />
                </div>

                {/* Humidity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-info" />
                      Humidity
                    </Label>
                    <span className="text-sm font-medium">{formData.humidity[0]}%</span>
                  </div>
                  <Slider
                    value={formData.humidity}
                    onValueChange={(value) => setFormData({...formData, humidity: value})}
                    min={20}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Rainfall */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-primary" />
                      Rainfall
                    </Label>
                    <span className="text-sm font-medium">{formData.rainfall[0]} mm</span>
                  </div>
                  <Slider
                    value={formData.rainfall}
                    onValueChange={(value) => setFormData({...formData, rainfall: value})}
                    min={50}
                    max={400}
                    step={5}
                  />
                </div>

                <Button 
                  variant="hero" 
                  className="w-full" 
                  onClick={handleRecommendation}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="lg:col-span-2 shadow-medium lg:h-[calc(100vh-180px)]">
              {recommendations.length === 0 ? (
                <CardContent className="py-16">
                  <div className="text-center">
                    <Leaf className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Get AI-Powered Crop Recommendations
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Enter your soil and weather parameters and click "Get Recommendations" 
                      to receive personalized crop suggestions optimized for your conditions.
                    </p>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader className="pb-4 sticky top-0 bg-background border-b z-10">
                    <CardTitle>AI Recommendations</CardTitle>
                    <CardDescription>Ranked by suitability and profit potential</CardDescription>
                  </CardHeader>
                  <div className="overflow-y-auto h-[calc(100%-120px)] px-6 py-4">
                    <div className="space-y-4 pb-4">
                      {/* All Recommendations including Top */}
                      {recommendations.map((rec, idx) => (
                        <Card key={idx} className={`border ${idx === 0 ? 'bg-gradient-subtle border-primary/20 shadow-strong' : ''}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-semibold capitalize ${idx === 0 ? 'text-2xl' : 'text-lg'}`}>{rec.crop}</h3>
                                  {idx === 0 ? (
                                    <Badge variant="default" className="bg-primary text-primary-foreground">
                                      Top Pick
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">
                                      #{idx + 1}
                                    </Badge>
                                  )}
                                  <Badge variant="default" className={getProfitColor(rec.profit_potential)}>
                                    {rec.profit_potential}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Confidence: {rec.confidence}% • Suitability: {rec.suitability}%
                                </p>
                              </div>
                            </div>
                            
                            <div className={`grid gap-4 mb-3 ${idx === 0 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
                              <div>
                                <p className="text-xs text-muted-foreground">Expected Yield</p>
                                <p className={`font-bold ${idx === 0 ? 'text-2xl' : 'text-lg'}`}>{rec.expected_yield} q/ac</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Market Demand</p>
                                <p className={`font-bold ${idx === 0 ? 'text-2xl' : 'text-lg'} ${getDemandColor(rec.market_demand)}`}>
                                  {rec.market_demand}
                                </p>
                              </div>
                              {idx === 0 && (
                                <>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Confidence</p>
                                    <p className="text-2xl font-bold">{rec.confidence}%</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Suitability</p>
                                    <p className="text-2xl font-bold">{rec.suitability}%</p>
                                  </div>
                                </>
                              )}
                              {idx > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Profit Potential</p>
                                  <p className="text-lg font-bold">{rec.profit_potential}</p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className={`font-medium text-foreground ${idx === 0 ? 'text-sm' : 'text-xs'}`}>
                                {idx === 0 ? 'Why this crop?' : 'Key Benefits:'}
                              </h4>
                              <ul className={`space-y-1 ${idx === 0 ? '' : ''}`}>
                                {rec.reasons.map((reason, rIdx) => (
                                  <li key={rIdx} className={`flex items-start gap-2 text-muted-foreground ${idx === 0 ? 'text-sm' : 'text-xs'}`}>
                                    <CheckCircle className={`text-success mt-0.5 flex-shrink-0 ${idx === 0 ? 'w-4 h-4' : 'w-3 h-3'}`} />
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Nutrient Analysis Chart */}
          {radarData.length > 0 && (
            <Card className="shadow-medium mt-6">
              <CardHeader>
                <CardTitle>Soil Nutrient Analysis</CardTitle>
                <CardDescription>Current nutrient levels vs optimal ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="parameter" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Current Level" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Accurate Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI analyzes 2,200+ data points to provide precise crop suggestions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Maximize Yield</h3>
                    <p className="text-sm text-muted-foreground">
                      Recommendations based on optimal growing conditions for maximum productivity
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Risk Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Understand potential challenges and factors affecting each crop's success
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CropRecommendationPage;

