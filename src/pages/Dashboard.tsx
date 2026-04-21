import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, AlertTriangle, Clock, MapPin, Phone, Loader2 } from "lucide-react";

interface Incident {
  id: string;
  full_name: string;
  email: string;
  course: string;
  year_graduated: number | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, course, year_graduated")
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Error", description: "Failed to load incident reports.", variant: "destructive" });
      } else {
        setIncidents(data || []);
      }
      setLoading(false);
    };
    fetchIncidents();
  }, [toast]);

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Community Member";

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 20c-4.42 0-8-3.58-8-8V6.27L12 3l8 3.27V13c0 4.42-3.58 8-8 8z"/>
                  <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">CALYE SAFE</h1>
                <p className="text-xs text-muted-foreground">Community Incident Reporting</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="border-border hover:bg-muted rounded-lg h-9">
                <LogOut className="h-4 w-4 mr-2" />Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div className="glass-card p-8">
          <h2 className="text-3xl font-bold gradient-text">
            Welcome, {displayName}!
          </h2>
          <p className="mt-3 text-muted-foreground">
            Community Safety Dashboard - Monitor and manage incident reports for your barangay
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{incidents.length}</p>
              <p className="text-xs text-muted-foreground">Total Reports</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(incidents.map((i) => i.course).filter(Boolean)).size}
              </p>
              <p className="text-xs text-muted-foreground">Active Barangays</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(incidents.map((i) => i.year_graduated).filter(Boolean)).size}
              </p>
              <p className="text-xs text-muted-foreground">Active Reporters</p>
            </div>
          </div>
        </div>

        {/* Incident Reports Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-lg font-semibold text-primary flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Incident Reports
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="mt-3 text-muted-foreground">Loading incident reports...</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No incident reports yet. Community is safe!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reporter</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Barangay</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-sm text-foreground font-medium">
                        {incident.full_name || "—"}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" /> {incident.email}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {incident.course || "—"}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Reported
                        </span>
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
