import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { MapPin, Plus, Edit, Trash2, Droplets, Package, TrendingUp, DollarSign, Users, Fuel } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Fields = () => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    crop_type: "",
    planting_date: "",
    area_acres: "",
    soil_type: "",
    irrigation_type: "",
    // Usage data for efficiency calculations
    water_used_liters: "",
    irrigation_method: "",
    fertilizer_n_kg: "",
    fertilizer_p_kg: "",
    fertilizer_k_kg: "",
    actual_yield_quintals: "",
    cost_per_acre: "",
    harvest_date: "",
    labor_hours: "",
    fuel_liters: "",
    notes: ""
  });
  const [showUsageData, setShowUsageData] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFields();
    }
  }, [user]);

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFields(data || []);
    } catch (error: any) {
      console.error('Error fetching fields:', error);
      toast.error("Failed to load fields");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to add fields");
      return;
    }

    try {
      // Helper function to parse optional number fields
      const parseOptionalNumber = (value: string) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      if (editingField) {
        // Update existing field
        const { data, error } = await supabase
          .from('fields')
          .update({
            name: formData.name,
            crop_type: formData.crop_type,
            planting_date: formData.planting_date,
            area_acres: parseFloat(formData.area_acres),
            soil_type: formData.soil_type || null,
            irrigation_type: formData.irrigation_type || null,
            // Usage data fields
            water_used_liters: parseOptionalNumber(formData.water_used_liters),
            irrigation_method: formData.irrigation_method || null,
            fertilizer_n_kg: parseOptionalNumber(formData.fertilizer_n_kg),
            fertilizer_p_kg: parseOptionalNumber(formData.fertilizer_p_kg),
            fertilizer_k_kg: parseOptionalNumber(formData.fertilizer_k_kg),
            actual_yield_quintals: parseOptionalNumber(formData.actual_yield_quintals),
            cost_per_acre: parseOptionalNumber(formData.cost_per_acre),
            harvest_date: formData.harvest_date || null,
            labor_hours: parseOptionalNumber(formData.labor_hours),
            fuel_liters: parseOptionalNumber(formData.fuel_liters),
            notes: formData.notes || null,
          })
          .eq('id', editingField.id)
          .select()
          .single();

        if (error) throw error;

        toast.success("Field updated successfully!");
        setFields(fields.map(f => f.id === editingField.id ? data : f));
        setEditingField(null);
      } else {
        // Add new field
        const { data, error } = await supabase
          .from('fields')
          .insert({
            user_id: user.id,
            name: formData.name,
            crop_type: formData.crop_type,
            planting_date: formData.planting_date,
            area_acres: parseFloat(formData.area_acres),
            soil_type: formData.soil_type || null,
            irrigation_type: formData.irrigation_type || null,
            // Usage data fields
            water_used_liters: parseOptionalNumber(formData.water_used_liters),
            irrigation_method: formData.irrigation_method || null,
            fertilizer_n_kg: parseOptionalNumber(formData.fertilizer_n_kg),
            fertilizer_p_kg: parseOptionalNumber(formData.fertilizer_p_kg),
            fertilizer_k_kg: parseOptionalNumber(formData.fertilizer_k_kg),
            actual_yield_quintals: parseOptionalNumber(formData.actual_yield_quintals),
            cost_per_acre: parseOptionalNumber(formData.cost_per_acre),
            harvest_date: formData.harvest_date || null,
            labor_hours: parseOptionalNumber(formData.labor_hours),
            fuel_liters: parseOptionalNumber(formData.fuel_liters),
            notes: formData.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        toast.success("Field added successfully!");
        setFields([data, ...fields]);
      }
      
      setIsAddingField(false);
      setShowUsageData(false);
      setFormData({
        name: "",
        crop_type: "",
        planting_date: "",
        area_acres: "",
        soil_type: "",
        irrigation_type: "",
        water_used_liters: "",
        irrigation_method: "",
        fertilizer_n_kg: "",
        fertilizer_p_kg: "",
        fertilizer_k_kg: "",
        actual_yield_quintals: "",
        cost_per_acre: "",
        harvest_date: "",
        labor_hours: "",
        fuel_liters: "",
        notes: ""
      });
    } catch (error: any) {
      console.error('Error saving field:', error);
      toast.error(error.message || "Failed to save field");
    }
  };

  const handleEditField = (field: any) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      crop_type: field.crop_type,
      planting_date: field.planting_date,
      area_acres: field.area_acres.toString(),
      soil_type: field.soil_type || "",
      irrigation_type: field.irrigation_type || "",
      water_used_liters: field.water_used_liters?.toString() || "",
      irrigation_method: field.irrigation_method || "",
      fertilizer_n_kg: field.fertilizer_n_kg?.toString() || "",
      fertilizer_p_kg: field.fertilizer_p_kg?.toString() || "",
      fertilizer_k_kg: field.fertilizer_k_kg?.toString() || "",
      actual_yield_quintals: field.actual_yield_quintals?.toString() || "",
      cost_per_acre: field.cost_per_acre?.toString() || "",
      harvest_date: field.harvest_date || "",
      labor_hours: field.labor_hours?.toString() || "",
      fuel_liters: field.fuel_liters?.toString() || "",
      notes: field.notes || ""
    });
    setIsAddingField(true);
    setShowUsageData(true); // Show usage data when editing
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this field? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      toast.success("Field deleted successfully!");
      setFields(fields.filter(f => f.id !== fieldId));
    } catch (error: any) {
      console.error('Error deleting field:', error);
      toast.error(error.message || "Failed to delete field");
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setIsAddingField(false);
    setShowUsageData(false);
    setFormData({
      name: "",
      crop_type: "",
      planting_date: "",
      area_acres: "",
      soil_type: "",
      irrigation_type: "",
      water_used_liters: "",
      irrigation_method: "",
      fertilizer_n_kg: "",
      fertilizer_p_kg: "",
      fertilizer_k_kg: "",
      actual_yield_quintals: "",
      cost_per_acre: "",
      harvest_date: "",
      labor_hours: "",
      fuel_liters: "",
      notes: ""
    });
  };

  if (authLoading || loading) {
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Fields</h1>
              <p className="text-muted-foreground">Manage your registered agricultural fields</p>
            </div>
            <Button 
              variant="hero" 
              className="gap-2"
              onClick={() => {
                setEditingField(null);
                setFormData({
                  name: "",
                  crop_type: "",
                  planting_date: "",
                  area_acres: "",
                  soil_type: "",
                  irrigation_type: "",
                  water_used_liters: "",
                  irrigation_method: "",
                  fertilizer_n_kg: "",
                  fertilizer_p_kg: "",
                  fertilizer_k_kg: "",
                  actual_yield_quintals: "",
                  cost_per_acre: "",
                  harvest_date: "",
                  labor_hours: "",
                  fuel_liters: "",
                  notes: ""
                });
                setShowUsageData(false);
                setIsAddingField(!isAddingField);
              }}
            >
              <Plus className="w-4 h-4" /> Add New Field
            </Button>
          </div>

          {isAddingField && (
            <Card className="shadow-medium mb-8">
              <CardHeader>
                <CardTitle>{editingField ? "Edit Field" : "Add New Field"}</CardTitle>
                <CardDescription>
                  {editingField ? "Update your field details" : "Enter details about your agricultural field"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddField} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fieldName">Field Name</Label>
                      <Input 
                        id="fieldName" 
                        placeholder="e.g., North Plot" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fieldSize">Size (acres)</Label>
                      <Input 
                        id="fieldSize" 
                        type="number" 
                        step="0.1"
                        placeholder="e.g., 5.2" 
                        value={formData.area_acres}
                        onChange={(e) => setFormData({...formData, area_acres: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cropType">Crop Type</Label>
                      <Input 
                        id="cropType" 
                        placeholder="e.g., Wheat, Rice, Tomato" 
                        value={formData.crop_type}
                        onChange={(e) => setFormData({...formData, crop_type: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plantingDate">Planting Date</Label>
                      <Input 
                        id="plantingDate" 
                        type="date" 
                        value={formData.planting_date}
                        onChange={(e) => setFormData({...formData, planting_date: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="soilType">Soil Type (Optional)</Label>
                      <Input 
                        id="soilType" 
                        placeholder="e.g., Loamy" 
                        value={formData.soil_type}
                        onChange={(e) => setFormData({...formData, soil_type: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="irrigationType">Irrigation Type (Optional)</Label>
                      <Input 
                        id="irrigationType" 
                        placeholder="e.g., Drip" 
                        value={formData.irrigation_type}
                        onChange={(e) => setFormData({...formData, irrigation_type: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Usage Data Section - Collapsible */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto font-normal"
                      onClick={() => setShowUsageData(!showUsageData)}
                    >
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">Usage Data for Efficiency Analytics (Optional)</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {showUsageData ? 'Hide' : 'Show'} details
                      </span>
                    </Button>
                    
                    {showUsageData && (
                      <div className="mt-4 space-y-6">
                        {/* Water Usage Section */}
                        <div className="bg-info/5 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="w-5 h-5 text-info" />
                            <h4 className="font-semibold">Water Usage</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="waterUsed">Water Used (liters)</Label>
                              <Input 
                                id="waterUsed" 
                                type="number" 
                                step="0.1"
                                placeholder="Total liters used" 
                                value={formData.water_used_liters}
                                onChange={(e) => setFormData({...formData, water_used_liters: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="irrigationMethod">Irrigation Method</Label>
                              <Input 
                                id="irrigationMethod" 
                                placeholder="Drip, Sprinkler, Flood" 
                                value={formData.irrigation_method}
                                onChange={(e) => setFormData({...formData, irrigation_method: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Fertilizer Section */}
                        <div className="bg-success/5 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-success" />
                            <h4 className="font-semibold">Fertilizer Applied (kg per hectare)</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fertilizerN">Nitrogen (N)</Label>
                              <Input 
                                id="fertilizerN" 
                                type="number" 
                                step="0.1"
                                placeholder="N kg/ha" 
                                value={formData.fertilizer_n_kg}
                                onChange={(e) => setFormData({...formData, fertilizer_n_kg: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fertilizerP">Phosphorus (P)</Label>
                              <Input 
                                id="fertilizerP" 
                                type="number" 
                                step="0.1"
                                placeholder="P kg/ha" 
                                value={formData.fertilizer_p_kg}
                                onChange={(e) => setFormData({...formData, fertilizer_p_kg: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fertilizerK">Potassium (K)</Label>
                              <Input 
                                id="fertilizerK" 
                                type="number" 
                                step="0.1"
                                placeholder="K kg/ha" 
                                value={formData.fertilizer_k_kg}
                                onChange={(e) => setFormData({...formData, fertilizer_k_kg: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Yield & Harvest Section */}
                        <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">Yield & Harvest</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="actualYield">Actual Yield (quintals per acre)</Label>
                              <Input 
                                id="actualYield" 
                                type="number" 
                                step="0.1"
                                placeholder="Quintals/acre" 
                                value={formData.actual_yield_quintals}
                                onChange={(e) => setFormData({...formData, actual_yield_quintals: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="harvestDate">Harvest Date</Label>
                              <Input 
                                id="harvestDate" 
                                type="date" 
                                value={formData.harvest_date}
                                onChange={(e) => setFormData({...formData, harvest_date: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Costs & Resources Section */}
                        <div className="bg-warning/5 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-warning" />
                            <h4 className="font-semibold">Costs & Resources</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="costPerAcre">Cost per Acre (₹)</Label>
                              <Input 
                                id="costPerAcre" 
                                type="number" 
                                step="0.1"
                                placeholder="₹ per acre" 
                                value={formData.cost_per_acre}
                                onChange={(e) => setFormData({...formData, cost_per_acre: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="laborHours">Labor Hours</Label>
                              <Input 
                                id="laborHours" 
                                type="number" 
                                step="0.1"
                                placeholder="Hours per acre" 
                                value={formData.labor_hours}
                                onChange={(e) => setFormData({...formData, labor_hours: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fuelLiters">Fuel Used (liters)</Label>
                              <Input 
                                id="fuelLiters" 
                                type="number" 
                                step="0.1"
                                placeholder="Liters per acre" 
                                value={formData.fuel_liters}
                                onChange={(e) => setFormData({...formData, fuel_liters: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <textarea
                            id="notes" 
                            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Any additional notes about your field..." 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-border">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero">
                      {editingField ? "Update Field" : "Save Field"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Existing Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.length === 0 ? (
              <Card className="shadow-soft col-span-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No fields added yet. Click "Add New Field" to get started!</p>
                </CardContent>
              </Card>
            ) : (
              fields.map((field) => (
                <Card key={field.id} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {field.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditField(field)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteField(field.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{field.area_acres} acres • {field.crop_type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Planted:</span>
                      <span className="ml-2 font-medium">{new Date(field.planting_date).toLocaleDateString()}</span>
                    </div>
                    {field.soil_type && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Soil:</span>
                        <span className="ml-2 font-medium">{field.soil_type}</span>
                      </div>
                    )}
                    {field.irrigation_type && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Irrigation:</span>
                        <span className="ml-2 font-medium">{field.irrigation_type}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fields;
