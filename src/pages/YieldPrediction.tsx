import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { BarChart3, TrendingUp, Cloud, Droplets, Wind, Sun, Calendar } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const historicalData = [
  { year: "2020", actual: 38.5, predicted: 40.2 },
  { year: "2021", actual: 42.1, predicted: 41.8 },
  { year: "2022", actual: 39.8, predicted: 39.5 },
  { year: "2023", actual: 43.2, predicted: 43.8 },
  { year: "2024", actual: 41.5, predicted: 41.2 },
  { year: "2025", actual: null, predicted: 45.2 },
];

const weeklyForecast = [
  { week: "Week 1", yield: 38.2 },
  { week: "Week 2", yield: 39.5 },
  { week: "Week 3", yield: 41.0 },
  { week: "Week 4", yield: 42.8 },
  { week: "Week 5", yield: 44.1 },
  { week: "Week 6", yield: 45.2 },
];

const YieldPrediction = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Yield Prediction Analytics</h1>
            <p className="text-muted-foreground">AI-powered forecasts based on soil, weather, and historical data</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Predicted Yield</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">45.2</div>
                <p className="text-xs text-muted-foreground mt-1">quintals per acre</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+12% vs last season</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">94%</div>
                <p className="text-xs text-muted-foreground mt-1">prediction accuracy</p>
                <Progress value={94} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">488</div>
                <p className="text-xs text-muted-foreground mt-1">quintals (all fields)</p>
                <Badge variant="secondary" className="mt-2">Above Target</Badge>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Harvest Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">Nov 02</div>
                <p className="text-xs text-muted-foreground mt-1">2025 (estimated)</p>
                <Badge variant="default" className="bg-info text-info-foreground mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  22 days
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Historical Accuracy */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Historical Prediction Accuracy
                </CardTitle>
                <CardDescription>
                  Comparison of predicted vs actual yield over past years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      name="Actual Yield"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted Yield"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Yield Growth Trajectory
                </CardTitle>
                <CardDescription>
                  Projected yield development over next 6 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyForecast}>
                    <defs>
                      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="yield" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#yieldGradient)"
                      name="Projected Yield"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contributing Factors */}
            <Card className="shadow-medium lg:col-span-2">
              <CardHeader>
                <CardTitle>Yield Contributing Factors</CardTitle>
                <CardDescription>
                  AI analysis of factors influencing your predicted yield
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-info" />
                      Soil Quality & Moisture
                    </span>
                    <span className="font-semibold text-success">Excellent (8.5/10)</span>
                  </div>
                  <Progress value={85} />
                  <p className="text-xs text-muted-foreground">
                    Optimal pH levels and moisture retention. Nutrient availability high.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-info" />
                      Weather Conditions
                    </span>
                    <span className="font-semibold text-success">Favorable (8.8/10)</span>
                  </div>
                  <Progress value={88} />
                  <p className="text-xs text-muted-foreground">
                    Ideal temperature range and rainfall distribution. Minimal extreme weather risk.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-info" />
                      Historical Performance
                    </span>
                    <span className="font-semibold text-success">Strong (9.2/10)</span>
                  </div>
                  <Progress value={92} />
                  <p className="text-xs text-muted-foreground">
                    Consistent high yields in past 3 seasons. Field management practices effective.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Sun className="w-4 h-4 text-info" />
                      Crop Growth Stage
                    </span>
                    <span className="font-semibold text-success">On Track (7.8/10)</span>
                  </div>
                  <Progress value={78} />
                  <p className="text-xs text-muted-foreground">
                    Development slightly ahead of schedule. No stress indicators detected.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Wind className="w-4 h-4 text-info" />
                      Management Practices
                    </span>
                    <span className="font-semibold text-success">Optimal (8.3/10)</span>
                  </div>
                  <Progress value={83} />
                  <p className="text-xs text-muted-foreground">
                    Fertilizer and irrigation timing appropriate. Pest management proactive.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Field Breakdown */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Field-by-Field Breakdown</CardTitle>
                <CardDescription>
                  Individual yield predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">Field A</h4>
                      <p className="text-xs text-muted-foreground">North Plot • 5.2 acres</p>
                    </div>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      High
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground">235</div>
                  <p className="text-xs text-muted-foreground">quintals total (45.2/acre)</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">Field B</h4>
                      <p className="text-xs text-muted-foreground">South Plot • 3.8 acres</p>
                    </div>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      High
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground">168</div>
                  <p className="text-xs text-muted-foreground">quintals total (44.2/acre)</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">Field C</h4>
                      <p className="text-xs text-muted-foreground">East Plot • 2.5 acres</p>
                    </div>
                    <Badge variant="secondary">
                      Medium
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground">85</div>
                  <p className="text-xs text-muted-foreground">quintals total (34.0/acre)</p>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All Fields
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card className="shadow-medium mt-6">
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Actions to optimize your predicted yield
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <h4 className="font-semibold text-foreground mb-2">Continue Current Strategy</h4>
                <p className="text-sm text-foreground">
                  Your current fertilizer schedule and irrigation practices are optimal. Maintain the current approach through harvest.
                </p>
              </div>

              <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                <h4 className="font-semibold text-foreground mb-2">Monitor Weather Patterns</h4>
                <p className="text-sm text-foreground">
                  Light rain expected next week. This will benefit crop development. No irrigation adjustments needed.
                </p>
              </div>

              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <h4 className="font-semibold text-foreground mb-2">Field C Optimization</h4>
                <p className="text-sm text-foreground">
                  Field C showing slightly lower yield potential. Consider supplemental nitrogen application in next 2 weeks to boost vegetable growth.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default YieldPrediction;