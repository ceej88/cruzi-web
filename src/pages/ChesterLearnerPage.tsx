import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle, MapPin, Clock, Sparkles, Compass, Mic,
  ShieldCheck, GraduationCap, BadgeCheck, ChevronDown, ChevronUp,
} from "lucide-react";
import SiteNav from "@/components/landing/SiteNav";
import { usePageMeta } from "@/hooks/usePageMeta";

/* ───────────────────────────────────────────────────────────────
   Production design tokens — identical to src/pages/Index.tsx
   Do not introduce new colour values. Do not switch to Tailwind
   class soup. This page must read as the same designer's work.
   ─────────────────────────────────────────────────────────────── */
const BG      = "#F8F9FF";
const GLASS   = "rgba(255, 255, 255, 0.85)";
const GLASS_B = "rgba(115, 49, 223, 0.18)";
const P       = "#5300B7";
const P_SEC   = "#6D28D9";
const TEXT    = "#0D1C2F";
const MUTED   = "#4A4455";
const GLOW    = "rgba(115, 49, 223, 0.28)";

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
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(115,49,223,0.15)", border: "1px solid rgba(115,49,223,0.4)", borderRadius: 9999, padding: "6px 16px", marginBottom: 20 }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: P_SEC, display: "inline-block" }} />
    <span style={{ color: P_SEC, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
  </div>
);

const CheckItem = ({ text }: { text: string }) => (
  <li style={{ display: "flex", alignItems: "flex-start", gap: 10, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
    <CheckCircle style={{ color: P_SEC, width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
    <span>{text}</span>
  </li>
);

const sectionHeading: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 800,
  fontSize: "clamp(2rem, 4vw, 3rem)",
  letterSpacing: "-0.02em",
  margin: "0 0 16px",
  color: TEXT,
};
const sectionLead: React.CSSProperties = {
  color: MUTED,
  fontSize: 17,
  lineHeight: 1.7,
  margin: 0,
  maxWidth: 640,
};

/* ───────────────────────────────────────────────────────────────
   Page
   ─────────────────────────────────────────────────────────────── */
const ChesterLearnerPage: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const localRef = useRef<HTMLDivElement>(null);

  // Load Plus Jakarta Sans dynamically — same pattern as Index.tsx
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  usePageMeta({
    title: "Cruzi for Learners — Chester | Practice between lessons",
    description: "Join the Chester practice list. Cruzi helps UK learner drivers turn weekly lessons into daily progress with guided routes, mock theory and parent Co-Pilot mode.",
    canonical: "https://cruzi.co.uk/chester",
  });

  // ── form state (local only — no backend in PR2) ────────────────
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [postcodePrefix, setPostcodePrefix] = useState("");
  const [referral, setReferral] = useState("");
  const [joined, setJoined] = useState(false);
  const [interestedInPass, setInterestedInPass] = useState(false);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = firstName.trim().length >= 2 && validEmail;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setJoined(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* ── shared keyframes / hover classes (mirrors Index.tsx) ── */}
      <style>{`
        html { overflow-x: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes heroGlow { 0%,100% { opacity:0.6; transform:scale(1) } 50% { opacity:1; transform:scale(1.08) } }
        @keyframes btnPulse { 0%,100% { box-shadow:0 0 16px rgba(115,49,223,0.5),0 0 32px rgba(115,49,223,0.2) } 50% { box-shadow:0 0 28px rgba(115,49,223,0.75),0 0 56px rgba(115,49,223,0.35) } }
        @keyframes gradShift { 0% { background-position:0% 50% } 50% { background-position:100% 50% } 100% { background-position:0% 50% } }
        .hero-grad { background: linear-gradient(90deg, #5300B7, #7331DF, #6D28D9, #5300B7); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation: gradShift 5s ease infinite; }
        .btn-pulse { animation: btnPulse 3s ease-in-out infinite; }
        .orb-a { animation: heroGlow 9s ease-in-out infinite; }
        .orb-b { animation: heroGlow 12s ease-in-out infinite reverse; }
        .feat-card { transition: border-color 0.25s, box-shadow 0.25s; }
        .feat-card:hover { border-color: rgba(115,49,223,0.4) !important; box-shadow: 0 0 36px rgba(115,49,223,0.12); }
        .chip { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:9999px; background:rgba(115,49,223,0.10); border:1px solid rgba(115,49,223,0.22); color:${P_SEC}; font-size:12px; font-weight:600; font-family:'Plus Jakarta Sans', sans-serif; }
        .field { width:100%; padding:14px 16px; border-radius:14px; border:1px solid ${GLASS_B}; background:rgba(255,255,255,0.85); color:${TEXT}; font-size:15px; font-family:'Inter', sans-serif; outline:none; transition: border-color .2s, box-shadow .2s; }
        .field::placeholder { color: #8a8694; }
        .field:focus { border-color: rgba(115,49,223,0.55); box-shadow: 0 0 0 4px rgba(115,49,223,0.10); }
        .field-label { font-family:'Plus Jakarta Sans', sans-serif; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:${MUTED}; margin-bottom:8px; display:block; }
        .faq-item { transition: border-color .2s; }
        .faq-item[data-open="true"] { border-color: rgba(115,49,223,0.35) !important; }
      `}</style>

      {/* ── ambient bg (identical to Index.tsx) ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 15% 25%, rgba(115,49,223,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(115,49,223,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(115,49,223,0.08) 0%, transparent 45%)` }} />

      {/* ── nav ── */}
      <SiteNav navigate={navigate} onGetStarted={() => scrollTo(formRef)} />

      {/* ─── 1. HERO ─── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 60px", textAlign: "center" }}>
        <div className="orb-a" style={{ position: "absolute", top: "12%", left: "6%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(115,49,223,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="orb-b" style={{ position: "absolute", bottom: "15%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(115,49,223,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

        <motion.div {...fadeUp}>
          <SectionPill label="CHESTER · OPENING SOON" />
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2.6rem, 6.2vw, 5rem)", lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 28px", maxWidth: 860, textShadow: "0 0 40px rgba(115,49,223,0.2)" }}
        >
          Turn weekly lessons into<br />
          <span className="hero-grad">daily driving practice.</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: MUTED, maxWidth: 560, lineHeight: 1.75, margin: "0 0 52px" }}
        >
          Cruzi is the learner app your instructor wishes you used. Guided practice routes, mock theory, and a Co-Pilot mode for parents — built around the DVSA syllabus.
        </motion.p>

        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          <button
            data-testid="button-hero-join"
            className="btn-pulse"
            onClick={() => scrollTo(formRef)}
            style={{ background: P, color: "#fff", border: "none", padding: "17px 40px", borderRadius: 9999, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "transform 0.25s", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Join the Practice List <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
          <button
            data-testid="button-hero-why-chester"
            onClick={() => scrollTo(localRef)}
            style={{ background: "rgba(255,255,255,0.7)", color: TEXT, border: `1px solid ${GLASS_B}`, padding: "17px 40px", borderRadius: 9999, fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.25s", backdropFilter: "blur(8px)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(115,49,223,0.10)"; e.currentTarget.style.borderColor = "rgba(115,49,223,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = GLASS_B; }}
          >
            Why we're starting in Chester
          </button>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.4 }} style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED, fontSize: 13 }}>
          <ShieldCheck style={{ width: 15, height: 15, color: P_SEC }} />
          Free to join the list. No card. We'll only email when Chester is live.
        </motion.div>
      </section>

      {/* ─── 2. THE PRACTICE GAP ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionPill label="THE PRACTICE GAP" />
            <h2 style={sectionHeading}>The hours between lessons are where the test is actually won.</h2>
            <p style={{ ...sectionLead, margin: "0 auto" }}>
              The DVSA says most learners need around <strong style={{ color: TEXT }}>45 hours</strong> with an instructor and around <strong style={{ color: TEXT }}>22 hours</strong> of private practice. A weekly lesson alone rarely gets there. Cruzi gives you something to do with the other six days.
            </p>
          </motion.div>

          <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(28px, 4vw, 44px)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.45), transparent)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
              {[
                { stat: "1×", label: "Driving lesson per week", desc: "What most learners book." },
                { stat: "67h", label: "Suggested before test", desc: "DVSA average: 45h tuition + 22h private practice." },
                { stat: "6d", label: "Days a week without practice", desc: "Where confidence and recall quietly leak away." },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2.4rem, 4vw, 3.2rem)", color: P_SEC, lineHeight: 1, marginBottom: 10, letterSpacing: "-0.02em" }}>{item.stat}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 3. WHAT LEARNERS GET ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 60 }}>
            <SectionPill label="WHAT YOU GET" />
            <h2 style={sectionHeading}>Everything you need between lessons.</h2>
            <p style={{ ...sectionLead, margin: "0 auto" }}>One app for routes, theory, progress and feedback — aligned to the same DVSA framework your instructor uses.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { icon: Compass, title: "Guided practice routes", desc: "Curated Chester routes covering roundabouts, dual carriageways and rural lanes — sorted by difficulty." },
              { icon: GraduationCap, title: "Theory & hazard mocks", desc: "Full mock papers and hazard clips. Track which categories need another pass." },
              { icon: Sparkles, title: "DVSA skill tracker", desc: "See exactly which of the 27 DVSA skills you've practised and where you're still wobbly." },
              { icon: Mic, title: "Voice-scribe lesson notes", desc: "Your instructor's spoken feedback turns into clean, searchable notes you can revisit any time." },
              { icon: Clock, title: "Test-day countdown", desc: "Personal plan for the weeks leading up to your test. No more 'where do I start?'" },
              { icon: ShieldCheck, title: "Built on the DVSA syllabus", desc: "No invented metrics. The same framework examiners use, top to bottom." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.05 * i }}
                className="feat-card"
                style={{ ...glassCard, padding: "28px 24px" }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.3), transparent)" }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(115,49,223,0.14)", border: "1px solid rgba(115,49,223,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 16px rgba(115,49,223,0.18)" }}>
                  <item.icon style={{ color: P_SEC, width: 20, height: 20 }} />
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, margin: "0 0 8px", color: TEXT }}>{item.title}</h3>
                <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. FOR PARENTS ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(32px, 5vw, 56px)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.45), transparent)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 40, alignItems: "center" }} className="parents-grid">
              <style>{`@media (max-width: 767px){ .parents-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }`}</style>
              <div>
                <SectionPill label="FOR PARENTS" />
                <h2 style={{ ...sectionHeading, fontSize: "clamp(1.8rem, 3.4vw, 2.4rem)" }}>Help without nagging.</h2>
                <p style={{ ...sectionLead, marginBottom: 24 }}>
                  Co-Pilot mode gives parents structured, step-by-step prompts for private practice. No more arguments about whether they're "doing it right".
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  <CheckItem text="Step-by-step prompts that match your child's lesson stage" />
                  <CheckItem text="Routes graded by difficulty — pick what matches their week" />
                  <CheckItem text="Shared progress with the instructor so practice actually counts" />
                  <CheckItem text="No driving experience needed — Cruzi does the heavy lifting" />
                </ul>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ background: "rgba(115,49,223,0.08)", border: `1px solid ${GLASS_B}`, borderRadius: 20, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(115,49,223,0.18)", border: "1px solid rgba(115,49,223,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles style={{ color: P_SEC, width: 18, height: 18 }} />
                    </div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: TEXT }}>Tonight's Co-Pilot session</div>
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: TEXT, marginBottom: 6 }}>Roundabouts — confidence build</div>
                  <div style={{ color: MUTED, fontSize: 13, marginBottom: 18, lineHeight: 1.65 }}>30 minutes · Hoole loop · 4 roundabouts of increasing complexity</div>
                  {[
                    "Pull away from a stop on a slight incline",
                    "Approach a two-lane roundabout in the correct lane",
                    "Use mirrors before signalling on exit",
                  ].map(line => (
                    <div key={line} style={{ display: "flex", alignItems: "flex-start", gap: 8, color: MUTED, fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                      <CheckCircle style={{ color: P_SEC, width: 14, height: 14, marginTop: 2, flexShrink: 0 }} />
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 5. WHY CHESTER ─── */}
      <section ref={localRef} style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 32 }}>
            <SectionPill label="WHY CHESTER" />
            <h2 style={sectionHeading}>We're building this with Chester instructors first.</h2>
            <p style={{ ...sectionLead, margin: "0 auto" }}>
              Routes, test-centre quirks and roundabout patterns are local. Starting in one city means the content is genuinely useful from day one — not generic UK filler.
            </p>
          </motion.div>

          <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(28px, 4vw, 40px)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.45), transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, color: MUTED, fontSize: 13, fontWeight: 600 }}>
              <MapPin style={{ width: 16, height: 16, color: P_SEC }} />
              Test centres we're mapping first
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {["Chester (Sealand Road)", "Upton", "Hoole", "Saltney", "Blacon", "Boughton", "Ellesmere Port", "Queensferry"].map(c => (
                <span key={c} className="chip">{c}</span>
              ))}
            </div>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              Once Chester is in good shape we'll open the next city. If you want to see Cruzi in your area, the waiting list is the best way to tell us where to go next.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── 6. PRACTICE PASS PREVIEW ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 32 }}>
            <SectionPill label="PRACTICE PASS · COMING SOON" />
            <h2 style={sectionHeading}>An optional one-off £9.99 boost.</h2>
            <p style={{ ...sectionLead, margin: "0 auto" }}>
              Cruzi for learners is free. The Practice Pass is for anyone who wants the polished extras — mock papers, full route library, downloadable lesson notes. One payment, no subscription.
            </p>
          </motion.div>

          <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(32px, 5vw, 48px)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.6), transparent)" }} />
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 52, color: P_SEC, lineHeight: 1, letterSpacing: "-0.02em" }}>£9.99</span>
                <span style={{ color: MUTED, fontSize: 14, marginBottom: 8 }}>one-time</span>
              </div>
              <p style={{ color: MUTED, fontSize: 13, margin: "8px 0 0" }}>Optional · no auto-renew · keep it forever</p>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {[
                "Unlimited mock theory papers",
                "Full Chester route library",
                "Downloadable lesson notes (PDF)",
                "Priority email support",
              ].map(t => <CheckItem key={t} text={t} />)}
            </ul>
            <button
              data-testid="button-pass-soon"
              disabled
              style={{ width: "100%", padding: "14px 0", border: `1px dashed ${GLASS_B}`, borderRadius: 9999, fontSize: 14, fontWeight: 700, cursor: "not-allowed", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.5)", color: MUTED }}
            >
              Available at launch — join the list below to be first
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── 7 & 8. WAITLIST FORM / JOINED STATE ─── */}
      <section ref={formRef} style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {!joined ? (
            <motion.div {...fadeUp}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <SectionPill label="JOIN THE LIST" />
                <h2 style={sectionHeading}>Be first in Chester.</h2>
                <p style={{ ...sectionLead, margin: "0 auto" }}>Takes 20 seconds. We'll email you the moment Cruzi opens to Chester learners.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ ...glassCard, padding: "clamp(28px, 4vw, 40px)" }} noValidate>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-grid">
                  <style>{`@media (max-width: 540px){ .form-grid { grid-template-columns: 1fr !important; } }`}</style>
                  <div>
                    <label className="field-label" htmlFor="first">First name</label>
                    <input
                      id="first"
                      data-testid="input-first-name"
                      className="field"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Alex"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="postcode">Postcode prefix <span style={{ color: MUTED, textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>(optional)</span></label>
                    <input
                      id="postcode"
                      data-testid="input-postcode-prefix"
                      className="field"
                      type="text"
                      placeholder="CH1"
                      maxLength={4}
                      value={postcodePrefix}
                      onChange={e => setPostcodePrefix(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label className="field-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    data-testid="input-email"
                    className="field"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <label className="field-label" htmlFor="referral">How did you hear about us? <span style={{ color: MUTED, textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>(optional)</span></label>
                  <select
                    id="referral"
                    data-testid="select-referral"
                    className="field"
                    value={referral}
                    onChange={e => setReferral(e.target.value)}
                    style={{ appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%236D28D9' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center", paddingRight: 40 }}
                  >
                    <option value="">Select an option…</option>
                    <option value="instructor">My driving instructor</option>
                    <option value="parent">A parent</option>
                    <option value="friend">A friend</option>
                    <option value="search">Google / search</option>
                    <option value="social">Social media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  data-testid="button-submit-waitlist"
                  disabled={!canSubmit}
                  className={canSubmit ? "btn-pulse" : ""}
                  style={{
                    width: "100%", marginTop: 24,
                    background: canSubmit ? P : "rgba(115,49,223,0.35)",
                    color: "#fff", border: "none",
                    padding: "16px 0", borderRadius: 9999,
                    fontSize: 16, fontWeight: 700,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    transition: "transform 0.2s",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                  onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Join the Practice List <ArrowRight style={{ width: 18, height: 18 }} />
                </button>

                <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.6, margin: "16px 0 0", textAlign: "center" }}>
                  We'll only email about the Chester launch. Unsubscribe any time. See our <a href="/privacy" style={{ color: P_SEC, textDecoration: "none", fontWeight: 600 }}>privacy policy</a>.
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div {...fadeUp} data-testid="status-joined">
              <div style={{ ...glassCard, padding: "clamp(32px, 5vw, 48px)", textAlign: "center" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.6), transparent)" }} />
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(115,49,223,0.2)", border: "1px solid rgba(115,49,223,0.35)", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 24px rgba(115,49,223,0.3)" }}>
                  <BadgeCheck style={{ color: P_SEC, width: 26, height: 26 }} />
                </div>
                <h2 style={{ ...sectionHeading, fontSize: "clamp(1.8rem, 3.4vw, 2.4rem)" }}>You're on the list, {firstName.split(" ")[0]}.</h2>
                <p style={{ ...sectionLead, margin: "0 auto 28px" }}>
                  We'll email <strong style={{ color: TEXT }}>{email}</strong> the moment Cruzi opens in Chester. No spam, no sign-up wall in the meantime.
                </p>

                <div style={{ borderTop: `1px solid ${GLASS_B}`, marginTop: 8, paddingTop: 28, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 220, flex: 1 }}>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: TEXT, marginBottom: 6 }}>Want the Practice Pass at launch?</div>
                      <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }}>Optional £9.99 one-off — mock papers, full Chester route library, downloadable notes.</div>
                    </div>
                    <button
                      data-testid="button-interest-pass"
                      onClick={() => setInterestedInPass(v => !v)}
                      style={{
                        padding: "12px 22px", borderRadius: 9999, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer",
                        transition: "all 0.2s",
                        background: interestedInPass ? P : "rgba(255,255,255,0.7)",
                        color: interestedInPass ? "#fff" : TEXT,
                        border: interestedInPass ? "none" : `1px solid ${GLASS_B}`,
                        boxShadow: interestedInPass ? `0 0 18px ${GLOW}` : "none",
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {interestedInPass ? <><CheckCircle style={{ width: 14, height: 14 }} /> Noted</> : "Yes, tell me first"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── 9. FAQ ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionPill label="QUESTIONS" />
            <h2 style={sectionHeading}>Things people usually ask.</h2>
          </motion.div>

          <FAQList items={[
            { q: "Is Cruzi for learners free?", a: "Yes. The core learner app is free. The optional Practice Pass is a one-time £9.99 — never a subscription." },
            { q: "Do I need to be in Chester?", a: "For launch, yes — routes and content are mapped locally. Joining the list from anywhere helps us decide which city opens next." },
            { q: "Does my instructor need to use Cruzi too?", a: "Not required. You'll still get full route practice, theory and progress tracking. If they do use Cruzi, lesson notes sync automatically." },
            { q: "Can my parent use it for private practice?", a: "Yes. Co-Pilot mode gives parents step-by-step prompts so they can supervise practice without any driving-instructor knowledge." },
            { q: "What happens to my email?", a: "Stored securely and used only to tell you when Chester is live. No other marketing, no third-party sharing — see our privacy policy." },
          ]} />
        </div>
      </section>

      {/* ─── 10. FINAL CTA ─── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 120px", textAlign: "center" }}>
        <motion.div {...fadeUp} style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", margin: "0 0 20px", textShadow: "0 0 40px rgba(115,49,223,0.25)" }}>
            Practice every day.<br />
            <span style={{ color: P_SEC }}>Pass sooner.</span>
          </h2>
          <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, margin: "0 0 40px" }}>
            Join the Chester practice list and we'll let you know the moment Cruzi opens to learners.
          </p>
          <button
            data-testid="button-final-join"
            className="btn-pulse"
            onClick={() => scrollTo(formRef)}
            style={{ background: P, color: "#fff", border: "none", padding: "18px 52px", borderRadius: 9999, fontSize: 17, fontWeight: 700, cursor: "pointer", transition: "transform 0.25s", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 10 }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Join the Practice List <ArrowRight style={{ width: 20, height: 20 }} />
          </button>
        </motion.div>
      </section>

      {/* ─── footer (same minimal pattern as Index.tsx) ─── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(115,49,223,0.08)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: TEXT }}>Cruzi</span>
            <p style={{ color: MUTED, fontSize: 13, margin: "4px 0 0" }}>Smarter practice for UK learner drivers.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {[
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Cookies", href: "/cookies" },
            ].map(link => (
              <a key={link.label} href={link.href} style={{ color: MUTED, fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = TEXT)} onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "24px auto 0", paddingTop: 24, borderTop: "1px solid rgba(115,49,223,0.06)", textAlign: "center" }}>
          <p style={{ color: MUTED, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Cruzi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────
   FAQ list (kept local — single-purpose, glass styling)
   ─────────────────────────────────────────────────────────────── */
const FAQList: React.FC<{ items: { q: string; a: string }[] }> = ({ items }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <motion.div
            key={item.q}
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.04 * i }}
            className="faq-item"
            data-open={isOpen}
            style={{ ...glassCard, padding: 0 }}
          >
            <button
              data-testid={`button-faq-${i}`}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{ width: "100%", textAlign: "left", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, color: TEXT }}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              {isOpen
                ? <ChevronUp style={{ width: 18, height: 18, color: P_SEC, flexShrink: 0 }} />
                : <ChevronDown style={{ width: 18, height: 18, color: MUTED, flexShrink: 0 }} />}
            </button>
            {isOpen && (
              <div style={{ padding: "0 24px 22px", color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
                {item.a}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChesterLearnerPage;
