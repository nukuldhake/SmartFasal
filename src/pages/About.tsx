import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About Smart Fasal
            </h1>
            <p className="text-xl text-muted-foreground">
              Empowering farmers with AI-driven precision agriculture
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <Card className="shadow-medium mb-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  Smart Fasal is dedicated to democratizing precision agriculture technology for farmers across Maharashtra. 
                  We believe that advanced agricultural insights shouldn't be limited to large corporations—every farmer 
                  deserves access to data-driven tools that can help them optimize yields, reduce waste, and farm more sustainably.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="shadow-soft text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    Cutting-edge AI models tailored for Indian agriculture
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Accessibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Simple interfaces designed for farmers of all tech levels
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    Real results that increase yields and reduce costs
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-medium">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">What We Do</h2>
                <p className="text-muted-foreground mb-4">
                  Smart Fasal provides four core AI-powered services:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Predictive Yield Analytics:</strong> Forecast your crop yield with high accuracy using soil, weather, and historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Real-Time Pest & Disease Detection:</strong> Upload crop photos and get instant diagnosis with treatment recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Field Efficiency Benchmarking:</strong> Compare your resource usage with regional averages and identify optimization opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Smart Harvest Scheduling:</strong> Determine the optimal harvest window using satellite imagery and weather forecasts</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
