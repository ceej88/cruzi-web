import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import SiteNav from "@/components/landing/SiteNav";
import { usePageMeta } from "@/hooks/usePageMeta";
import { supabase } from "@/integrations/supabase/client";

const BG       = "#F8F9FF";
const GLASS    = "rgba(255, 255, 255, 0.92)";
const GLASS_B  = "rgba(115, 49, 223, 0.18)";
const P        = "#5300B7";
const P_SEC    = "#6D28D9";
const TEXT     = "#0D1C2F";
const MUTED    = "#4A4455";
const FIELD_BG = "#FFFFFF";

const FUNNEL_KEY = "cruzi.chester.funnel.v1";

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

interface FunnelState {
  firstName?: string;
  email?: string;
  phone?: string;
  area?: string;
  interestedInFamilyPractice?: boolean;
}

interface FormErrors {
  fullName?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

const ChesterStartPlaceholder: React.FC = () => {
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
    title: "Create your account — Family Practice | Cruzi",
    description:
      "Create your Cruzi learner account to unlock Family Practice. The same email and password let you sign in on the mobile app.",
    canonical: "https://cruzi.co.uk/chester/start",
  });

  const [funnel, setFunnel] = useState<FunnelState>({});
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(FUNNEL_KEY);
      if (raw) setFunnel(JSON.parse(raw));
    } catch { /* ignore */ }
    finally { setHydrated(true); }
  }, []);

  const hasFunnel = !!(funnel.firstName && funnel.email);

  const [canceled, setCanceled] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("canceled") === "1") setCanceled(true);
  }, []);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  useEffect(() => {
    if (funnel.firstName && !fullName) setFullName(funnel.firstName);
  }, [funnel.firstName, fullName]);

  const email = (funnel.email || "").trim();

  const passwordIsStrong = useMemo(
    () => password.length >= 8 && /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password),
    [password],
  );

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!passwordIsStrong) next.password = "Use at least 8 characters with a number or symbol.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasFunnel) return;
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailLooksValid) {
      const msg = "Your saved email looks invalid. Please go back and rejoin the waiting list.";
      setErrors({ submit: msg });
      toast.error(msg);
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role: "student", full_name: fullName.trim() },
        },
      });

      if (error) {
        const friendly = error.message.toLowerCase().includes("already registered")
          ? "This email is already registered. Try signing in inside the Cruzi app instead."
          : error.message;
        setErrors({ submit: friendly });
        toast.error(friendly);
        return;
      }

      try { localStorage.setItem("cruzi_signup_name", fullName.trim()); } catch { /* ignore */ }
      try {
        const updated: FunnelState = {
          ...funnel,
          firstName: fullName.trim(),
          email,
          interestedInFamilyPractice: true,
        };
        sessionStorage.setItem(FUNNEL_KEY, JSON.stringify(updated));
      } catch { /* ignore */ }

      // Show the continuous "Securing checkout…" state while we hit Stripe.
      setSignedUp(true);

      // Create the Stripe Checkout Session and redirect. The user lands on
      // /chester/success on completion, or back here with ?canceled=1.
      const { data: checkout, error: checkoutErr } = await supabase.functions.invoke(
        "chester-create-checkout-session",
      );
      if (checkoutErr || !checkout?.url) {
        const msg = "We couldn't open secure checkout. Please try again in a moment.";
        setErrors({ submit: msg });
        toast.error(msg);
        setSignedUp(false);
        return;
      }
      window.location.href = checkout.url;
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        html { overflow-x: hidden; }
        .field { width: 100%; background: ${FIELD_BG}; border: 1px solid ${GLASS_B}; border-radius: 14px; padding: 14px 14px 14px 44px; font-size: 15.5px; color: ${TEXT}; font-family: 'Inter', sans-serif; outline: none; transition: border-color .15s ease, box-shadow .15s ease; -webkit-appearance: none; appearance: none; }
        .field::placeholder { color: rgba(74, 68, 85, 0.55); }
        .field:focus { border-color: ${P_SEC}; box-shadow: 0 0 0 3px rgba(115,49,223,0.12); }
        .field[readonly] { background: #FAFAFE; color: ${TEXT}; cursor: default; }
        .field-label { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 13.5px; color: ${TEXT}; margin-bottom: 8px; }
        .field-wrap { position: relative; }
        .field-icon-left, .field-icon-right { position: absolute; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: ${P_SEC}; pointer-events: none; }
        .field-icon-left { left: 14px; }
        .field-icon-right { right: 14px; pointer-events: auto; background: none; border: 0; padding: 0; cursor: pointer; color: ${MUTED}; }
        .field-icon-right:hover { color: ${P_SEC}; }
        .field-helper { color: ${MUTED}; font-size: 12.5px; margin: 6px 0 0; line-height: 1.45; }
        .field-error { color: #B91C1C; font-size: 12.5px; margin: 6px 0 0; line-height: 1.45; }
        .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: ${P}; color: #fff; border: 0; padding: 16px 24px; border-radius: 9999px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 15.5px; cursor: pointer; transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease; box-shadow: 0 12px 28px rgba(83, 0, 183, 0.28); }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
      `}</style>

      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 12% 18%, rgba(115,49,223,0.18) 0%, transparent 55%), radial-gradient(ellipse at 88% 82%, rgba(115,49,223,0.10) 0%, transparent 50%)" }} />

      <SiteNav navigate={navigate} onGetStarted={() => navigate("/chester")} />

      <section style={{ position: "relative", zIndex: 1, padding: "104px 20px 56px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {!hydrated ? null : !hasFunnel ? (
            <ColdLandingCard />
          ) : canceled && !signedUp ? (
            <CancelCard onResume={async () => {
              setCanceled(false);
              setSignedUp(true);
              const { data: checkout, error: checkoutErr } =
                await supabase.functions.invoke("chester-create-checkout-session");
              if (checkoutErr || !checkout?.url) {
                const msg = "We couldn't reopen secure checkout. Please try again.";
                toast.error(msg);
                setSignedUp(false);
                setCanceled(true);
                return;
              }
              window.location.href = checkout.url;
            }} />
          ) : signedUp ? (
            <SuccessCard email={email} fullName={fullName} />
          ) : (
            <motion.form {...fadeUp} onSubmit={onSubmit} noValidate data-testid="form-create-account" style={{ ...glassCard, padding: "clamp(24px, 5vw, 36px)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 9999, background: "rgba(115,49,223,0.12)", border: "1px solid rgba(115,49,223,0.32)", color: P_SEC, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }} data-testid="pill-family-practice-access">
                <Lock style={{ width: 12, height: 12 }} /> FAMILY PRACTICE ACCESS
              </div>

              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3.4vw, 2rem)", letterSpacing: "-0.02em", margin: "0 0 10px", color: TEXT, lineHeight: 1.15 }} data-testid="text-heading">
                Create your account
              </h1>
              <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.55, margin: "0 0 22px" }}>
                Use the same email and password later inside the Cruzi app.
              </p>

              <div style={{ marginBottom: 16 }}>
                <label className="field-label" htmlFor="fullName">Full name</label>
                <div className="field-wrap">
                  <UserIcon className="field-icon-left" />
                  <input id="fullName" data-testid="input-full-name" className="field" type="text" autoComplete="name" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                {errors.fullName && <p className="field-error" data-testid="error-full-name">{errors.fullName}</p>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="field-label" htmlFor="email">Email address</label>
                <div className="field-wrap">
                  <Mail className="field-icon-left" />
                  <input id="email" data-testid="input-email" className="field" type="email" autoComplete="email" value={email} readOnly aria-readonly="true" style={{ paddingRight: 44 }} />
                  <Lock style={{ position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)", width: 18, height: 18, color: P_SEC, pointerEvents: "none" }} aria-hidden="true" />
                </div>
                <p className="field-helper">We'll use this email to sign you in.</p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-wrap">
                  <Lock className="field-icon-left" />
                  <input id="password" data-testid="input-password" className="field" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                  <button type="button" className="field-icon-right" data-testid="button-toggle-password" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff style={{ width: 20, height: 20 }} /> : <Eye style={{ width: 20, height: 20 }} />}
                  </button>
                </div>
                {errors.password ? <p className="field-error" data-testid="error-password">{errors.password}</p> : <p className="field-helper">At least 8 characters with a number or symbol.</p>}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
                <div className="field-wrap">
                  <Lock className="field-icon-left" />
                  <input id="confirmPassword" data-testid="input-confirm-password" className="field" type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                  <button type="button" className="field-icon-right" data-testid="button-toggle-confirm-password" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide password" : "Show password"}>
                    {showConfirm ? <EyeOff style={{ width: 20, height: 20 }} /> : <Eye style={{ width: 20, height: 20 }} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="field-error" data-testid="error-confirm-password">{errors.confirmPassword}</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: 14, marginBottom: 18, borderRadius: 16, background: "rgba(115,49,223,0.06)", border: "1px solid rgba(115,49,223,0.14)" }} data-testid="trust-row">
                {([
                  { Icon: CheckCircle, title: "One-time payment", sub: "No subscription" },
                  { Icon: ShieldCheck, title: "Secure checkout",  sub: "Powered by Stripe" },
                  { Icon: Smartphone,  title: "Use inside the app", sub: "iOS & Android" },
                ] as const).map(({ Icon, title, sub }) => (
                  <div key={title} style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Icon style={{ width: 14, height: 14, color: P_SEC, flexShrink: 0 }} />
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12.5, color: TEXT, lineHeight: 1.2 }}>{title}</div>
                    </div>
                    <div style={{ color: MUTED, fontSize: 11.5, lineHeight: 1.35 }}>{sub}</div>
                  </div>
                ))}
              </div>

              {errors.submit && <p className="field-error" data-testid="error-submit" style={{ marginTop: -8, marginBottom: 12 }}>{errors.submit}</p>}

              <button type="submit" className="btn-primary" data-testid="button-continue-checkout" disabled={submitting}>
                {submitting ? "Creating account…" : (<>Continue to secure checkout <ArrowRight style={{ width: 16, height: 16 }} /></>)}
              </button>

              <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: MUTED, fontSize: 12.5 }}>
                <Lock style={{ width: 12, height: 12, color: P_SEC }} />
                Secure. Safe. Built for learner drivers and their families.
              </div>
            </motion.form>
          )}
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

const ColdLandingCard: React.FC = () => (
  <motion.div {...fadeUp} style={{ ...glassCard, padding: 28, textAlign: "center" }} data-testid="status-cold-landing">
    <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 2.6vw, 1.7rem)", margin: "0 0 12px", color: TEXT, letterSpacing: "-0.02em" }}>
      Looks like you haven't joined the Chester list yet.
    </h1>
    <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.65, margin: "0 0 22px" }}>
      Pop your details in and we'll match you with a verified local driving instructor.
    </p>
    <Link to="/chester" data-testid="link-back-to-chester" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: P, color: "#fff", padding: "13px 26px", borderRadius: 9999, fontSize: 14.5, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: "none", boxShadow: "0 0 16px rgba(115,49,223,0.28)" }}>
      Go to the Chester page
    </Link>
  </motion.div>
);


const CancelCard: React.FC<{ onResume: () => void | Promise<void> }> = ({ onResume }) => (
  <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(24px, 5vw, 36px)", textAlign: "left" }} data-testid="status-checkout-canceled">
    <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 2.8vw, 1.7rem)", margin: "0 0 10px", color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
      No problem.
    </h1>
    <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.6, margin: "0 0 22px" }}>
      Your account has been created. You can come back to Family Practice any time.
    </p>
    <button
      type="button"
      onClick={onResume}
      data-testid="button-resume-checkout"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, background: P, color: "#fff", border: 0, padding: "13px 26px", borderRadius: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, cursor: "pointer", boxShadow: "0 12px 28px rgba(83, 0, 183, 0.22)" }}
    >
      Continue to secure checkout
    </button>
  </motion.div>
);

const SuccessCard: React.FC<{ email: string; fullName: string }> = () => (
  <motion.div {...fadeUp} style={{ ...glassCard, padding: "clamp(28px, 5vw, 40px)", textAlign: "center" }} data-testid="status-securing-checkout" role="status" aria-live="polite">
    <style>{`
      @keyframes cruziSpin { to { transform: rotate(360deg); } }
      .securing-spinner {
        width: 44px; height: 44px; border-radius: 50%;
        border: 3px solid rgba(115,49,223,0.18);
        border-top-color: ${P};
        margin: 4px auto 18px;
        animation: cruziSpin 0.9s linear infinite;
      }
      @keyframes cruziProgress {
        0%   { transform: translateX(-100%); }
        50%  { transform: translateX(20%); }
        100% { transform: translateX(110%); }
      }
      .securing-bar {
        position: relative;
        margin: 18px auto 0;
        width: 70%;
        height: 4px;
        border-radius: 9999px;
        background: rgba(115,49,223,0.12);
        overflow: hidden;
      }
      .securing-bar::after {
        content: "";
        position: absolute; top: 0; left: 0;
        width: 40%; height: 100%;
        border-radius: 9999px;
        background: linear-gradient(90deg, ${P_SEC}, ${P});
        animation: cruziProgress 1.4s ease-in-out infinite;
      }
    `}</style>
    <div className="securing-spinner" aria-hidden="true" />
    <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.25rem, 2.6vw, 1.55rem)", letterSpacing: "-0.02em", margin: "0 0 8px", color: TEXT, lineHeight: 1.2 }} data-testid="text-securing-heading">
      Securing checkout…
    </h2>
    <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
      One moment while we set up your secure payment.
    </p>
    <div className="securing-bar" aria-hidden="true" />
  </motion.div>
);

export default ChesterStartPlaceholder;
