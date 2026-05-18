import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Smartphone, Mail, Users } from "lucide-react";
import SiteNav from "@/components/landing/SiteNav";
import { usePageMeta } from "@/hooks/usePageMeta";

const BG      = "#F8F9FF";
const GLASS   = "rgba(255, 255, 255, 0.85)";
const GLASS_B = "rgba(115, 49, 223, 0.18)";
const P       = "#5300B7";
const P_SEC   = "#6D28D9";
const TEXT    = "#0D1C2F";
const MUTED   = "#4A4455";

const FUNNEL_KEY = "cruzi.chester.funnel.v1";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const glassCard: React.CSSProperties = {
  background: GLASS,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${GLASS_B}`,
  borderRadius: 24,
  position: "relative",
  overflow: "hidden",
};

interface FunnelState {
  firstName?: string;
  email?: string;
  area?: string;
  interestedInFamilyPractice?: boolean;
}

const ChesterStartPlaceholder: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  usePageMeta({
    title: "Family Practice — Opens Soon | Cruzi",
    description: "Your Chester waiting list spot is secured. Family Practice opens to learners soon — we'll email you the moment access is available.",
    canonical: "https://cruzi.co.uk/chester/start",
  });

  const [state, setState] = useState<FunnelState>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(FUNNEL_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // If someone lands here cold without a funnel record, send them back to /chester.
  const hasFunnel = !!(state.firstName && state.email);

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        html { overflow-x: hidden; }
        .phone-mock { aspect-ratio: 9 / 18; max-width: 220px; border-radius: 36px; background: linear-gradient(180deg, #1b1230 0%, #0d0820 100%); border: 1px solid rgba(115,49,223,0.4); padding: 14px; box-shadow: 0 24px 60px rgba(13, 28, 47, 0.18), 0 0 0 6px rgba(255,255,255,0.6); margin: 0 auto; position: relative; }
        .phone-screen { width:100%; height:100%; border-radius: 24px; background: linear-gradient(180deg, #1d1438 0%, #0a061a 100%); padding: 16px; display:flex; flex-direction:column; gap: 10px; }
        .phone-notch { position:absolute; top: 14px; left:50%; transform: translateX(-50%); width: 80px; height: 20px; background:#000; border-radius: 0 0 12px 12px; }
        .phone-line { height:10px; border-radius:6px; background: rgba(255,255,255,0.06); }
        .phone-line.lavender { background: linear-gradient(90deg, rgba(115,49,223,0.6), rgba(115,49,223,0.18)); }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 15% 25%, rgba(115,49,223,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(115,49,223,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(115,49,223,0.08) 0%, transparent 45%)` }} />

      <SiteNav navigate={navigate} onGetStarted={() => navigate("/chester")} />

      <section style={{ position: "relative", zIndex: 1, padding: "112px 24px 64px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          {!hasFunnel ? (
            <motion.div {...fadeUp} style={{ ...glassCard, padding: 32, textAlign: "center" }} data-testid="status-cold-landing">
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 2.6vw, 1.8rem)", margin: "0 0 12px", color: TEXT, letterSpacing: "-0.02em" }}>
                Looks like you haven't joined the Chester list yet.
              </h1>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.65, margin: "0 0 22px" }}>
                Pop your details in and we'll match you with a verified local driving instructor.
              </p>
              <Link
                to="/chester"
                data-testid="link-back-to-chester"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: P, color: "#fff", padding: "13px 26px", borderRadius: 9999, fontSize: 14.5, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: "none", boxShadow: "0 0 16px rgba(115,49,223,0.28)" }}
              >
                Go to the Chester page
              </Link>
            </motion.div>
          ) : (
            <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(28px, 4vw, 44px)" }} data-testid="status-spot-secured">
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(220px, 0.9fr)", gap: 36, alignItems: "center" }} className="start-grid">
                <style>{`@media (max-width: 820px) { .start-grid { grid-template-columns: 1fr !important; gap: 28px !important; } .phone-side { order: -1; } }`}</style>

                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 9999, background: "rgba(115,49,223,0.12)", border: "1px solid rgba(115,49,223,0.32)", color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>
                    <BadgeCheck style={{ width: 12, height: 12 }} /> WAITLIST SPOT SECURED
                  </div>
                  <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.7rem, 3.2vw, 2.3rem)", letterSpacing: "-0.02em", margin: "0 0 14px", color: TEXT, lineHeight: 1.15 }}>
                    Family Practice opens soon.
                  </h1>
                  <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, margin: "0 0 20px" }}>
                    Thanks{state.firstName ? `, ${state.firstName.split(" ")[0]}` : ""} — your spot for the <strong style={{ color: TEXT }}>{state.area || "Chester region"}</strong> waiting list is locked in. We'll email <strong style={{ color: TEXT }}>{state.email}</strong> the moment Family Practice is available to buy.
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { icon: Mail, t: "We'll email you when access opens" },
                      { icon: Smartphone, t: "Cruzi runs on iPhone and Android" },
                      { icon: Users, t: "One purchase covers you and your family supervisor" },
                    ].map(({ icon: Icon, t }) => (
                      <li key={t} style={{ display: "flex", alignItems: "center", gap: 10, color: MUTED, fontSize: 14 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(115,49,223,0.12)", border: "1px solid rgba(115,49,223,0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon style={{ width: 14, height: 14, color: P_SEC }} />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/chester"
                    data-testid="link-back-to-chester"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = P)}
                    onMouseLeave={e => (e.currentTarget.style.color = P_SEC)}
                  >
                    <ArrowLeft style={{ width: 14, height: 14 }} /> Back to the Chester page
                  </Link>
                </div>

                {/* Phone preview — restrained, no fake screenshots */}
                <div className="phone-side" style={{ display: "flex", justifyContent: "center" }}>
                  <div className="phone-mock" aria-hidden="true">
                    <div className="phone-notch" />
                    <div className="phone-screen">
                      <div style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", opacity: 0.7 }}>CRUZI · FAMILY PRACTICE</div>
                      <div style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>Tonight's session</div>
                      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, lineHeight: 1.4 }}>Roundabouts · Hoole loop · 30 min</div>
                      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
                      <div className="phone-line lavender" style={{ width: "82%" }} />
                      <div className="phone-line" style={{ width: "68%" }} />
                      <div className="phone-line" style={{ width: "74%" }} />
                      <div className="phone-line" style={{ width: "54%" }} />
                      <div style={{ marginTop: "auto", padding: "10px 12px", borderRadius: 12, background: "rgba(115,49,223,0.18)", border: "1px solid rgba(115,49,223,0.4)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, textAlign: "center", letterSpacing: "0.02em" }}>
                        Start tonight's session
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(115,49,223,0.08)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: TEXT }}>Cruzi</span>
          <p style={{ color: MUTED, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Cruzi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ChesterStartPlaceholder;
