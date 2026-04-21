import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      toast({ title: "Verification Required", description: "Please verify the reCAPTCHA.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    setGoogleLoading(false);
    if (error) {
      toast({ title: "Google Login Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 grid-bg">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-6">
            <div className="icon-badge">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 20c-4.42 0-8-3.58-8-8V6.27L12 3l8 3.27V13c0 4.42-3.58 8-8 8z"/>
                <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text">CALYE SAFE</h1>
          <p className="text-sm text-muted-foreground font-medium">Community Incident Reporting System</p>
          <p className="text-xs text-muted-foreground">for Barangay Local Government Units</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-input border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <div className="flex justify-center pt-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                theme="light"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-lg transition-all duration-200 mt-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-border"></div>
            <span className="px-3 text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-11 border-border hover:bg-muted rounded-lg transition-all duration-200 font-medium"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
