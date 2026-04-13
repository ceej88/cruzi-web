import React, { useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Loader2, Crown, Calendar, ClipboardCheck, Mic, Smartphone,
  ArrowRight, CheckCircle, Brain, Zap, Target, Map, FileText,
  Shield, Users, BookOpen, BadgeCheck, PoundSterling, Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import featureCalendar from "@/assets/feature-calendar.jpg";
import featureNotes from "@/assets/feature-notes.jpg";
import studentView from "@/assets/student-view.png";

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

const SectionPill = ({ label }: { label: string }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 9999, padding: "6px 16px", marginBottom: 20 }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: P_SEC, display: "inline-block" }} />
    <span style={{ color: P_SEC, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
  </div>
);

const CheckItem = ({ text }: { text: string }) => (
  <li style={{ display: "flex", alignItems: "flex-start", gap: 10, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
    <CheckCircle style={{ color: P_SEC, width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
    {text}
  </li>
);

const LazyVideo = ({ src, style, ...rest }: React.VideoHTMLAttributes<HTMLVideoElement> & { src: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        el.src = src;
        el.load();
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);
  return <video ref={ref} muted loop playsInline preload="none" style={style} {...rest} onError={e => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }} />;
};

const Index: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
        <Loader2 style={{ width: 32, height: 32, color: P, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (user && role === "instructor") {
    return <Navigate to="/instructor" replace />;
  }

  const handleSelectRole = (selectedRole: "instructor" | "student") => {
    if (selectedRole === "student") {
      navigate("/install");
    } else {
      navigate("/auth?role=instructor");
    }
  };

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        html { overflow-x: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes heroGlow { 0%,100% { opacity:0.6; transform:scale(1) } 50% { opacity:1; transform:scale(1.08) } }
        @keyframes btnPulse { 0%,100% { box-shadow:0 0 16px rgba(124,58,237,0.5),0 0 32px rgba(124,58,237,0.2) } 50% { box-shadow:0 0 28px rgba(124,58,237,0.75),0 0 56px rgba(124,58,237,0.35) } }
        @keyframes gradShift { 0% { background-position:0% 50% } 50% { background-position:100% 50% } 100% { background-position:0% 50% } }
        @keyframes floatA { 0%,100% { transform:translate(0,0) } 50% { transform:translate(20px,-18px) } }
        @keyframes floatB { 0%,100% { transform:translate(0,0) } 50% { transform:translate(-16px,14px) } }
        .hero-grad { background: linear-gradient(90deg, #7c3aed, #bd9dff, #a78bfa, #7c3aed); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation: gradShift 5s ease infinite; }
        .btn-pulse { animation: btnPulse 3s ease-in-out infinite; }
        .orb-a { animation: heroGlow 9s ease-in-out infinite; }
        .orb-b { animation: heroGlow 12s ease-in-out infinite reverse; }
        .float-a { animation: floatA 8s ease-in-out infinite; }
        .float-b { animation: floatB 10s ease-in-out infinite 1s; }
        .role-card:hover { border-color: rgba(124,58,237,0.5) !important; transform: translateY(-4px); }
        .role-card { transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s; }
        .role-card:hover { box-shadow: 0 16px 48px rgba(124,58,237,0.18); }
        .feat-card:hover { border-color: rgba(124,58,237,0.4) !important; }
        .feat-card { transition: border-color 0.25s, box-shadow 0.25s; }
        .feat-card:hover { box-shadow: 0 0 36px rgba(124,58,237,0.12); }
        .price-card:hover { border-color: rgba(124,58,237,0.5) !important; transform: translateY(-4px); }
        .price-card { transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s; }
        .step-num { background: rgba(124,58,237,0.18); border: 1px solid rgba(124,58,237,0.4); }
      `}</style>

      {/* ─── AMBIENT BG ─── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 15% 25%, rgba(124,58,237,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(189,157,255,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(124,58,237,0.08) 0%, transparent 45%)` }} />

      {/* ─── NAV ─── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(6,14,32,0.75)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(189,157,255,0.08)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/")} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: TEXT, background: "none", border: "none", cursor: "pointer" }}>
          Cruzi
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <button onClick={() => navigate("/features")} style={{ color: MUTED, background: "none", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = TEXT)} onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>Features</button>
          <button onClick={() => navigate("/savings")} style={{ color: MUTED, background: "none", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = TEXT)} onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>ROI Calculator</button>
          <button onClick={() => navigate("/auth?mode=login")} style={{ color: MUTED, background: "none", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = TEXT)} onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>Log In</button>
          <button
            onClick={() => handleSelectRole("instructor")}
            style={{ background: P, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 9999, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.25s", boxShadow: `0 0 16px ${GLOW}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(124,58,237,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 16px ${GLOW}`; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 60px", textAlign: "center" }}>

        {/* Orbs */}
        <div className="orb-a" style={{ position: "absolute", top: "12%", left: "6%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="orb-b" style={{ position: "absolute", bottom: "15%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(189,157,255,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

        <motion.div {...fadeUp}>
          <SectionPill label="BUILT FOR UK ADIS" />
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2.8rem, 6.5vw, 5.4rem)", lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 28px", maxWidth: 860, textShadow: "0 0 40px rgba(124,58,237,0.2)" }}
        >
          The app UK driving<br />
          <span className="hero-grad">instructors actually</span><br />
          love using.
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: MUTED, maxWidth: 560, lineHeight: 1.75, margin: "0 0 52px" }}
        >
          Lesson plans in 2 minutes. Students practice between lessons. Parents see real-time progress. One platform — three experiences.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
          <button
            className="btn-pulse"
            onClick={() => handleSelectRole("instructor")}
            style={{ background: P, color: "#fff", border: "none", padding: "17px 40px", borderRadius: 9999, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "transform 0.25s", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Start Free — No Card Needed <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
          <button
            onClick={() => handleSelectRole("student")}
            style={{ background: "rgba(255,255,255,0.05)", color: TEXT, border: `1px solid ${GLASS_B}`, padding: "17px 40px", borderRadius: 9999, fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.25s", backdropFilter: "blur(8px)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(189,157,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = GLASS_B; }}
          >
            Get the Student App
          </button>
        </motion.div>

        {/* Role Cards */}
        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.4 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, maxWidth: 860, width: "100%" }}>
          {[
            { icon: BookOpen, label: "I'm a driving instructor", desc: "Diary, pupils, finances and compliance — all in one place.", cta: "Start Free Trial", onClick: () => handleSelectRole("instructor"), accent: P },
            { icon: ClipboardCheck, label: "I'm learning to drive", desc: "Track your progress, book lessons and prepare for your test.", cta: "Get the App", onClick: () => handleSelectRole("student"), accent: P_SEC },
            { icon: Shield, label: "I'm a parent", desc: "Support your child's learning with guided Co-Pilot practice sessions.", cta: "Find Out More", onClick: () => handleSelectRole("student"), accent: "#a78bfa" },
          ].map((card) => (
            <button
              key={card.label}
              className="role-card"
              onClick={card.onClick}
              style={{ ...glassCard, padding: "28px 24px", textAlign: "left", cursor: "pointer", background: "rgba(31,43,73,0.35)", border: `1px solid ${GLASS_B}` }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${card.accent}88, transparent)` }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.accent}22`, border: `1px solid ${card.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: `0 0 16px ${card.accent}30` }}>
                <card.icon style={{ color: card.accent, width: 20, height: 20 }} />
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: "0 0 8px", color: TEXT }}>{card.label}</h3>
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.65, margin: "0 0 16px" }}>{card.desc}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: card.accent, fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {card.cta} <ArrowRight style={{ width: 14, height: 14 }} />
              </span>
            </button>
          ))}
        </motion.div>
      </section>

      {/* ─── DEMO VIDEO ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <motion.div {...fadeUp}>
            <div style={{ borderRadius: 24, overflow: "hidden", background: "#0d1117", boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${GLASS_B}`, isolation: "isolate" }}>
              <video
                src="https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/hero-demo.mp4"
                autoPlay muted loop playsInline preload="metadata"
                style={{ width: "100%", display: "block" }}
                onError={e => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
        <motion.div {...fadeUp} style={{ maxWidth: 900, margin: "0 auto", ...glassCard, padding: "20px 32px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 32 }}>
          {["DVSA Syllabus Aligned", "GDPR Compliant", "Works on Any Device", "No Contract Required", "Offline Mode Included"].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: MUTED }}>
              <CheckCircle style={{ color: P_SEC, width: 15, height: 15, flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── CORE FEATURES ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ marginBottom: 60, textAlign: "center" }}>
            <SectionPill label="CORE FEATURES" />
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 16px", textShadow: "0 0 30px rgba(124,58,237,0.15)" }}>
              The tools that run your business
            </h2>
            <p style={{ color: MUTED, fontSize: 17, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Built by people who understand what ADIs actually need — not generic software forced to fit.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              {
                icon: Calendar, label: "Diary & Scheduling",
                desc: "Your week, mastered. Drag and reschedule lessons, block time off, colour-code every student.",
                img: featureCalendar,
                highlight: ["Drag-and-drop rescheduling", "Colour-coded by student", "Block time management", "Upcoming lesson summaries"],
              },
              {
                icon: ClipboardCheck, label: "Pupil Progress",
                desc: "Track all 38 DVSA competencies on the official 1–5 scale. Know exactly when a pupil is test-ready.",
                img: studentView,
                phone: true,
                highlight: ["All 38 DVSA topics scored", "Test readiness indicator", "Shared with students & parents", "Historical progress view"],
              },
              {
                icon: Mic, label: "Voice Scribe",
                desc: "After every session, speak. Cruzi listens, transcribes and formats your notes into professional lesson records.",
                img: featureNotes,
                highlight: ["AI-powered transcription", "Auto-formatted records", "Session analysis included", "Stored against pupil history"],
              },
              {
                icon: Smartphone, label: "Student App",
                desc: "Your students live on their phones. Give them progress tracking, lesson booking and direct instructor communication.",
                img: null,
                video: "https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/hero-mobile.mp4",
                highlight: ["Progress across all DVSA skills", "Lesson booking & history", "Theory prep resources", "Direct instructor chat"],
              },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="feat-card"
                style={{ ...glassCard, borderTop: "1px solid rgba(189,157,255,0.35)", display: "flex", flexDirection: "column" }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(189,157,255,0.5), transparent)" }} />
                <div style={{
                  height: (f as any).phone ? 280 : 200,
                  overflow: "hidden",
                  borderRadius: "24px 24px 0 0",
                  background: (f as any).phone
                    ? "radial-gradient(ellipse at center 60%, rgba(124,58,237,0.22) 0%, #090d1a 65%)"
                    : "#0d1117",
                  display: "flex",
                  alignItems: (f as any).phone ? "flex-end" : undefined,
                  justifyContent: (f as any).phone ? "center" : undefined,
                }}>
                  {(f as any).video ? (
                    <LazyVideo src={(f as any).video} autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" as const, opacity: 0.9 }} />
                  ) : f.img && (f as any).phone ? (
                    <img
                      src={f.img} alt={f.label} loading="lazy"
                      style={{
                        height: "95%",
                        width: "auto",
                        objectFit: "contain",
                        objectPosition: "center bottom",
                        filter: "drop-shadow(0 -8px 32px rgba(124,58,237,0.35))",
                      }}
                    />
                  ) : f.img ? (
                    <img src={f.img} alt={f.label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                  ) : null}
                </div>
                <div style={{ padding: "28px 28px 32px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 12px rgba(124,58,237,0.2)" }}>
                    <f.icon style={{ color: P_SEC, width: 20, height: 20 }} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 19, margin: "0 0 10px", color: TEXT, letterSpacing: "-0.01em" }}>{f.label}</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>{f.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {f.highlight.map(h => <CheckItem key={h} text={h} />)}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} style={{ textAlign: "center", marginTop: 48 }}>
            <button
              onClick={() => navigate("/features")}
              style={{ background: "rgba(255,255,255,0.05)", color: P_SEC, border: `1px solid rgba(124,58,237,0.35)`, padding: "14px 36px", borderRadius: 9999, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.25s", backdropFilter: "blur(8px)", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.12)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"; }}
            >
              See all features <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── MOCK TEST ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ ...glassCard, padding: "clamp(32px, 5vw, 56px) clamp(24px, 5vw, 48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 48, alignItems: "center" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(189,157,255,0.4), transparent)" }} />
            <motion.div {...fadeUp}>
              <SectionPill label="MOCK TEST RECORDING" />
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.7rem, 3vw, 2.5rem)", letterSpacing: "-0.02em", margin: "0 0 20px", color: TEXT }}>
                Professional debrief.<br />
                <span style={{ color: P_SEC }}>In seconds, not minutes.</span>
              </h2>
              <p style={{ color: MUTED, lineHeight: 1.8, margin: "0 0 32px", fontSize: 15 }}>
                Record faults against all 26 DVSA categories during a live mock test. Generate a professional report instantly — no paper, no clipboard, no delay.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {["All 26 DVSA fault categories covered", "Driver and serious fault tracking", "One-tap report sharing with students", "Stored automatically in pupil history"].map(item => <CheckItem key={item} text={item} />)}
              </ul>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <div style={{ borderRadius: 20, overflow: "hidden", background: "#0d1117", boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${GLASS_B}`, isolation: "isolate" }}>
                <LazyVideo
                  src="https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/mocktest-demo.mp4"
                  autoPlay style={{ width: "100%", display: "block" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── AI POWERED ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 60 }}>
            <SectionPill label="AI-POWERED" />
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              Intelligence built in
            </h2>
            <p style={{ color: MUTED, fontSize: 17, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Not AI for the sake of it — tools that actually save you time every single day.
            </p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { icon: Brain, label: "AI Lesson Planning", desc: "Auto-generates lesson plans from each student's skill scores and lesson history. One tap." },
              { icon: Mic, label: "Voice Scribe", desc: "Powered by Google Gemini 2.5. Speak after a session — get formatted professional notes." },
              { icon: Zap, label: "Cruzi Intelligence", desc: "Your personal AI teaching assistant. Ask anything about your students or DVSA requirements." },
              { icon: Target, label: "Test Readiness Score", desc: "Real-time percentage readiness calculated from all 38 DVSA competencies. No guesswork." },
              { icon: Map, label: "Local Intel Quiz", desc: "AI-generated interactive quizzes about tricky local test routes and hazards. Built per postcode." },
              { icon: FileText, label: "DVSA Insights", desc: "Request, track and analyse official DVSA test data reports. Understand local pass rates." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="feat-card"
                style={{ ...glassCard, padding: "28px 24px" }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(189,157,255,0.35), transparent)" }} />
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 12px rgba(124,58,237,0.2)" }}>
                  <item.icon style={{ color: P_SEC, width: 18, height: 18 }} />
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 8px", color: TEXT }}>{item.label}</h3>
                <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionPill label="HOW IT WORKS" />
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              Up and running in minutes
            </h2>
            <p style={{ color: MUTED, fontSize: 17, lineHeight: 1.7, margin: 0 }}>No complicated setup. No training required.</p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {[
              { step: "1", title: "Create your account", desc: "Sign up free in under 2 minutes. No card, no contract, no catch." },
              { step: "2", title: "Set up your diary", desc: "Add students, set your availability and configure your lesson types." },
              { step: "3", title: "Invite your students", desc: "Share a PIN or link. They join instantly and see their progress live." },
            ].map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.15 }} style={{ textAlign: "center" }}>
                <div className="step-num" style={{ width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 24px rgba(124,58,237,0.2)" }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: P_SEC }}>{item.step}</span>
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, margin: "0 0 10px", color: TEXT }}>{item.title}</h3>
                <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionPill label="PRICING" />
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: MUTED, fontSize: 17, lineHeight: 1.7, margin: 0 }}>Start free. Upgrade when you're ready.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, alignItems: "start" }}>
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
                className="price-card"
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
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: P, color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 16px", borderRadius: 9999, letterSpacing: "0.06em", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap", boxShadow: `0 0 16px ${GLOW}` }}>
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
                  onClick={() => handleSelectRole("instructor")}
                  style={{
                    width: "100%", padding: "14px 0", border: "none", borderRadius: 9999, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.25s", fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: plan.pro ? P : "rgba(255,255,255,0.07)",
                    color: plan.pro ? "#fff" : TEXT,
                    boxShadow: plan.pro ? `0 0 20px ${GLOW}` : "none",
                    border: plan.pro ? "none" : `1px solid ${GLASS_B}` as any,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; if (plan.pro) e.currentTarget.style.boxShadow = "0 0 32px rgba(124,58,237,0.55)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; if (plan.pro) e.currentTarget.style.boxShadow = `0 0 20px ${GLOW}`; }}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SAVINGS CTA ─── */}
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
              style={{ background: "rgba(124,58,237,0.2)", color: P_SEC, border: "1px solid rgba(124,58,237,0.4)", padding: "14px 36px", borderRadius: 9999, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.25s", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.3)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.2)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; }}
            >
              Try the Calculator <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIAL ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(36px, 6vw, 56px)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(189,157,255,0.45), transparent)" }} />
            <div style={{ fontSize: "7rem", lineHeight: 0.8, fontFamily: "Georgia, serif", color: P_SEC, opacity: 0.25, marginBottom: 24 }}>&ldquo;</div>
            <blockquote style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)", fontStyle: "italic", color: TEXT, lineHeight: 1.75, margin: "0 0 36px", fontWeight: 400 }}>
              I switched from TD Drive the same week I tried Cruzi. My students are more engaged between lessons than they have ever been. Parents are now messaging me asking questions they never asked before.
            </blockquote>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, margin: "0 0 2px", color: TEXT }}>Erica Vale</p>
                <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>Independent ADI, Chester</p>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: P_SEC }}>
                <BadgeCheck style={{ width: 12, height: 12 }} /> Verified
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 120px", textAlign: "center" }}>
        <motion.div {...fadeUp} style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", margin: "0 0 20px", textShadow: "0 0 40px rgba(124,58,237,0.25)" }}>
            Start free today.<br />
            <span style={{ color: P_SEC }}>No card required.</span>
          </h2>
          <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, margin: "0 0 44px" }}>
            Up and running in minutes. Your students will notice the difference from lesson one.
          </p>
          <button
            className="btn-pulse"
            onClick={() => handleSelectRole("instructor")}
            style={{ background: P, color: "#fff", border: "none", padding: "18px 52px", borderRadius: 9999, fontSize: 17, fontWeight: 700, cursor: "pointer", transition: "transform 0.25s", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 10 }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Get Started Free <ArrowRight style={{ width: 20, height: 20 }} />
          </button>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(189,157,255,0.08)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: TEXT }}>Cruzi</span>
            <p style={{ color: MUTED, fontSize: 13, margin: "4px 0 0" }}>The smarter way to manage your driving school.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {[
              { label: "Features", href: "/features" },
              { label: "ROI Calculator", href: "/savings" },
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "Cookies", href: "/cookies" },
              { label: "Acceptable Use", href: "/acceptable-use" },
            ].map(link => (
              <a key={link.label} href={link.href} style={{ color: MUTED, fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = TEXT)} onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "24px auto 0", paddingTop: 24, borderTop: "1px solid rgba(189,157,255,0.06)", textAlign: "center" }}>
          <p style={{ color: MUTED, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Cruzi. All rights reserved.</p>
        </div>
      </footer>

      {/* ─── OWNER CROWN (secret) ─── */}
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 50, opacity: 0.15, transition: "opacity 0.3s ease" }} onMouseEnter={e => (e.currentTarget.style.opacity = "1")} onMouseLeave={e => (e.currentTarget.style.opacity = "0.15")}>
        <button
          onClick={() => navigate("/owner")}
          style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: `1px solid ${GLASS_B}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.3s ease" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,215,0,0.15)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <Crown style={{ width: 14, height: 14, color: MUTED }} />
        </button>
      </div>
    </div>
  );
};

export default Index;
