import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [userName, setUserName] = useState<string>("");
  
  // Fetch user's name when user is authenticated
  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          // First try to get from user metadata (from signup)
          const fullName = user.user_metadata?.full_name;
          if (fullName) {
            setUserName(fullName);
            return;
          }

          // If not in metadata, try to fetch from profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (!error && data?.full_name) {
            setUserName(data.full_name);
          } else {
            // Fallback to email if no name is found
            setUserName(user.email?.split('@')[0] || 'User');
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
          // Fallback to email if there's an error
          setUserName(user.email?.split('@')[0] || 'User');
        }
      } else {
        setUserName("");
      }
    };

    fetchUserName();
  }, [user]);
  
  // Show navigation items only when user is authenticated and not on landing page
  const showNavItems = user && location.pathname !== "/";
  
  // Show auth buttons only when user is not authenticated or on landing page
  const showAuthButtons = !user || location.pathname === "/";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Smart Fasal</span>
          </Link>

          {/* Navigation items - only show when authenticated and not on landing page */}
          {showNavItems && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/fields" className="text-foreground hover:text-primary transition-colors">
                My Fields
              </Link>
              <Link to="/crop-health" className="text-foreground hover:text-primary transition-colors">
                Crop Health
              </Link>
              <Link to="/crop-recommendation" className="text-foreground hover:text-primary transition-colors">
                Recommend
              </Link>
              <Link to="/field-efficiency" className="text-foreground hover:text-primary transition-colors">
                Efficiency
              </Link>
              <Link to="/harvest-planning" className="text-foreground hover:text-primary transition-colors">
                Harvest
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>
            </div>
          )}

          {/* Auth buttons - show when not authenticated or on landing page */}
          {showAuthButtons && (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          )}

          {/* User menu - show when authenticated and not on landing page */}
          {user && location.pathname !== "/" && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {userName || 'User'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
