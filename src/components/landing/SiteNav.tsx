import React, { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const BG_NAV = "rgba(6,14,32,0.75)";
const TEXT = "#dee5ff";
const MUTED = "#a3aac4";
const P = "#7c3aed";
const GLOW = "rgba(124,58,237,0.35)";

interface SiteNavProps {
  navigate: (path: string) => void;
  onGetStarted: () => void;
}

const SiteNav: React.FC<SiteNavProps> = ({ navigate, onGetStarted }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .site-nav-links { display: none !important; }
          .site-nav-burger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .site-nav-burger { display: none !important; }
          .site-nav-mobile { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: BG_NAV,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(189,157,255,0.08)",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: 22, color: TEXT,
            background: "none", border: "none", cursor: "pointer",
            letterSpacing: "-0.02em",
          }}
        >
          Cruzi
        </button>

        <div className="site-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {[
            { label: "Features", path: "/features" },
            { label: "Pricing", path: "/pricing" },
            { label: "ROI Calculator", path: "/savings" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                color: MUTED, background: "none", border: "none",
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => navigate("/auth?mode=login")}
            style={{
              color: MUTED, background: "none", border: "none",
              fontSize: 14, fontWeight: 500, cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
          >
            Log In
          </button>
          <button
            onClick={onGetStarted}
            style={{
              background: P, color: "#fff", border: "none",
              padding: "10px 22px", borderRadius: 9999, fontSize: 14,
              fontWeight: 700, cursor: "pointer", transition: "all 0.25s",
              boxShadow: `0 0 16px ${GLOW}`,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(124,58,237,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 16px ${GLOW}`; }}
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>

        <button
          className="site-nav-burger"
          onClick={() => setOpen(o => !o)}
          style={{
            display: "none", alignItems: "center", justifyContent: "center",
            background: "none", border: "none", color: TEXT, cursor: "pointer",
            padding: 6,
          }}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div
          className="site-nav-mobile"
          style={{
            position: "fixed", top: 64, left: 0, right: 0, bottom: 0,
            zIndex: 99, background: "rgba(6,14,32,0.97)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            display: "flex", flexDirection: "column",
            padding: "32px 24px", gap: 8,
          }}
        >
          {[
            { label: "Features", path: "/features" },
            { label: "Pricing", path: "/pricing" },
            { label: "ROI Calculator", path: "/savings" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); navigate(item.path); }}
              style={{
                color: TEXT, background: "none", border: "none",
                fontSize: 20, fontWeight: 600, cursor: "pointer",
                textAlign: "left", padding: "14px 0",
                borderBottom: "1px solid rgba(189,157,255,0.08)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {item.label}
            </button>
          ))}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 32 }}>
            <button
              onClick={() => { setOpen(false); navigate("/auth?mode=login"); }}
              style={{
                width: "100%", padding: "16px 0", fontSize: 17, fontWeight: 700,
                color: TEXT, background: "none",
                border: `1px solid rgba(189,157,255,0.2)`,
                borderRadius: 14, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Log In
            </button>
            <button
              onClick={() => { setOpen(false); onGetStarted(); }}
              style={{
                width: "100%", padding: "16px 0", fontSize: 17, fontWeight: 700,
                color: "#fff", background: P, border: "none",
                borderRadius: 14, cursor: "pointer",
                boxShadow: `0 0 20px ${GLOW}`,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteNav;
