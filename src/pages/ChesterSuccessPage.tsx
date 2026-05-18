import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SiteNav from "@/components/landing/SiteNav";
import { usePageMeta } from "@/hooks/usePageMeta";

const BG      = "#F8F9FF";
const GLASS   = "rgba(255, 255, 255, 0.92)";
const GLASS_B = "rgba(115, 49, 223, 0.18)";
const P_SEC   = "#6D28D9";
const TEXT    = "#0D1C2F";
const MUTED   = "#4A4455";

const APP_STORE_URL  = "https://apps.apple.com/gb/app/cruzi/id6759689036";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cruzi.app&pli=1";

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

const AppleMark: React.FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const PlayTriangle: React.FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M3 20.5V3.5c0-.59.34-1.11.84-1.35L13.69 12 3.84 21.85c-.5-.25-.84-.76-.84-1.35zM16.81 15.12L6.05 21.34l8.49-8.49 2.27 2.27zM20.16 10.81c.5.31.5 1.06 0 1.37l-2.59 1.5L14.96 12l2.61-2.61 2.59 1.42zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
  </svg>
);

const StoreButton: React.FC<{
  href: string;
  icon: React.ReactNode;
  topLine: string;
  bottomLine: string;
  testId: string;
  ariaLabel: string;
}> = ({ href, icon, topLine, bottomLine, testId, ariaLabel }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-testid={testId}
    aria-label={ariaLabel}
    className="store-badge"
  >
    <span className="store-badge__icon" aria-hidden="true">{icon}</span>
    <span className="store-badge__text">
      <span className="store-badge__top">{topLine}</span>
      <span className="store-badge__bottom">{bottomLine}</span>
    </span>
  </a>
);

const ChesterSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  usePageMeta({
    title: "You're already ahead of most learners — Cruzi Family Practice",
    description:
      "Your Cruzi Family Practice access is ready. Download Cruzi and sign in with the same email and password you just created.",
    canonical: "https://cruzi.co.uk/chester/success",
  });

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .store-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          margin: 22px 0 18px;
        }
        @media (min-width: 520px) {
          .store-row { flex-direction: row; justify-content: center; }
        }
        .store-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #000;
          color: #fff;
          padding: 12px 20px;
          border-radius: 14px;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          min-height: 56px;
          min-width: 0;
          flex: 1 1 auto;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
          box-shadow: 0 10px 24px rgba(0,0,0,0.18);
          border: 1px solid rgba(255,255,255,0.06);
        }
        @media (min-width: 520px) {
          .store-badge { flex: 0 0 auto; min-width: 200px; }
        }
        .store-badge:hover, .store-badge:focus-visible {
          transform: translateY(-1px);
          background: #111;
          outline: none;
          box-shadow: 0 14px 30px rgba(0,0,0,0.24);
        }
        .store-badge__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          color: #fff;
          flex-shrink: 0;
        }
        .store-badge__icon svg { width: 28px; height: 28px; }
        .store-badge__text {
          display: flex;
          flex-direction: column;
          line-height: 1.05;
          text-align: left;
          min-width: 0;
        }
        .store-badge__top {
          font-size: 10.5px;
          letter-spacing: 0.04em;
          opacity: 0.85;
          text-transform: none;
          margin-bottom: 3px;
        }
        .store-badge__bottom {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .stat-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding: 14px 16px;
          margin: 0 0 18px;
          background: rgba(115,49,223,0.06);
          border: 1px solid rgba(115,49,223,0.18);
          border-radius: 16px;
        }
        .stat-row__big {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 28px;
          letter-spacing: -0.02em;
          color: ${P_SEC};
          line-height: 1;
          flex-shrink: 0;
        }
        .stat-row__copy {
          color: ${TEXT};
          font-size: 14px;
          line-height: 1.45;
          margin: 0;
          text-align: left;
        }
      `}</style>

      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 12% 18%, rgba(115,49,223,0.18) 0%, transparent 55%), radial-gradient(ellipse at 88% 82%, rgba(115,49,223,0.10) 0%, transparent 50%)" }} />

      <SiteNav navigate={navigate} onGetStarted={() => navigate("/chester")} />

      <section style={{ position: "relative", zIndex: 1, padding: "104px 20px 56px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(28px, 5vw, 40px)", textAlign: "center" }} data-testid="status-purchase-success">
            <div
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 9999, background: "rgba(115,49,223,0.12)", border: "1px solid rgba(115,49,223,0.32)", color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}
              data-testid="pill-family-practice-ready"
            >
              FAMILY PRACTICE — UNLOCKED
            </div>

            <h1
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.9rem, 4.4vw, 2.5rem)", letterSpacing: "-0.025em", margin: "0 0 14px", color: TEXT, lineHeight: 1.1 }}
              data-testid="text-heading"
            >
              You're already ahead of most learners.
            </h1>

            <p
              style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.6, margin: "0 0 22px" }}
              data-testid="text-supporting"
            >
              Nearly half of learner drivers fail their driving test. Consistent practice between lessons can make a real difference.
            </p>

            <div className="stat-row" data-testid="stat-row">
              <span className="stat-row__big">~50%</span>
              <p className="stat-row__copy">
                of UK learners fail first time. Steady practice between lessons is one of the biggest things that shifts the odds.
              </p>
            </div>

            <h2
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.2rem, 2.6vw, 1.5rem)", letterSpacing: "-0.015em", margin: "20px 0 8px", color: TEXT, lineHeight: 1.2 }}
              data-testid="text-access-ready"
            >
              Your Family Practice access is ready.
            </h2>

            <p
              style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "0 0 4px" }}
              data-testid="text-download-instruction"
            >
              Download Cruzi and sign in with the same email and password you just created.
            </p>

            <div className="store-row" data-testid="store-buttons">
              <StoreButton
                href={APP_STORE_URL}
                icon={<AppleMark />}
                topLine="Download on the"
                bottomLine="App Store"
                testId="link-app-store"
                ariaLabel="Download Cruzi on the App Store"
              />
              <StoreButton
                href={PLAY_STORE_URL}
                icon={<PlayTriangle />}
                topLine="GET IT ON"
                bottomLine="Google Play"
                testId="link-play-store"
                ariaLabel="Get Cruzi on Google Play"
              />
            </div>

            <p style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.55, margin: "10px 0 0" }}>
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
