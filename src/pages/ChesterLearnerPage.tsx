import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle, MapPin, Shield, Clock, Users,
  ChevronDown, ChevronUp, BadgeCheck,
} from "lucide-react";
import SiteNav from "@/components/landing/SiteNav";
import { usePageMeta } from "@/hooks/usePageMeta";

/* ─────────────────────────────────────────────────────────────
   Production design tokens — identical to src/pages/Index.tsx.
   No new colour values. No new fonts. No shadcn Button/Card/Input.
   ───────────────────────────────────────────────────────────── */
const BG      = "#F8F9FF";
const GLASS   = "rgba(255, 255, 255, 0.85)";
const GLASS_B = "rgba(115, 49, 223, 0.18)";
const P       = "#5300B7";
const P_SEC   = "#6D28D9";
const TEXT    = "#0D1C2F";
const MUTED   = "#4A4455";
const GLOW    = "rgba(115, 49, 223, 0.28)";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" as const },
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
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(115,49,223,0.15)", border: "1px solid rgba(115,49,223,0.4)", borderRadius: 9999, padding: "6px 16px", marginBottom: 18 }}>
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
  fontSize: "clamp(1.75rem, 3.4vw, 2.5rem)",
  letterSpacing: "-0.02em",
  margin: "0 0 14px",
  color: TEXT,
};
const sectionLead: React.CSSProperties = {
  color: MUTED,
  fontSize: 16,
  lineHeight: 1.7,
  margin: 0,
  maxWidth: 620,
};

const AREAS = [
  "Chester (city centre)", "Hoole", "Upton", "Blacon", "Saltney", "Boughton",
  "Vicars Cross", "Christleton", "Ellesmere Port", "Queensferry",
  "Wrexham", "Flintshire", "Other nearby area",
];

const FUNNEL_KEY = "cruzi.chester.funnel.v1";

/* ─────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────── */
const ChesterLearnerPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  usePageMeta({
    title: "Driving Instructors in Chester, Wrexham & Flintshire | Cruzi",
    description: "Find a fully qualified local driving instructor around Chester. Join the waiting list and start practising with family while you wait.",
    canonical: "https://cruzi.co.uk/chester",
  });

  // ── funnel state (local only — no backend in PR2) ────────────
  const [stage, setStage] = useState<"landing" | "submitted">("landing");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = firstName.trim().length >= 2 && validEmail && area.length > 0 && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // Persist locally so the /chester/start placeholder can confirm the spot.
    try {
      sessionStorage.setItem(FUNNEL_KEY, JSON.stringify({
        firstName, email, phone, area,
        interestedInFamilyPractice: false,
        joinedAt: new Date().toISOString(),
      }));
    } catch { /* ignore quota errors */ }
    setTimeout(() => {
      setSubmitting(false);
      setStage("submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 350);
  };

  const handleStartFamilyPractice = () => {
    try {
      const raw = sessionStorage.getItem(FUNNEL_KEY);
      const obj = raw ? JSON.parse(raw) : { firstName, email, phone, area };
      obj.interestedInFamilyPractice = true;
      sessionStorage.setItem(FUNNEL_KEY, JSON.stringify(obj));
    } catch { /* ignore */ }
    navigate("/chester/start");
  };

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        html { overflow-x: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes heroGlow { 0%,100% { opacity:0.55; transform:scale(1) } 50% { opacity:0.85; transform:scale(1.05) } }
        @keyframes btnPulse { 0%,100% { box-shadow:0 0 16px rgba(115,49,223,0.5),0 0 32px rgba(115,49,223,0.2) } 50% { box-shadow:0 0 24px rgba(115,49,223,0.7),0 0 48px rgba(115,49,223,0.3) } }
        .btn-pulse { animation: btnPulse 3.2s ease-in-out infinite; }
        .orb-quiet { animation: heroGlow 11s ease-in-out infinite; }
        .field { width:100%; padding:13px 14px; border-radius:12px; border:1px solid ${GLASS_B}; background:#ffffff; color:${TEXT}; font-size:15px; font-family:'Inter', sans-serif; outline:none; transition: border-color .2s, box-shadow .2s; }
        .field::placeholder { color: #8a8694; }
        .field:focus { border-color: rgba(115,49,223,0.55); box-shadow: 0 0 0 4px rgba(115,49,223,0.10); }
        .field-label { font-family:'Plus Jakarta Sans', sans-serif; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${MUTED}; margin-bottom:6px; display:block; }
        .hero-grid { display:grid; grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr); gap: 44px; align-items: center; }
        .stepline { display:flex; align-items:flex-start; gap:14px; padding:18px 0; border-bottom:1px solid rgba(115,49,223,0.10); }
        .stepline:last-child { border-bottom:none; }
        .stepnum { width:32px; height:32px; border-radius:9999px; background:rgba(115,49,223,0.12); border:1px solid rgba(115,49,223,0.32); color:${P_SEC}; font-family:'Plus Jakarta Sans', sans-serif; font-weight:800; font-size:14px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
        .faq-item { transition: border-color .2s; }
        .faq-item[data-open="true"] { border-color: rgba(115,49,223,0.35) !important; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-text { text-align: left; }
        }
      `}</style>

      {/* Ambient bg — identical to Index.tsx */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 15% 25%, rgba(115,49,223,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(115,49,223,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(115,49,223,0.08) 0%, transparent 45%)` }} />

      <SiteNav navigate={navigate} onGetStarted={() => {
        const el = document.getElementById("lead-form");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }} />

      {stage === "landing" ? (
        <LandingView
          firstName={firstName} setFirstName={setFirstName}
          email={email} setEmail={setEmail}
          phone={phone} setPhone={setPhone}
          area={area} setArea={setArea}
          canSubmit={canSubmit} submitting={submitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <SubmittedView
          firstName={firstName} email={email} area={area}
          onStartFamilyPractice={handleStartFamilyPractice}
          onJustWait={() => {
            // Acknowledge "no thanks" — collapse the family-practice block; stay on confirmation only.
            const el = document.getElementById("confirmation-card");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      )}

      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(115,49,223,0.08)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: TEXT }}>Cruzi</span>
            <p style={{ color: MUTED, fontSize: 13, margin: "4px 0 0" }}>Connecting UK learners with verified local driving instructors.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {[
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Cookies", href: "/cookies" },
            ].map(link => (
              <a key={link.label} href={link.href} style={{ color: MUTED, fontSize: 13, textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = TEXT)} onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
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

/* ─────────────────────────────────────────────────────────────
   STAGE 1 — Local lead-generation landing
   ───────────────────────────────────────────────────────────── */
interface LandingViewProps {
  firstName: string; setFirstName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  area: string; setArea: (v: string) => void;
  canSubmit: boolean; submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}
const LandingView: React.FC<LandingViewProps> = ({
  firstName, setFirstName, email, setEmail, phone, setPhone,
  area, setArea, canSubmit, submitting, onSubmit,
}) => (
  <>
    {/* ─── HERO (compact, 2-col, form-in-hero) ─── */}
    <section style={{ position: "relative", zIndex: 1, padding: "104px 24px 56px" }}>
      {/* One quiet orb — no decorative orbs sprayed across the page */}
      <div className="orb-quiet" style={{ position: "absolute", top: 80, right: -120, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(115,49,223,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="hero-grid">

          {/* LEFT — copy */}
          <motion.div {...fadeUp} className="hero-text">
            <SectionPill label="DRIVING LESSONS · CHESTER REGION" />
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4.4vw, 3.4rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              margin: "0 0 18px",
              color: TEXT,
            }}>
              Looking for a driving instructor around <span style={{ color: P_SEC }}>Chester?</span>
            </h1>
            <p style={{ fontSize: "clamp(1rem, 1.4vw, 1.1rem)", color: MUTED, lineHeight: 1.65, margin: "0 0 24px", maxWidth: 520 }}>
              We're building a network of fully qualified local instructors across Chester, Wrexham, Flintshire and nearby areas. Join the waiting list and we'll match you with a verified ADI in your area.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, color: MUTED, fontSize: 13 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><BadgeCheck style={{ width: 14, height: 14, color: P_SEC }} /> DVSA-approved instructors</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Shield style={{ width: 14, height: 14, color: P_SEC }} /> Free to enquire</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><MapPin style={{ width: 14, height: 14, color: P_SEC }} /> Chester & surrounding areas</span>
            </div>
          </motion.div>

          {/* RIGHT — lead form */}
          <motion.form
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.1 }}
            id="lead-form"
            onSubmit={onSubmit}
            style={{ ...glassCard, padding: 26 }}
            noValidate
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />

            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: TEXT, margin: "0 0 4px" }}>Find a local instructor</h2>
            <p style={{ color: MUTED, fontSize: 13, margin: "0 0 18px" }}>Takes 20 seconds. No card needed.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              <div>
                <label className="field-label" htmlFor="first">First name</label>
                <input
                  id="first" data-testid="input-first-name" className="field"
                  type="text" autoComplete="given-name" placeholder="Alex"
                  value={firstName} onChange={e => setFirstName(e.target.value)} required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="email">Email</label>
                <input
                  id="email" data-testid="input-email" className="field"
                  type="email" autoComplete="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="phone">Phone <span style={{ color: MUTED, textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>(optional)</span></label>
                <input
                  id="phone" data-testid="input-phone" className="field"
                  type="tel" autoComplete="tel" placeholder="07…"
                  value={phone} onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="area">Area</label>
                <select
                  id="area" data-testid="select-area" className="field"
                  value={area} onChange={e => setArea(e.target.value)} required
                  style={{ appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%236D28D9' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}
                >
                  <option value="">Select your area…</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              data-testid="button-find-instructors"
              disabled={!canSubmit}
              className={canSubmit ? "btn-pulse" : ""}
              style={{
                width: "100%", marginTop: 18,
                background: canSubmit ? P : "rgba(115,49,223,0.35)",
                color: "#fff", border: "none",
                padding: "15px 0", borderRadius: 9999,
                fontSize: 15, fontWeight: 700,
                cursor: canSubmit ? "pointer" : "not-allowed",
                transition: "transform 0.2s",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {submitting ? "Adding you to the list…" : <>Find Local Instructors <ArrowRight style={{ width: 16, height: 16 }} /></>}
            </button>

            <p style={{ color: MUTED, fontSize: 11.5, lineHeight: 1.5, margin: "12px 0 0", textAlign: "center" }}>
              We'll only use your details to match you with a local instructor. See our <a href="/privacy" style={{ color: P_SEC, textDecoration: "none", fontWeight: 600 }}>privacy policy</a>.
            </p>
          </motion.form>
        </div>
      </div>
    </section>

    {/* ─── TRUST STRIP ─── */}
    <section style={{ position: "relative", zIndex: 1, padding: "0 24px 56px" }}>
      <motion.div {...fadeUp} style={{ maxWidth: 1000, margin: "0 auto", ...glassCard, padding: "18px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 28 }}>
        {[
          "DVSA-approved instructors only",
          "Fully qualified ADIs",
          "Manual & automatic",
          "Pass-Plus available",
          "Local to your area",
        ].map(item => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: MUTED }}>
            <CheckCircle style={{ color: P_SEC, width: 15, height: 15, flexShrink: 0 }} />
            {item}
          </div>
        ))}
      </motion.div>
    </section>

    {/* ─── COVERAGE ─── */}
    <section style={{ position: "relative", zIndex: 1, padding: "0 24px 72px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <motion.div {...fadeUp} style={{ marginBottom: 22 }}>
          <SectionPill label="AREAS WE COVER" />
          <h2 style={sectionHeading}>Chester and the surrounding region.</h2>
          <p style={sectionLead}>Our instructors travel across the wider Chester catchment so you don't have to. If you're in or near any of these places, you're covered.</p>
        </motion.div>

        <motion.div {...fadeUp} style={{ ...glassCard, padding: 28 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.4), transparent)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, color: MUTED, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <MapPin style={{ width: 14, height: 14, color: P_SEC }} /> Towns & areas
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {AREAS.filter(a => a !== "Other nearby area").map(c => (
              <span key={c} style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 9999, background: "rgba(115,49,223,0.08)", border: "1px solid rgba(115,49,223,0.2)", color: P_SEC, fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c}</span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, color: MUTED, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <BadgeCheck style={{ width: 14, height: 14, color: P_SEC }} /> Local test centres
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Chester (Sealand Road)", "Upton", "Wrexham", "Wallasey", "Speke"].map(c => (
              <span key={c} style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 9999, background: "#ffffff", border: `1px solid ${GLASS_B}`, color: TEXT, fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* ─── HOW IT WORKS (3 lines, not 6 cards) ─── */}
    <section style={{ position: "relative", zIndex: 1, padding: "0 24px 72px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <motion.div {...fadeUp} style={{ marginBottom: 22 }}>
          <SectionPill label="HOW IT WORKS" />
          <h2 style={sectionHeading}>Three steps, no friction.</h2>
        </motion.div>

        <motion.div {...fadeUp} style={{ ...glassCard, padding: "8px 28px" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.4), transparent)" }} />
          {[
            { n: "1", t: "Tell us where you live", d: "Share your name, email and area. Takes 20 seconds." },
            { n: "2", t: "We match you with a local ADI", d: "A fully qualified instructor in your area gets in touch when a space opens." },
            { n: "3", t: "Get on the road", d: "Book lessons directly with your instructor. Track your progress in the free Cruzi app." },
          ].map(s => (
            <div key={s.n} className="stepline">
              <div className="stepnum">{s.n}</div>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: TEXT, marginBottom: 4 }}>{s.t}</div>
                <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ─── FAQ ─── */}
    <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <motion.div {...fadeUp} style={{ marginBottom: 22 }}>
          <SectionPill label="QUESTIONS" />
          <h2 style={sectionHeading}>Things people usually ask.</h2>
        </motion.div>
        <FAQList items={[
          { q: "Are your instructors fully qualified?", a: "Yes — every instructor on the Cruzi network is a DVSA-approved ADI. We verify qualifications before adding anyone to the roster." },
          { q: "How long is the waiting list?", a: "It depends on your area. Most learners in the Chester region currently wait 2–4 weeks. We'll email you the moment a verified local ADI has space." },
          { q: "How much do lessons cost?", a: "Lesson rates are set by your instructor and reflect local market rates. There are no booking fees from Cruzi." },
          { q: "Manual or automatic?", a: "Both. Tell your matched instructor what you'd like to learn in when they get in touch." },
          { q: "What if I don't live in Chester?", a: "Our instructors travel across Wrexham, Flintshire and the surrounding areas. Pick the nearest option in the form — if we can't cover you yet, we'll tell you and put you on a future-area list." },
        ]} />
      </div>
    </section>
  </>
);

/* ─────────────────────────────────────────────────────────────
   STAGE 2 + 3 — Booked-out confirmation + Family Practice offer
   ───────────────────────────────────────────────────────────── */
interface SubmittedViewProps {
  firstName: string; email: string; area: string;
  onStartFamilyPractice: () => void;
  onJustWait: () => void;
}
const SubmittedView: React.FC<SubmittedViewProps> = ({ firstName, email, area, onStartFamilyPractice, onJustWait }) => (
  <>
    {/* ─── STAGE 2 — Booked-out + confirmation ─── */}
    <section style={{ position: "relative", zIndex: 1, padding: "120px 24px 56px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <motion.div id="confirmation-card" {...fadeUp} data-testid="status-confirmation" style={{ ...glassCard, padding: "clamp(28px, 4vw, 40px)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 9999, background: "rgba(115,49,223,0.12)", border: "1px solid rgba(115,49,223,0.32)", color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 18 }}>
            <Clock style={{ width: 11, height: 11 }} /> CURRENT AVAILABILITY · CHESTER REGION
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.1rem)", letterSpacing: "-0.02em", margin: "0 0 14px", color: TEXT, lineHeight: 1.15 }}>
            Right now, all local instructors are fully booked.
          </h1>
          <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, margin: "0 0 22px" }}>
            Thanks, {firstName.split(" ")[0]}. You're on the waiting list for the <strong style={{ color: TEXT }}>{area}</strong> area. We'll email <strong style={{ color: TEXT }}>{email}</strong> the moment a verified local ADI has a space.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, padding: "16px 0 4px", borderTop: `1px solid ${GLASS_B}` }}>
            <div style={{ paddingTop: 14 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: TEXT, lineHeight: 1.1 }}>2–4 weeks</div>
              <div style={{ color: MUTED, fontSize: 12.5, marginTop: 4 }}>Typical wait in your area</div>
            </div>
            <div style={{ paddingTop: 14 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: TEXT, lineHeight: 1.1 }}>Verified ADIs only</div>
              <div style={{ color: MUTED, fontSize: 12.5, marginTop: 4 }}>DVSA-approved, qualifications checked</div>
            </div>
            <div style={{ paddingTop: 14 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: TEXT, lineHeight: 1.1 }}>No payment yet</div>
              <div style={{ color: MUTED, fontSize: 12.5, marginTop: 4 }}>You only pay your instructor once lessons start</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ─── STAGE 3 — Family Practice (no "Practice Mode" wording) ─── */}
    <section style={{ position: "relative", zIndex: 1, padding: "8px 24px 64px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <motion.div {...fadeUp} style={{ marginBottom: 18, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: MUTED, fontSize: 12.5, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>
            <span style={{ width: 24, height: 1, background: "rgba(115,49,223,0.4)" }} /> WHILE YOU WAIT
          </div>
          <h2 style={{ ...sectionHeading, margin: "14px 0 10px" }}>Start practising with family.</h2>
          <p style={sectionLead}>
            Don't lose momentum. Cruzi gives families guided private driving sessions you can do with a parent or supervisor — built on the same DVSA syllabus your instructor will use.
          </p>
        </motion.div>

        <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(24px, 4vw, 36px)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            <CheckItem text="Guided private driving sessions — step-by-step prompts your supervisor follows" />
            <CheckItem text="Parent / family supervision support — no driving-instructor knowledge needed" />
            <CheckItem text="Lesson tracking against the DVSA syllabus" />
            <CheckItem text="Local mock routes around Chester, Wrexham and Flintshire" />
            <CheckItem text="Theory & hazard perception prep" />
          </ul>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, padding: "20px 0 0", borderTop: `1px solid ${GLASS_B}` }}>
            <div>
              <div style={{ color: MUTED, fontSize: 12.5, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Family Practice Access</div>
              <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 36, color: P_SEC, lineHeight: 1, letterSpacing: "-0.02em" }}>£9.99</span>
                <span style={{ color: MUTED, fontSize: 13, marginBottom: 6 }}>one-off · no subscription</span>
              </div>
            </div>
            <button
              data-testid="button-start-family-practice"
              className="btn-pulse"
              onClick={onStartFamilyPractice}
              style={{ background: P, color: "#fff", border: "none", padding: "14px 28px", borderRadius: 9999, fontSize: 14.5, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Start Family Practice <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </motion.div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            data-testid="button-just-wait"
            onClick={onJustWait}
            style={{ background: "none", border: "none", color: MUTED, fontSize: 13, fontWeight: 500, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
            onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
          >
            No thanks — just email me when an instructor opens up
          </button>
        </div>
      </div>
    </section>
  </>
);

/* ─────────────────────────────────────────────────────────────
   FAQ (local glass list)
   ───────────────────────────────────────────────────────────── */
const FAQList: React.FC<{ items: { q: string; a: string }[] }> = ({ items }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <motion.div
            key={item.q}
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.04 * i }}
            className="faq-item"
            data-open={isOpen}
            style={{ ...glassCard, padding: 0 }}
          >
            <button
              data-testid={`button-faq-${i}`}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{ width: "100%", textAlign: "left", padding: "18px 22px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: TEXT }}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              {isOpen
                ? <ChevronUp style={{ width: 18, height: 18, color: P_SEC, flexShrink: 0 }} />
                : <ChevronDown style={{ width: 18, height: 18, color: MUTED, flexShrink: 0 }} />}
            </button>
            {isOpen && (
              <div style={{ padding: "0 22px 18px", color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
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
