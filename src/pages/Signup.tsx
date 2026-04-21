import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Calendar, Loader2 } from "lucide-react";

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
  const recaptchaRef = useRef<ReCAPTCHA>(null);
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
    
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      toast({ title: "Verification Required", description: "Please verify the reCAPTCHA.", variant: "destructive" });
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
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">
            REPORT AN INCIDENT
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Register to report community incidents</p>
        </div>

        <div className="glass-card p-8 space-y-5">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground/90 text-sm font-medium">Full Name / Reporter Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" placeholder="Juan Dela Cruz" value={formData.fullName} onChange={update("fullName")}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all rounded-lg" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90 text-sm font-medium">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={update("email")}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all rounded-lg" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="course" className="text-foreground/90 text-sm font-medium">Barangay / Location *</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="course" placeholder="Barangay Name" value={formData.course} onChange={update("course")}
                    className="pl-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all rounded-lg" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearGraduated" className="text-foreground/90 text-sm font-medium">Year Active</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="yearGraduated" type="number" placeholder="2024" value={formData.yearGraduated} onChange={update("yearGraduated")}
                    className="pl-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all rounded-lg" min="1950" max="2030" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90 text-sm font-medium">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={update("password")}
                  className="pl-10 pr-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all rounded-lg" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground/90 text-sm font-medium">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={update("confirmPassword")}
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

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-11 transition-all duration-300 rounded-lg mt-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register & Report"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
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
