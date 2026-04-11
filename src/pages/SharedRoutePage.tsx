import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Clock, Navigation, AlertTriangle, Lightbulb, ExternalLink, Loader2, Route, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const APP_STORE_URL = 'https://apps.apple.com/gb/app/cruzi/id6759689036';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cruzi.app';

interface RouteData {
  id: string;
  route_name: string;
  test_centre: string;
  est_duration_minutes: number | null;
  est_distance_miles: number | null;
  coordinates: { lat: number; lng: number }[] | null;
  focus_areas: string[] | null;
  tips: string[] | null;
}

interface StepData {
  id: string;
  step_index: number;
  instruction: string;
}

function buildGoogleMapsUrl(coords: { lat: number; lng: number }[]): string {
  if (!coords || coords.length < 2) return '';
  const origin = coords[0];
  const destination = coords[coords.length - 1];
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  if (coords.length > 2) {
    const inner = coords.slice(1, -1);
    const maxWaypoints = 8;
    let sampled: { lat: number; lng: number }[];
    if (inner.length <= maxWaypoints) {
      sampled = inner;
    } else {
      sampled = [];
      for (let i = 0; i < maxWaypoints; i++) {
        const idx = Math.round((i * (inner.length - 1)) / (maxWaypoints - 1));
        sampled.push(inner[idx]);
      }
    }
    const waypointStr = sampled.map(p => `${p.lat},${p.lng}`).join('|');
    url += `&waypoints=${waypointStr}`;
  }
  return url;
}

function buildAppleMapsUrl(coords: { lat: number; lng: number }[]): string {
  if (!coords || coords.length < 2) return '';
  const origin = coords[0];
  const destination = coords[coords.length - 1];
  return `https://maps.apple.com/?saddr=${origin.lat},${origin.lng}&daddr=${destination.lat},${destination.lng}&dirflg=d`;
}

const SharedRoutePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [route, setRoute] = useState<RouteData | null>(null);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    if (!id) { setNotFound(true); setLoading(false); return; }
    (async () => {
      const [routeRes, stepsRes] = await Promise.all([
        supabase.from('test_routes').select('*').eq('id', id).single(),
        supabase.from('test_route_steps').select('*').eq('route_id', id).order('step_index', { ascending: true }),
      ]);
      if (routeRes.error || !routeRes.data) { setNotFound(true); }
      else {
        const d = routeRes.data;
        setRoute({
          id: d.id,
          route_name: d.route_name,
          test_centre: d.test_centre,
          est_duration_minutes: d.est_duration_minutes,
          est_distance_miles: d.est_distance_miles,
          coordinates: d.coordinates as { lat: number; lng: number }[] | null,
          focus_areas: d.focus_areas,
          tips: d.tips,
        });
      }
      if (stepsRes.data) setSteps(stepsRes.data as StepData[]);
      setLoading(false);
    })();
  }, [id, user, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading route…</p>
        </div>
      </div>
    );
  }

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <LogIn className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign In to View Route</h1>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Your instructor has shared a test route with you. Sign in to your Cruzi account to view the full details.
        </p>
        <button
          onClick={() => navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`)}
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <LogIn className="h-5 w-5" />
          Sign In
        </button>
      </div>
    );
  }

  if (notFound || !route) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Route Not Found</h1>
        <p className="text-muted-foreground mb-6 max-w-sm">
          This route link is no longer available. It may have been removed by the instructor.
        </p>
        <a
          href="https://cruzi.co.uk"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          Go to cruzi.co.uk
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    );
  }

  const coords = Array.isArray(route.coordinates) && route.coordinates.length >= 2 ? route.coordinates : null;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const mapsUrl = coords ? (isIOS ? buildAppleMapsUrl(coords) : buildGoogleMapsUrl(coords)) : '';
  const mapsLabel = isIOS ? 'Open in Apple Maps' : 'Open Route in Google Maps';
  const focusAreas = route.focus_areas?.filter(Boolean) ?? [];
  const tips = route.tips?.filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── HEADER ─── */}
      <header className="border-b border-border/50 px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-black tracking-tight font-outfit text-primary">
            Cruzi
          </Link>
          <span className="text-xs text-muted-foreground font-medium bg-accent px-3 py-1 rounded-full">
            Test Route — shared by your instructor
          </span>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── ROUTE CARD ─── */}
        <section className="px-5 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-3xl border border-border/60 shadow-lg overflow-hidden">
              {/* Purple accent bar */}
              <div className="h-2 bg-gradient-to-r from-primary via-[hsl(271,81%,56%)] to-primary" />

              <div className="p-6 md:p-8 space-y-6">
                {/* Route name */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary/70">
                    <Route className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Test Route</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground font-outfit leading-tight">
                    {route.route_name}
                  </h1>
                </div>

                {/* Stat chips */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-accent/60 rounded-xl px-4 py-2.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{route.test_centre}</span>
                  </div>
                  {route.est_distance_miles != null && (
                    <div className="flex items-center gap-2 bg-accent/60 rounded-xl px-4 py-2.5">
                      <Navigation className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{route.est_distance_miles} miles</span>
                    </div>
                  )}
                  {route.est_duration_minutes != null && (
                    <div className="flex items-center gap-2 bg-accent/60 rounded-xl px-4 py-2.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{route.est_duration_minutes} mins</span>
                    </div>
                  )}
                </div>

                {/* Google Maps CTA */}
                {coords && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base py-4 rounded-2xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                  >
                    <Navigation className="h-5 w-5" />
                    {mapsLabel}
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── DIRECTIONS ─── */}
        {steps.length > 0 && (
          <section className="px-5 pb-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Step list */}
              <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-3">
                  <h2 className="text-xl font-bold text-foreground font-outfit">Directions</h2>
                </div>
                <ol className="divide-y divide-border/40">
                  {steps.map((step, i) => (
                    <li key={step.id} className="flex items-start gap-4 px-6 py-4">
                      <span className="shrink-0 w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed pt-1">{step.instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Focus areas */}
              {focusAreas.length > 0 && (
                <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground font-outfit">Focus Areas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {focusAreas.map((area, i) => (
                      <Badge key={i} className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 font-medium text-xs px-3 py-1.5 rounded-lg">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {tips.length > 0 && (
                <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground font-outfit">Instructor Tips</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── APP DOWNLOAD BANNER ─── */}
        <section className="bg-gradient-to-br from-primary via-[hsl(271,81%,56%)] to-[hsl(262,83%,56%)] text-primary-foreground">
          <div className="max-w-2xl mx-auto px-6 py-14 md:py-20 text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-outfit">
                Download the Cruzi App
              </h2>
              <p className="text-primary-foreground/80 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                30-day free trial. Increase student engagement between lessons and automate your admin — all in one app.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="active:scale-[0.95] transition-transform"
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-14"
                />
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="active:scale-[0.95] transition-transform"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-14"
                />
              </a>
            </div>

            <p className="text-xs text-primary-foreground/60 font-medium">
              Free to download. No credit card required for trial.
            </p>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/50 px-6 py-4 text-center bg-card/50">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Cruzi ·{' '}
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link> ·{' '}
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </p>
      </footer>
    </div>
  );
};

export default SharedRoutePage;
