import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Smartphone } from "lucide-react";
import SiteNav from "@/components/landing/SiteNav";
import { usePageMeta } from "@/hooks/usePageMeta";

const BG      = "#F8F9FF";
const GLASS   = "rgba(255, 255, 255, 0.92)";
const GLASS_B = "rgba(115, 49, 223, 0.18)";
const P       = "#5300B7";
const P_SEC   = "#6D28D9";
const TEXT    = "#0D1C2F";
const MUTED   = "#4A4455";

const APP_STORE_URL  = "https://apps.apple.com/gb/app/cruzi/id6478977298";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=co.uk.cruzi.app";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" as const },
};

const glassCard: React.CSSProperties = {
  background: GLASS,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${GLASS_B}`,
  borderRadius: 24,
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 24px 60px rgba(13, 28, 47, 0.08)",
};

const ChesterSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  usePageMeta({
    title: "You're in — Family Practice | Cruzi",
    description: "Your Cruzi Family Practice access is confirmed. Download the app and sign in with the email and password you just created.",
    canonical: "https://cruzi.co.uk/chester/success",
  });

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 12% 18%, rgba(115,49,223,0.18) 0%, transparent 55%), radial-gradient(ellipse at 88% 82%, rgba(115,49,223,0.10) 0%, transparent 50%)" }} />

      <SiteNav navigate={navigate} onGetStarted={() => navigate("/chester")} />

      <section style={{ position: "relative", zIndex: 1, padding: "104px 20px 56px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(28px, 5vw, 40px)", textAlign: "center" }} data-testid="status-purchase-success">
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(115,49,223,0.12)", border: "1px solid rgba(115,49,223,0.28)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <CheckCircle style={{ width: 34, height: 34, color: P_SEC }} aria-hidden="true" />
            </div>

            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 2.4rem)", letterSpacing: "-0.02em", margin: "0 0 12px", color: TEXT, lineHeight: 1.1 }} data-testid="text-heading">
              You're in.
            </h1>
            <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.6, margin: "0 0 22px" }}>
              Download Cruzi and sign in with the same email and password you just created.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 18 }} data-testid="store-buttons">
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" data-testid="link-app-store" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: P, color: "#fff", padding: "13px 22px", borderRadius: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14.5, fontWeight: 700, textDecoration: "none", boxShadow: "0 12px 28px rgba(83, 0, 183, 0.22)" }}>
                <Smartphone style={{ width: 16, height: 16 }} /> Download on App Store
              </a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" data-testid="link-play-store" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: P_SEC, padding: "13px 22px", borderRadius: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14.5, fontWeight: 700, textDecoration: "none", border: `1px solid ${GLASS_B}` }}>
                <Smartphone style={{ width: 16, height: 16 }} /> Get it on Google Play
              </a>
            </div>

            <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.55, margin: 0 }}>
              A payment receipt has been emailed to you. If you can't find it, check your spam folder.
            </p>
          </motion.div>
        </div>
      </section>

      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(115,49,223,0.08)", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: TEXT }}>Cruzi</span>
          <p style={{ color: MUTED, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Cruzi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ChesterSuccessPage;
