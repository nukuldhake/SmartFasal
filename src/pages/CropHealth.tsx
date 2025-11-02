import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, RefreshCw, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";

const CropHealth = () => {
  const [uploading, setUploading] = useState(false);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
      fetchFields();
      fetchStatistics();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('crop_health_analysis')
        .select('*')
        .order('analyzed_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Error fetching analyses:', error);
    }
  };

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .order('name');

      if (error) throw error;
      setFields(data || []);
    } catch (error: any) {
      console.error('Error fetching fields:', error);
    }
  };

  const fetchStatistics = async () => {
    if (!user) return;
    
    setLoadingStats(true);
    try {
      const { data, error } = await supabase
        .from('crop_health_analysis')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching analyses:', error);
        throw error;
      }
      
      console.log('Fetched analyses:', data);

      // Calculate statistics
      const totalAnalyses = data?.length || 0;
      const healthyCount = data?.filter(a => 
        a.diagnosis?.toLowerCase() === 'healthy' || 
        a.diagnosis?.toLowerCase().includes('healthy')
      ).length || 0;
      const diseaseCount = totalAnalyses - healthyCount;
      const healthPercentage = totalAnalyses > 0 ? (healthyCount / totalAnalyses) * 100 : 0;

      // Severity distribution
      const severityDist = {
        low: data?.filter(a => a.severity === 'low').length || 0,
        medium: data?.filter(a => a.severity === 'medium').length || 0,
        high: data?.filter(a => a.severity === 'high').length || 0
      };

      // Crop distribution
      const cropDist: { [key: string]: number } = {};
      data?.forEach(analysis => {
        // Extract crop from diagnosis if crop_type doesn't exist
        const crop = analysis.crop_type || analysis.diagnosis?.split(' ')[0] || 'Unknown';
        cropDist[crop] = (cropDist[crop] || 0) + 1;
      });

      setStatistics({
        totalAnalyses,
        healthyCount,
        diseaseCount,
        healthPercentage,
        severityDist,
        cropDist,
        recentAnalyses: data?.slice(0, 5) || []
      });
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !session) {
      toast.error("Please log in to upload images");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, BMP)");
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Convert file to base64 for backend
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:image/...;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      toast.info("Analyzing crop image with AI...");

      // Call the FastAPI backend
      const response = await fetch(API_ENDPOINTS.analyzeCrop, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: base64Image,
          field_id: selectedField || null,
          crop_type: fields.find(f => f.id === selectedField)?.crop_type || null,
          user_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.detail || 'Analysis failed');
      }

      toast.success("Analysis complete!");
      
      // Upload image to Supabase Storage
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue even if upload fails - we still have the analysis
      }
      
      // Get public URL for the image
      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);
      
      // Save analysis to Supabase
      const analysisData = {
        user_id: user.id,
        field_id: selectedField || null,
        image_url: uploadData ? publicUrl : '',
        diagnosis: result.analysis.top_prediction.disease,
        confidence: result.analysis.top_prediction.confidence * 100,
        severity: result.analysis.severity,
        treatment_recommendation: result.analysis.recommendations.join('; ')
      };
      
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('crop_health_analysis')
        .insert(analysisData)
        .select()
        .single();
      
      if (saveError) {
        console.error('Error saving analysis:', saveError);
        console.error('Analysis data:', analysisData);
        toast.error("Analysis complete but failed to save to database");
      } else {
        console.log('Analysis saved successfully:', savedAnalysis);
        setAnalyses([savedAnalysis, ...analyses]);
        toast.success("Analysis saved!");
      }
      
      // Set current analysis for detailed view
      setCurrentAnalysis(result.analysis);
      
      // Refresh statistics
      fetchStatistics();
      
      setImagePreview(null);
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 px-4">
          <div className="container mx-auto text-center">
            <p>Loading...</p>
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Crop Health Analysis</h1>
            <p className="text-muted-foreground">Upload crop images for AI-powered pest and disease detection</p>
          </div>

          {/* Statistics Overview */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                      <p className="text-2xl font-bold text-foreground">{statistics.totalAnalyses}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                      <p className="text-2xl font-bold text-success">{statistics.healthPercentage.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                  <Progress value={statistics.healthPercentage} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card className="shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Healthy Crops</p>
                      <p className="text-2xl font-bold text-success">{statistics.healthyCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Diseased Crops</p>
                      <p className="text-2xl font-bold text-destructive">{statistics.diseaseCount}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Crop Image
                </CardTitle>
                <CardDescription>
                  Take a clear photo of the affected crop area
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Field (Optional)</Label>
                    <Select value={selectedField} onValueChange={setSelectedField}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name} ({field.crop_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="crop-image"
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="crop-image" 
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            PNG, JPG or JPEG (max. 10MB)
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                  <div className="flex gap-3 mt-4">
                    <Button 
                      variant="hero" 
                      disabled={uploading} 
                      type="button"
                      onClick={() => document.getElementById('crop-image')?.click()}
                      className="flex-1"
                    >
                      {uploading ? "Analyzing..." : "Select Image"}
                    </Button>
                    <Button 
                      variant="outline" 
                      disabled={uploading || !imagePreview} 
                      type="button"
                      onClick={() => {
                        if (imagePreview) {
                          // Trigger analysis for the current preview
                          const fileInput = document.getElementById('crop-image') as HTMLInputElement;
                          if (fileInput?.files?.[0]) {
                            handleFileUpload({ target: { files: [fileInput.files[0]] } } as any);
                          }
                        }
                      }}
                      className="flex-1"
                    >
                      {uploading ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">Tips for best results:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Take photos in natural daylight</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Focus on affected areas or suspicious spots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Include surrounding healthy plants for comparison</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Current Analysis Results */}
            {currentAnalysis && (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Latest Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed results from your most recent upload
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    currentAnalysis.severity === 'high' 
                      ? 'bg-destructive/10 border-destructive/20'
                      : currentAnalysis.severity === 'medium'
                      ? 'bg-warning/10 border-warning/20'
                      : 'bg-success/10 border-success/20'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {currentAnalysis.top_prediction.crop} - {currentAnalysis.top_prediction.disease}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {(currentAnalysis.top_prediction.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <Badge 
                        variant="default" 
                        className={
                          currentAnalysis.severity === 'high'
                            ? 'bg-destructive'
                            : currentAnalysis.severity === 'medium'
                            ? 'bg-warning'
                            : 'bg-success'
                        }
                      >
                        {currentAnalysis.severity}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-foreground">Recommendations:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {currentAnalysis.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-success mt-1 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Analysis Results */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Analyses</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchAnalyses}
                    disabled={uploading}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Your latest crop health assessments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No analyses yet. Upload an image to get started!
                  </p>
                ) : (
                  analyses.slice(0, 5).map((analysis) => (
                    <div 
                      key={analysis.id}
                      className={`p-4 rounded-lg border ${
                        analysis.severity === 'high' 
                          ? 'bg-destructive/10 border-destructive/20'
                          : analysis.severity === 'medium'
                          ? 'bg-warning/10 border-warning/20'
                          : 'bg-success/10 border-success/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{analysis.diagnosis}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(analysis.analyzed_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant="default" 
                          className={
                            analysis.severity === 'high'
                              ? 'bg-destructive'
                              : analysis.severity === 'medium'
                              ? 'bg-warning'
                              : 'bg-success'
                          }
                        >
                          {analysis.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-2">
                        {analysis.treatment_recommendation}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {analysis.confidence}%
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CropHealth;
