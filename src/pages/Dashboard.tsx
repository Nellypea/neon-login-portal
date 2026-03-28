import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, GraduationCap, Calendar, Mail, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  course: string;
  year_graduated: number | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, course, year_graduated")
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Error", description: "Failed to load alumni data.", variant: "destructive" });
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, [toast]);

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Alumni";

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-primary neon-text tracking-wider">ALUMNI HUB</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}
              className="border-border hover:neon-border transition-all gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div className="glass-card p-8 neon-glow-sm">
          <h2 className="font-display text-2xl font-bold text-primary neon-text">
            Welcome, {displayName}!
          </h2>
          <p className="mt-2 text-muted-foreground">
            You're connected to the alumni network. Browse fellow graduates below.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
              <p className="text-xs text-muted-foreground">Total Alumni</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(profiles.map((p) => p.course).filter(Boolean)).size}
              </p>
              <p className="text-xs text-muted-foreground">Courses</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(profiles.map((p) => p.year_graduated).filter(Boolean)).size}
              </p>
              <p className="text-xs text-muted-foreground">Graduation Years</p>
            </div>
          </div>
        </div>

        {/* Alumni Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-lg font-semibold text-primary flex items-center gap-2">
              <Users className="h-5 w-5" /> Alumni Directory
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="mt-3 text-muted-foreground">Loading alumni data...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No alumni registered yet. Be the first!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-sm text-foreground font-medium">
                        {profile.full_name || "—"}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" /> {profile.email}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {profile.course || "—"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {profile.year_graduated || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
