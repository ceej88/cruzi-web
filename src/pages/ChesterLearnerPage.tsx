import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CheckCircle, Clock, CreditCard, Lock, Shield, Users } from "lucide-react";
import SiteNav from "@/components/landing/SiteNav";
import PhoneMockup from "@/components/landing/PhoneMockup";
import { usePageMeta } from "@/hooks/usePageMeta";

// Reuse the EXACT homepage phone-mockup assets — no new images, no recreated UI.
import parentPhone from "@/assets/parent-phone.webp";
import studentView from "@/assets/student-view-clean.webp";
import testRoutesPhone from "@/assets/test-routes-phone.webp";

// Stage 2 collage — real learner photos supplied for the Chester region.
import chesterPass1 from "@/assets/chester-pass-1.jpg";
import chesterPass2 from "@/assets/chester-pass-2.jpg";
import chesterPass3 from "@/assets/chester-pass-3.jpg";

const BG      = "#F8F9FF";
const GLASS   = "rgba(255, 255, 255, 0.85)";
const GLASS_B = "rgba(115, 49, 223, 0.18)";
const P       = "#5300B7";
const P_SEC   = "#6D28D9";
const TEXT    = "#0D1C2F";
const MUTED   = "#4A4455";

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

const AREAS = [
  "Chester (city centre)", "Hoole", "Upton", "Blacon", "Saltney", "Boughton",
  "Vicars Cross", "Christleton", "Ellesmere Port", "Queensferry",
  "Wrexham", "Flintshire", "Other nearby area",
];

const FUNNEL_KEY = "cruzi.chester.funnel.v1";

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
        @keyframes heroGlow { 0%,100% { opacity:0.6; transform:scale(1) } 50% { opacity:1; transform:scale(1.08) } }
        @keyframes btnPulse { 0%,100% { box-shadow:0 0 16px rgba(115,49,223,0.5),0 0 32px rgba(115,49,223,0.2) } 50% { box-shadow:0 0 24px rgba(115,49,223,0.7),0 0 48px rgba(115,49,223,0.3) } }
        .btn-pulse { animation: btnPulse 3.2s ease-in-out infinite; }
        .orb-a { animation: heroGlow 9s ease-in-out infinite; }
        .orb-b { animation: heroGlow 11s ease-in-out infinite; animation-delay: -2s; }
        .field { width:100%; padding:13px 14px; border-radius:12px; border:1px solid ${GLASS_B}; background:#ffffff; color:${TEXT}; font-size:15px; font-family:'Inter', sans-serif; outline:none; transition: border-color .2s, box-shadow .2s; }
        .field::placeholder { color: #8a8694; }
        .field:focus { border-color: rgba(115,49,223,0.55); box-shadow: 0 0 0 4px rgba(115,49,223,0.10); }
        .field-label { font-family:'Plus Jakarta Sans', sans-serif; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${MUTED}; margin-bottom:6px; display:block; }
        .wyw-grid { grid-template-columns: 1fr; gap: 28px; }
        @media (min-width: 820px) { .wyw-grid { grid-template-columns: 1.05fr 1fr; gap: 40px; } }
        .cta-row { display:flex; flex-direction:column; gap:18px; align-items:stretch; }
        @media (min-width: 560px) { .cta-row { flex-direction:row; align-items:center; justify-content:space-between; } }
      `}</style>

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
            const el = document.getElementById("confirmation-card");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      )}

      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(115,49,223,0.08)", padding: "40px 24px", marginTop: 40 }}>
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
    <section style={{ position: "relative", zIndex: 1, padding: "120px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
      <div className="orb-a" style={{ position: "absolute", top: "12%", left: "6%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(115,49,223,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div className="orb-b" style={{ position: "absolute", bottom: "15%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(115,49,223,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

      <motion.div {...fadeUp} style={{ position: "relative", zIndex: 1 }}>
        <SectionPill label="DRIVING LESSONS · CHESTER REGION" />
      </motion.div>

      <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.05 }} style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(2.4rem, 5.2vw, 4rem)",
        lineHeight: 1.05,
        letterSpacing: "-0.025em",
        margin: "0 0 18px",
        color: TEXT,
        maxWidth: 860,
        position: "relative",
        zIndex: 1,
      }}>
        Find driving instructors<br />around <span style={{ color: P_SEC }}>Chester.</span>
      </motion.h1>

      <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} style={{
        fontSize: "clamp(1.05rem, 1.5vw, 1.2rem)",
        color: MUTED,
        lineHeight: 1.55,
        margin: "0 auto 26px",
        maxWidth: 560,
        position: "relative",
        zIndex: 1,
      }}>
        Across Chester, Wrexham, Flintshire and nearby areas.
      </motion.p>

      <motion.form
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.15 }}
        id="lead-form"
        onSubmit={onSubmit}
        style={{ ...glassCard, padding: 24, width: "100%", maxWidth: 520, textAlign: "left", position: "relative", zIndex: 1 }}
        noValidate
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="field-label" htmlFor="first">First name</label>
            <input id="first" data-testid="input-first-name" className="field" type="text" autoComplete="given-name" placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" data-testid="input-email" className="field" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="field-label" htmlFor="phone">Phone <span style={{ color: MUTED, textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>(optional)</span></label>
            <input id="phone" data-testid="input-phone" className="field" type="tel" autoComplete="tel" placeholder="07…" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="area">Area</label>
            <select id="area" data-testid="select-area" className="field" value={area} onChange={e => setArea(e.target.value)} required style={{ appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%236D28D9' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}>
              <option value="">Select your area…</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" data-testid="button-find-instructors" disabled={!canSubmit} className={canSubmit ? "btn-pulse" : ""} style={{
          width: "100%", marginTop: 18,
          background: canSubmit ? P : "rgba(115,49,223,0.35)",
          color: "#fff", border: "none",
          padding: "17px 0", borderRadius: 9999,
          fontSize: 16, fontWeight: 700,
          cursor: canSubmit ? "pointer" : "not-allowed",
          transition: "transform 0.2s",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        }} onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
          {submitting ? "Adding you to the list…" : <>Find Local Instructors <ArrowRight style={{ width: 16, height: 16 }} /></>}
        </button>
      </motion.form>

      <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.22 }} style={{ display: "flex", flexWrap: "wrap", gap: 18, color: MUTED, fontSize: 13, marginTop: 18, justifyContent: "center", position: "relative", zIndex: 1 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><BadgeCheck style={{ width: 14, height: 14, color: P_SEC }} /> DVSA-approved</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Shield style={{ width: 14, height: 14, color: P_SEC }} /> Free to enquire</span>
      </motion.div>
    </section>

    <section style={{ position: "relative", zIndex: 1, padding: "40px 24px 100px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 56, alignItems: "start" }}>
          {[
            { eyebrow: "FAMILY PRACTICE", title: "Co-Pilot for parents", caption: "Practise with family between lessons.", src: parentPhone, testId: "mockup-family-practice" },
            { eyebrow: "PROGRESS TRACKING", title: "Pupil Progress",      caption: "Track lessons, skills and test readiness.", src: studentView,   testId: "mockup-progress" },
            { eyebrow: "TEST ROUTES",      title: "Local Test Routes",   caption: "Practise local test routes with guided tracking.", src: testRoutesPhone, testId: "mockup-test-routes" },
          ].map((m, i) => (
            <motion.div key={m.eyebrow} {...fadeUp} transition={{ duration: 0.6, delay: 0.05 * i }} data-testid={m.testId} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 8 }}>{m.eyebrow}</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)", color: TEXT, margin: 0, letterSpacing: "-0.015em" }}>{m.title}</h3>
              </div>
              <PhoneMockup src={m.src} title={m.title} caption={m.caption} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

interface SubmittedViewProps {
  firstName: string; email: string; area: string;
  onStartFamilyPractice: () => void;
  onJustWait: () => void;
}
const SubmittedView: React.FC<SubmittedViewProps> = ({ firstName, email, area, onStartFamilyPractice, onJustWait }) => {
  const firstNameOnly = (firstName || "").split(" ")[0] || "there";
  const collageTile: React.CSSProperties = {
    borderRadius: 18,
    overflow: "hidden",
    border: `1px solid ${GLASS_B}`,
    background: "#fff",
    boxShadow: "0 12px 36px -18px rgba(115,49,223,0.35)",
  };
  const collageImg: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

  return (
    <>
      <section style={{ position: "relative", zIndex: 1, padding: "120px 24px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <motion.div id="confirmation-card" {...fadeUp} data-testid="status-confirmation" style={{ ...glassCard, padding: "clamp(28px, 4vw, 36px)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 9999, background: "rgba(115,49,223,0.12)", border: "1px solid rgba(115,49,223,0.32)", color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 18 }}>
              <Clock style={{ width: 11, height: 11 }} /> CURRENT AVAILABILITY · CHESTER REGION
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.65rem, 3.2vw, 2.15rem)", letterSpacing: "-0.02em", margin: "0 0 14px", color: TEXT, lineHeight: 1.12 }}>
              Right now, all local instructors are fully booked.
            </h1>
            <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.65, margin: "0 0 22px" }}>
              Thanks, {firstNameOnly}. You're on the waiting list for the <strong style={{ color: P_SEC }} data-testid="text-area">{area}</strong> area. We'll email <strong style={{ color: TEXT }} data-testid="text-email">{email}</strong> as soon as a verified local ADI has a space.
            </p>
            <div style={{ borderTop: `1px solid ${GLASS_B}`, paddingTop: 18, display: "flex", flexDirection: "column", gap: 16 }}>
              {([
                { Icon: Clock,      title: "2–4 weeks",          sub: "Typical wait in your area" },
                { Icon: Shield,     title: "Verified ADIs only", sub: "All instructors are DVSA-approved" },
                { Icon: CreditCard, title: "No payment today",   sub: "You'll pay your instructor once lessons start" },
              ] as const).map(({ Icon, title, sub }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: "rgba(115,49,223,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 20, height: 20, color: P_SEC }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15.5, color: TEXT, lineHeight: 1.25 }}>{title}</div>
                    <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "12px 24px 20px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <motion.div {...fadeUp} data-testid="card-while-you-wait" style={{ ...glassCard, padding: "clamp(24px, 4vw, 36px)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />
            <div className="wyw-grid" style={{ display: "grid", alignItems: "start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11.5, letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
                  <span style={{ width: 24, height: 1, background: "rgba(115,49,223,0.55)" }} /> WHILE YOU WAIT
                </div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 3.4vw, 2.15rem)", letterSpacing: "-0.02em", margin: "0 0 12px", color: TEXT, lineHeight: 1.1 }}>
                  Start practising<br />between lessons.
                </h2>
                <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.65, margin: "0 0 22px", maxWidth: 460 }}>
                  Learners who practise regularly between lessons often progress faster and feel more confident before their test.
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    "Guided practice sessions you can do with a parent or supervisor",
                    "Build confidence on real local roads",
                    "Track your progress as you improve",
                    "Practise around Chester, Wrexham and nearby areas",
                    "Theory and hazard perception support included",
                  ].map(t => (
                    <li key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: TEXT, fontSize: 14.5, lineHeight: 1.55 }}>
                      <CheckCircle style={{ color: P_SEC, width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div data-testid="collage-while-you-wait" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ gridColumn: "1 / -1", aspectRatio: "4 / 3", ...collageTile }}>
                  <img src={chesterPass1} alt="Cruzi learner after passing their driving test in Chester" loading="lazy" style={collageImg} />
                </div>
                <div style={{ aspectRatio: "1 / 1", ...collageTile }}>
                  <img src={chesterPass2} alt="Cruzi learner holding their pass certificate" loading="lazy" style={collageImg} />
                </div>
                <div style={{ aspectRatio: "1 / 1", ...collageTile }}>
                  <img src={chesterPass3} alt="Cruzi learner with their lesson car" loading="lazy" style={collageImg} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "8px 24px 40px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <motion.div {...fadeUp} data-testid="card-family-practice-cta" style={{ ...glassCard, padding: "clamp(20px, 3vw, 26px)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(115,49,223,0.5), transparent)" }} />
            <div className="cta-row">
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: "rgba(115,49,223,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users style={{ width: 22, height: 22, color: P_SEC }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Family Practice Access</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 30, color: TEXT, lineHeight: 1, letterSpacing: "-0.02em" }}>£9.99</span>
                  </div>
                  <div style={{ color: MUTED, fontSize: 12.5, marginTop: 4 }}>One payment. Lifetime access.</div>
                </div>
              </div>
              <button data-testid="button-start-family-practice" className="btn-pulse" onClick={onStartFamilyPractice} style={{ background: P, color: "#fff", border: "none", padding: "15px 26px", borderRadius: 9999, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, flexShrink: 0 }} onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                Start Family Practice <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </motion.div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: MUTED, fontSize: 12.5, marginTop: 14 }}>
            <Lock style={{ width: 12, height: 12, color: P_SEC }} />
            <span>Secure. Safe. Built for learner drivers and their families.</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <button data-testid="button-just-wait" onClick={onJustWait} style={{ background: "none", border: "none", color: MUTED, fontSize: 13, fontWeight: 500, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }} onMouseEnter={e => (e.currentTarget.style.color = TEXT)} onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
              No thanks — just email me when an instructor opens up
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ChesterLearnerPage;
