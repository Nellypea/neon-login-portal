import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Calendar, Loader2, ShieldCheck } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    course: "",
    yearGraduated: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password || !formData.course.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!captchaChecked) {
      toast({ title: "CAPTCHA Required", description: "Please verify you are not a robot.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const yearNum = formData.yearGraduated ? parseInt(formData.yearGraduated) : null;

    const { error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: formData.fullName.trim(),
          course: formData.course.trim(),
          year_graduated: yearNum,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else {
      // Update profile with course and year
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          course: formData.course.trim(),
          year_graduated: yearNum,
          full_name: formData.fullName.trim(),
        }).eq("user_id", user.id);
      }
      toast({ title: "Account Created!", description: "Check your email to verify your account." });
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 grid-bg">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-primary neon-text tracking-wider">
            JOIN THE NETWORK
          </h1>
          <p className="mt-2 text-muted-foreground">Create your alumni account</p>
        </div>

        <div className="glass-card p-8 space-y-5 neon-glow-sm">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground/80 text-sm">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" placeholder="Juan Dela Cruz" value={formData.fullName} onChange={update("fullName")}
                  className="pl-10 bg-muted/50 border-border focus:neon-border text-foreground placeholder:text-muted-foreground transition-shadow" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 text-sm">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={update("email")}
                  className="pl-10 bg-muted/50 border-border focus:neon-border text-foreground placeholder:text-muted-foreground transition-shadow" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="course" className="text-foreground/80 text-sm">Course *</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="course" placeholder="BSIT" value={formData.course} onChange={update("course")}
                    className="pl-10 bg-muted/50 border-border focus:neon-border text-foreground placeholder:text-muted-foreground transition-shadow" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearGraduated" className="text-foreground/80 text-sm">Year Graduated</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="yearGraduated" type="number" placeholder="2024" value={formData.yearGraduated} onChange={update("yearGraduated")}
                    className="pl-10 bg-muted/50 border-border focus:neon-border text-foreground placeholder:text-muted-foreground transition-shadow" min="1950" max="2030" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 text-sm">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={update("password")}
                  className="pl-10 pr-10 bg-muted/50 border-border focus:neon-border text-foreground placeholder:text-muted-foreground transition-shadow" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground/80 text-sm">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={update("confirmPassword")}
                  className="pl-10 bg-muted/50 border-border focus:neon-border text-foreground placeholder:text-muted-foreground transition-shadow" required />
              </div>
            </div>

            {/* Simulated CAPTCHA */}
            <div className="flex items-center space-x-3 rounded-lg border border-border bg-muted/30 p-4">
              <Checkbox
                id="captcha"
                checked={captchaChecked}
                onCheckedChange={(v) => setCaptchaChecked(v === true)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="captcha" className="text-sm text-foreground/80 flex items-center gap-2 cursor-pointer">
                <ShieldCheck className="h-4 w-4 text-primary" />
                I'm not a robot
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full neon-glow font-semibold text-base h-11 transition-all duration-300 hover:scale-[1.02]">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
