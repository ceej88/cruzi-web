import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, ClipboardCheck, Mic, Smartphone,
  Brain, Zap, Trophy, Shield, Users, Map,
  CheckCircle, ArrowRight, BookOpen,
  Clock, FileText, Layers, BadgeCheck, Target, Wifi,
} from "lucide-react";
import featureCalendar from "@/assets/feature-calendar.jpg";
import featureNotes from "@/assets/feature-notes.jpg";
import studentView from "@/assets/student-view.png";

const BG       = "#060e20";
const GLASS    = "rgba(31, 43, 73, 0.45)";
const GLASS_B  = "rgba(189, 157, 255, 0.12)";
const P        = "#7c3aed";
const P_SEC    = "#bd9dff";
const TEXT     = "#dee5ff";
const MUTED    = "#a3aac4";
const GLOW     = "rgba(124,58,237,0.35)";

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

const glassCardHighlight: React.CSSProperties = {
  ...glassCard,
  borderTop: `1px solid rgba(189,157,255,0.35)`,
};

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

const SectionPill = ({ label }: { label: string }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "rgba(124,58,237,0.15)",
      border: "1px solid rgba(124,58,237,0.4)",
      borderRadius: 9999,
      padding: "6px 16px",
      marginBottom: 20,
    }}
  >
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: P_SEC, display: "inline-block" }} />
    <span style={{ color: P_SEC, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {label}
    </span>
  </div>
);

const CheckItem = ({ text }: { text: string }) => (
  <li style={{ display: "flex", alignItems: "flex-start", gap: 10, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
    <CheckCircle style={{ color: P_SEC, width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
    {text}
  </li>
);

export default function FeaturesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      <style>{`html { overflow-x: hidden; }`}</style>

      {/* ─── AMBIENT BACKGROUND ─── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse at 15% 25%, rgba(124,58,237,0.18) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 75%, rgba(189,157,255,0.10) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 90%, rgba(124,58,237,0.08) 0%, transparent 45%)
        `,
      }} />

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(6,14,32,0.75)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(189,157,255,0.08)",
        padding: "0 24px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button
          onClick={() => navigate("/")}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: TEXT, background: "none", border: "none", cursor: "pointer" }}
        >
          Cruzi
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <button
            onClick={() => navigate("/auth?mode=login")}
            style={{ color: MUTED, background: "none", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/auth?role=instructor")}
            style={{
              background: P, color: "#fff", border: "none",
              padding: "10px 22px", borderRadius: 9999, fontSize: 14, fontWeight: 700,
              cursor: "pointer", transition: "all 0.25s",
              boxShadow: `0 0 16px ${GLOW}`,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(124,58,237,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 16px ${GLOW}`; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", textAlign: "center" }}>

        <style>{`
          @keyframes heroGlow { 0%,100% { opacity:0.6; transform:scale(1) } 50% { opacity:1; transform:scale(1.08) } }
          @keyframes btnPulse { 0%,100% { box-shadow:0 0 16px rgba(124,58,237,0.5),0 0 32px rgba(124,58,237,0.2) } 50% { box-shadow:0 0 28px rgba(124,58,237,0.75),0 0 56px rgba(124,58,237,0.35) } }
          @keyframes gradShift { 0% { background-position:0% 50% } 50% { background-position:100% 50% } 100% { background-position:0% 50% } }
          .hero-grad { background: linear-gradient(90deg, #7c3aed, #bd9dff, #7c3aed); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation: gradShift 4s ease infinite; }
          .btn-pulse { animation: btnPulse 3s ease-in-out infinite; }
          .orb-a { animation: heroGlow 9s ease-in-out infinite; }
          .orb-b { animation: heroGlow 12s ease-in-out infinite reverse; }
        `}</style>

        {/* Background orbs */}
        <div className="orb-a" style={{ position: "absolute", top: "15%", left: "8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="orb-b" style={{ position: "absolute", bottom: "20%", right: "6%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(189,157,255,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

        <motion.div {...fadeUp}>
          <SectionPill label="BUILT FOR UK ADIS" />
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2.6rem, 6vw, 5rem)", lineHeight: 1.08, letterSpacing: "-0.03em", margin: "0 0 24px", maxWidth: 820, textShadow: "0 0 40px rgba(124,58,237,0.2)" }}
        >
          Every Tool Your<br />
          <span className="hero-grad">Driving School</span><br />
          Needs.
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: MUTED, maxWidth: 560, lineHeight: 1.7, margin: "0 0 48px" }}
        >
          One platform connecting UK instructors, students and parents — from the very first lesson to test day and beyond.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
        >
          <button
            className="btn-pulse"
            onClick={() => navigate("/auth?role=instructor")}
            style={{
              background: P, color: "#fff", border: "none",
              padding: "16px 36px", borderRadius: 9999, fontSize: 16, fontWeight: 700,
              cursor: "pointer", transition: "transform 0.25s",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 8,
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Get Started Free <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
          <button
            onClick={() => navigate("/savings")}
            style={{
              background: "rgba(255,255,255,0.05)", color: TEXT, border: `1px solid ${GLASS_B}`,
              padding: "16px 36px", borderRadius: 9999, fontSize: 16, fontWeight: 600,
              cursor: "pointer", transition: "all 0.25s", backdropFilter: "blur(8px)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = `rgba(189,157,255,0.3)`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = GLASS_B; }}
          >
            See the ROI Calculator
          </button>
        </motion.div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
        <motion.div
          {...fadeUp}
          style={{
            maxWidth: 900, margin: "0 auto",
            ...glassCard,
            padding: "20px 32px",
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 32,
          }}
        >
          {[
            "DVSA Syllabus Aligned",
            "GDPR Compliant",
            "Works on Any Device",
            "No Contract Required",
            "Offline Mode Included",
          ].map(item => (
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
                desc: "Your week, mastered. Drag and reschedule lessons, block time off, colour-code every student. A calendar that works the way you think.",
                img: featureCalendar,
                highlight: ["Drag-and-drop rescheduling", "Colour-coded by student", "Block time management", "Upcoming lesson summaries"],
              },
              {
                icon: ClipboardCheck, label: "Pupil Progress",
                desc: "Track all 38 DVSA competencies on the official 1–5 scale. Share real-time progress with students and parents. Know exactly when a pupil is test-ready.",
                img: studentView,
                phone: true,
                highlight: ["All 38 DVSA topics scored", "Test readiness indicator", "Shared with students & parents", "Historical progress view"],
              },
              {
                icon: Mic, label: "Voice Scribe",
                desc: "After every session, speak. Cruzi listens, transcribes and formats your notes into professional lesson records — before you've left the car park.",
                img: featureNotes,
                highlight: ["AI-powered transcription", "Auto-formatted records", "Session analysis included", "Stored against pupil history"],
              },
              {
                icon: Smartphone, label: "Student App",
                desc: "Your students live on their phones. Give them progress tracking, lesson booking, theory prep and direct instructor communication — all in one place.",
                img: null,
                video: "https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/hero-mobile.mp4",
                highlight: ["Progress across all DVSA skills", "Lesson booking & history", "Theory prep resources", "Direct instructor chat"],
              },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ ...glassCardHighlight, display: "flex", flexDirection: "column" }}
              >
                {/* Top shimmer line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(189,157,255,0.5), transparent)" }} />

                {/* Media */}
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
        </div>
      </section>

      {/* ─── MOCK TEST ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ ...glassCard, padding: "56px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(189,157,255,0.4), transparent)" }} />
            <motion.div {...fadeUp}>
              <SectionPill label="MOCK TEST RECORDING" />
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.7rem, 3vw, 2.5rem)", letterSpacing: "-0.02em", margin: "0 0 20px", color: TEXT }}>
                Professional debrief.<br />
                <span style={{ color: P_SEC }}>In seconds, not minutes.</span>
              </h2>
              <p style={{ color: MUTED, lineHeight: 1.8, margin: "0 0 32px", fontSize: 15 }}>
                Record faults against all 26 DVSA categories during a live mock test. Generate a professional debrief report instantly — no paper, no clipboard, no delay.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {["All 26 DVSA fault categories covered", "Driver and serious fault tracking", "One-tap report sharing with students", "Stored automatically in pupil history", "Comparable against previous mocks"].map(item => <CheckItem key={item} text={item} />)}
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
              { icon: Brain, label: "AI Lesson Planning", desc: "Auto-generates lesson plans based on each student's skill scores and lesson history. One tap." },
              { icon: Mic, label: "Voice Scribe", desc: "Powered by Google Gemini 2.5. Speak after a session — get formatted professional notes." },
              { icon: Zap, label: "Cruzi Intelligence", desc: "Your personal AI teaching assistant. Ask anything about your students, lesson strategy, or DVSA requirements." },
              { icon: Target, label: "DVSA Insights", desc: "Request, track and analyse official DVSA test data reports. Understand local test pass rates and examiner patterns." },
              { icon: Map, label: "Local Intel Quiz", desc: "AI-generated interactive quizzes about tricky local test routes and hazards. Built per postcode." },
              { icon: FileText, label: "Test Readiness Score", desc: "Real-time percentage readiness calculated from all 38 DVSA competencies. No guesswork." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{ ...glassCard, padding: "28px 24px" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.4)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px rgba(124,58,237,0.12)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = GLASS_B; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
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

      {/* ─── THREE ROLES ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 60 }}>
            <SectionPill label="WHO IT'S FOR" />
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              One platform.<br />Three experiences.
            </h2>
            <p style={{ color: MUTED, fontSize: 17, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Every role gets exactly what they need — nothing more, nothing less.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              {
                icon: BookOpen, label: "For Instructors",
                colour: P,
                items: ["Lesson plans generated in 2 minutes", "Morning briefing auto-generated", "Mock test recording on the go", "Voice scribe after every session", "38-point skill tracking per pupil", "Full financial dashboard"],
              },
              {
                icon: Users, label: "For Students",
                colour: P_SEC,
                items: ["Real-time progress across all DVSA skills", "Test routes to practise between lessons", "Theory prep resources", "Lesson history and upcoming bookings", "Direct connection to instructor", "Achievement badges as milestones"],
              },
              {
                icon: Shield, label: "For Parents",
                colour: "#a78bfa",
                items: ["Live progress dashboard at a glance", "Co-pilot practice guide for lessons", "Test date and readiness countdown", "Between-lesson tracking", "Instructor messaging", "Peace of mind, built in"],
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                style={{ ...glassCard, padding: "36px 32px", borderTop: `2px solid ${card.colour}` }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${card.colour}88, transparent)` }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.colour}22`, border: `1px solid ${card.colour}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: `0 0 16px ${card.colour}30` }}>
                  <card.icon style={{ color: card.colour, width: 20, height: 20 }} />
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, margin: "0 0 20px", color: TEXT }}>{card.label}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {card.items.map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: MUTED, fontSize: 14 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: card.colour, flexShrink: 0, marginTop: 7 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MORE FEATURES GRID ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 60 }}>
            <SectionPill label="AND SO MUCH MORE" />
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              Every detail, covered
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { icon: FileText, label: "Test Manager", desc: "Secure PRN vault, student test booking, and instructor approval flow." },
              { icon: Clock, label: "Smart Gap Slots", desc: "Intelligent availability detection fills your diary automatically." },
              { icon: Trophy, label: "Achievement Badges", desc: "15 milestone badges to celebrate student progress and confidence." },
              { icon: Map, label: "Test Routes", desc: "Record or manually input real test routes for students to practise." },
              { icon: Wifi, label: "Offline Mode", desc: "Cache-first design — works without a signal, syncs when back online." },
              { icon: Layers, label: "Terms of Business", desc: "Set your cancellation policy, rates, and terms. Students see them before booking." },
              { icon: BadgeCheck, label: "DVSA Aligned", desc: "Every skill, score and report maps directly to the official DVSA syllabus." },
              { icon: Users, label: "Connection Hub", desc: "Student-instructor linking by PIN or link. No friction, instant access." },
              { icon: Brain, label: "Custom Lesson Types", desc: "Configure lesson types with custom names, pricing, hours and icons." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                style={{ ...glassCard, padding: "24px 22px" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(189,157,255,0.25)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = GLASS_B; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(189,157,255,0.25), transparent)" }} />
                <item.icon style={{ color: P_SEC, width: 20, height: 20, marginBottom: 12 }} />
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, margin: "0 0 6px", color: TEXT }}>{item.label}</h3>
                <p style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.div
            {...fadeUp}
            style={{ ...glassCard, padding: "56px 56px 48px" }}
          >
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
            onClick={() => navigate("/auth?role=instructor")}
            style={{
              background: P, color: "#fff", border: "none",
              padding: "18px 48px", borderRadius: 9999, fontSize: 17, fontWeight: 700,
              cursor: "pointer", transition: "transform 0.25s",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}
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
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "Cookies", href: "/cookies" },
              { label: "Acceptable Use", href: "/acceptable-use" },
            ].map(link => (
              <a key={link.label} href={link.href} style={{ color: MUTED, fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >{link.label}</a>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "24px auto 0", paddingTop: 24, borderTop: "1px solid rgba(189,157,255,0.06)", textAlign: "center" }}>
          <p style={{ color: MUTED, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Cruzi. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
