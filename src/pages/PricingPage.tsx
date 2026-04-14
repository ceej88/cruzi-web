import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, PoundSterling } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { usePageMeta } from "@/hooks/usePageMeta";

const BG      = "#060e20";
const GLASS   = "rgba(31, 43, 73, 0.45)";
const GLASS_B = "rgba(189, 157, 255, 0.12)";
const P       = "#7c3aed";
const P_SEC   = "#bd9dff";
const TEXT    = "#dee5ff";
const MUTED   = "#a3aac4";
const GLOW    = "rgba(124,58,237,0.35)";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const },
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

const CheckItem = ({ text }: { text: string }) => (
  <li style={{ display: "flex", alignItems: "flex-start", gap: 10, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
    <CheckCircle style={{ color: P_SEC, width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
    {text}
  </li>
);

const PricingPage = () => {
  const navigate = useNavigate();

  usePageMeta({
    title: "Pricing — Cruzi",
    description: "Simple, transparent pricing for driving instructors, students and parents. Start free with up to 10 students. Upgrade to Pro or Premium when you're ready.",
    canonical: "https://cruzi.co.uk/pricing",
  });

  const handleGetStarted = () => navigate("/auth?role=instructor");

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      <LandingNavbar />

      <div style={{ paddingTop: 120 }}>
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 9999, padding: "6px 16px", marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: P_SEC, display: "inline-block" }} />
                <span style={{ color: P_SEC, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>PRICING</span>
              </div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
                Simple, transparent pricing
              </h1>
              <p style={{ color: MUTED, fontSize: 17, lineHeight: 1.7, margin: 0 }}>Start free. Upgrade when you're ready. No card required.</p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "start" }}>
              {[
                {
                  name: "Free", price: "£0", period: "/month", desc: "Up to 10 students", pro: false,
                  features: ["All core features", "Student app", "Parent dashboard", "DVSA skill tracking", "Voice scribe notes"],
                  delay: 0,
                },
                {
                  name: "Pro", price: "£14.99", period: "/month", desc: "Up to 14 students", pro: true,
                  features: ["Everything in Free", "Priority support", "Advanced reporting", "Auto lesson plans", "Morning briefings"],
                  delay: 0.1,
                },
                {
                  name: "Premium", price: "£24.99", period: "/month", desc: "Unlimited students", pro: false,
                  features: ["Everything in Pro", "Multi-instructor support", "School dashboard", "Bulk student management", "Custom branding"],
                  delay: 0.2,
                },
              ].map((plan) => (
                <motion.div
                  key={plan.name}
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: plan.delay }}
                  style={{
                    ...glassCard,
                    padding: "36px 28px",
                    border: plan.pro ? `1px solid rgba(124,58,237,0.6)` : `1px solid ${GLASS_B}`,
                    boxShadow: plan.pro ? `0 0 40px rgba(124,58,237,0.2)` : "none",
                    transform: plan.pro ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: plan.pro ? `linear-gradient(90deg, transparent, rgba(124,58,237,0.7), transparent)` : "linear-gradient(90deg, transparent, rgba(189,157,255,0.3), transparent)" }} />
                  {plan.pro && (
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: P, color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 16px", borderRadius: 9999, letterSpacing: "0.06em", whiteSpace: "nowrap", boxShadow: `0 0 16px ${GLOW}` }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, margin: "0 0 8px", color: TEXT }}>{plan.name}</h3>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 40, color: plan.pro ? P_SEC : TEXT, lineHeight: 1 }}>{plan.price}</span>
                      <span style={{ color: MUTED, fontSize: 14, marginBottom: 6 }}>{plan.period}</span>
                    </div>
                    <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>{plan.desc}</p>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {plan.features.map(f => <CheckItem key={f} text={f} />)}
                  </ul>
                  <button
                    onClick={handleGetStarted}
                    style={{
                      width: "100%", padding: "14px 0", borderRadius: 9999, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.25s", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: plan.pro ? P : "rgba(255,255,255,0.07)",
                      color: plan.pro ? "#fff" : TEXT,
                      boxShadow: plan.pro ? `0 0 20px ${GLOW}` : "none",
                      border: plan.pro ? "none" : `1px solid ${GLASS_B}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; if (plan.pro) e.currentTarget.style.boxShadow = "0 0 32px rgba(124,58,237,0.55)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; if (plan.pro) e.currentTarget.style.boxShadow = `0 0 20px ${GLOW}`; }}
                  >
                    Get Started
                  </button>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp} style={{ textAlign: "center", marginTop: 48 }}>
              <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
                All plans include the native mobile app for iOS and Android.
                <br />
                No contracts. Cancel anytime.
              </p>
            </motion.div>
          </div>
        </section>

        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(36px, 6vw, 60px)", textAlign: "center" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(189,157,255,0.45), transparent)" }} />
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 20px rgba(124,58,237,0.25)" }}>
                <PoundSterling style={{ color: P_SEC, width: 24, height: 24 }} />
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em", margin: "0 0 14px", color: TEXT }}>
                See how much time you could save
              </h2>
              <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, margin: "0 0 36px" }}>
                Interactive calculator — personalised to your workload and student count.
              </p>
              <button
                onClick={() => navigate("/savings")}
                style={{ background: "rgba(124,58,237,0.2)", color: P_SEC, border: "1px solid rgba(124,58,237,0.4)", padding: "14px 36px", borderRadius: 9999, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.25s", display: "inline-flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.2)"; }}
              >
                Try the Calculator <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      <LandingFooter />
    </div>
  );
};

export default PricingPage;
