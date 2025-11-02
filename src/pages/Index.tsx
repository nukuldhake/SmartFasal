import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Bug, Calendar, Droplets } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-farm.jpg";
import yieldIcon from "@/assets/icon-yield.jpg";
import cropHealthIcon from "@/assets/icon-crop-health.jpg";
import harvestIcon from "@/assets/icon-harvest.jpg";
import efficiencyIcon from "@/assets/icon-efficiency.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Agricultural fields" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Precision Farming,
              <span className="bg-gradient-hero bg-clip-text text-transparent"> Powered by AI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transform your farm with data-driven insights. Predict yields, detect diseases early, optimize resources, and harvest at the perfect time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="hero" className="gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Four AI-Powered Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make smarter farming decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <img src={yieldIcon} alt="Crop Recommendation" className="w-16 h-16 mb-4 rounded-lg" />
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Crop Recommendation
                </CardTitle>
                <CardDescription>
                  Get AI-powered crop suggestions based on your soil nutrients, pH, weather, and regional conditions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <img src={cropHealthIcon} alt="Crop Health" className="w-16 h-16 mb-4 rounded-lg" />
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-primary" />
                  Disease Detection
                </CardTitle>
                <CardDescription>
                  Upload crop images for instant pest and disease identification with 90%+ accuracy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <img src={efficiencyIcon} alt="Field Efficiency" className="w-16 h-16 mb-4 rounded-lg" />
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  Field Efficiency
                </CardTitle>
                <CardDescription>
                  Benchmark your irrigation and nutrient use against regional averages
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <img src={harvestIcon} alt="Harvest Scheduling" className="w-16 h-16 mb-4 rounded-lg" />
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Harvest Timing
                </CardTitle>
                <CardDescription>
                  Identify optimal harvest windows using satellite data and weather forecasts
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple 3-Step Process
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Your Fields</h3>
              <p className="text-muted-foreground">
                Draw field boundaries on our interactive map and specify crop types
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get AI Insights</h3>
              <p className="text-muted-foreground">
                Receive personalized recommendations based on your field data
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Take Action</h3>
              <p className="text-muted-foreground">
                Implement data-driven decisions to maximize yield and efficiency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-earth">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join farmers across Maharashtra who are already using Smart Fasal to increase yields and reduce waste
          </p>
          <Link to="/auth">
            <Button size="lg" variant="hero" className="gap-2">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/30 border-t border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Smart Fasal</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered precision farming for Maharashtra farmers
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link></li>
                <li><Link to="/fields" className="text-muted-foreground hover:text-primary">My Fields</Link></li>
                <li><Link to="/crop-health" className="text-muted-foreground hover:text-primary">Crop Health</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 Smart Fasal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
