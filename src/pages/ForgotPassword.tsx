import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Validation Error", description: "Please enter your email.", variant: "destructive" });
      return;
    }
    
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      toast({ title: "Verification Required", description: "Please verify the reCAPTCHA.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 grid-bg">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">
            RESET PASSWORD
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {sent ? "Check your inbox for a password reset link" : "Enter your registered email to reset your password"}
          </p>
        </div>

        <div className="glass-card p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-foreground/80">
                A password reset link has been sent to <span className="text-primary font-medium">{email}</span> if an account exists.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-4 border-border hover:bg-muted rounded-lg transition-all">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/90 text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all rounded-lg" required />
                </div>
              </div>
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  theme="light"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-11 transition-all duration-300 rounded-lg">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
