import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Also check for session-based recovery
      supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password Updated", description: "You can now sign in with your new password." });
      navigate("/login");
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center grid-bg">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold gradient-text mb-4">INVALID LINK</h2>
          <p className="text-muted-foreground mb-6">This password reset link is invalid or expired. Please request a new one.</p>
          <Button variant="outline" onClick={() => navigate("/forgot-password")} className="border-border hover:bg-muted rounded-lg">
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 grid-bg">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">NEW PASSWORD</h1>
          <p className="text-sm text-muted-foreground font-medium">Enter your new password below</p>
        </div>
        <div className="glass-card p-8 space-y-6">
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90 text-sm font-medium">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all rounded-lg" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground/90 text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirm" type="password" placeholder="••••••••"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all rounded-lg" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-11 transition-all duration-300 rounded-lg">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
