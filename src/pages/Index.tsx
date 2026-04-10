import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Loader2, Crown, Calendar, ClipboardCheck, Mic, Smartphone,
  ArrowRight, CheckCircle, PoundSterling, BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import featureCalendar from "@/assets/feature-calendar.jpg";
import featureConfidence from "@/assets/feature-confidence.jpg";
import featureNotes from "@/assets/feature-notes.jpg";

const P = "#7C3AED";
const P_DARK = "#1E0A3C";
const P_MID = "#5B21B6";
const P_LIGHT = "#EDE9FE";
const P_BG = "#F5F3FF";
const P_GLOW = "rgba(124,58,237,0.2)";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Index: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: P }} />
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
    <div className="min-h-screen bg-white" style={{ color: "#111827" }}>

      <style>{`
        @keyframes purpleGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orbA {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(24px,-20px) scale(1.05); }
        }
        @keyframes orbB {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-20px,16px) scale(0.96); }
        }
        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4), 0 4px 20px rgba(124,58,237,0.25); }
          50%      { box-shadow: 0 0 0 12px rgba(124,58,237,0), 0 4px 20px rgba(124,58,237,0.25); }
        }
        .hero-gradient-text {
          background: linear-gradient(90deg, #7C3AED, #5B21B6, #7C3AED);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: purpleGradient 3s ease infinite;
        }
        .orb-a { animation: orbA 8s ease-in-out infinite; }
        .orb-b { animation: orbB 8s ease-in-out infinite 1s; }
        .btn-pulse { animation: ctaPulse 2s ease-in-out infinite; }
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(124,58,237,0.15);
        }
        .pro-card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pro-card-hover:hover {
          transform: translateY(-6px) scale(1.05);
        }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b" style={{ borderColor: "#E5E7EB" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="h-16 flex items-center justify-between">
            <span className="font-black text-xl font-outfit tracking-tight" style={{ color: "#111827" }}>
              Cruzi
            </span>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#6B7280" }}>
              <a href="#features" className="hover:text-purple-700 transition-colors" style={{ transition: "color 0.3s ease" }}>Features</a>
              <a href="#how-it-works" className="hover:text-purple-700 transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-purple-700 transition-colors">Pricing</a>
              <a href="#portals" className="hover:text-purple-700 transition-colors">Get Started</a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/auth?mode=login")}
                className="min-h-[44px] px-5 py-2 text-sm font-semibold transition-colors"
                style={{ color: "#6B7280", touchAction: "manipulation" }}
              >
                Log In
              </button>
              <button
                onClick={() => handleSelectRole("instructor")}
                className="btn-pulse min-h-[44px] px-5 py-2.5 text-sm font-bold text-white active:scale-95"
                style={{ background: P, borderRadius: 16, touchAction: "manipulation" }}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-8 bg-white"
        style={{ overflowX: "hidden" }}
      >
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="orb-a absolute rounded-full"
            style={{
              top: "8%", left: "15%", width: 480, height: 480,
              background: `radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)`,
              filter: "blur(48px)",
            }}
          />
          <div
            className="orb-b absolute rounded-full"
            style={{
              top: "15%", right: "12%", width: 380, height: 380,
              background: `radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)`,
              filter: "blur(48px)",
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-tight leading-[1.1] mb-5" style={{ color: "#111827" }}>
              The Only Platform Built for{" "}
              <span className="hero-gradient-text">Instructors, Students &amp; Parents</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
              Lesson plans in 2 minutes. Students practice between lessons with real test routes. Parents see real-time progress. This is what TD Drive forgot to build.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <button
                onClick={() => handleSelectRole("instructor")}
                className="btn-pulse inline-flex items-center justify-center gap-2 min-h-[52px] px-8 text-base font-bold text-white"
                style={{ background: P, borderRadius: 16, touchAction: "manipulation" }}
              >
                Start Free Trial — It's Free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleSelectRole("student")}
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 text-base font-bold bg-white"
                style={{
                  color: P, border: `2px solid ${P}`, borderRadius: 16,
                  touchAction: "manipulation", transition: "all 0.3s ease",
                }}
              >
                Get the Student App
              </button>
            </div>
          </motion.div>

          {/* ROLE CARDS */}
          <div className="grid sm:grid-cols-3 gap-4 text-left" id="portals">
            {[
              {
                icon: Calendar,
                label: "I'm a driving teacher",
                desc: "Diary, pupils, finances and compliance — all in one place.",
                cta: "Start Free Trial",
                delay: 0.05,
                onClick: () => handleSelectRole("instructor"),
              },
              {
                icon: ClipboardCheck,
                label: "I'm learning to drive",
                desc: "Track your progress, book lessons and prepare for your test.",
                cta: "Get the App",
                delay: 0.1,
                onClick: () => handleSelectRole("student"),
              },
              {
                icon: Smartphone,
                label: "I'm a parent",
                desc: "Support your child's learning with guided Co-Pilot practice.",
                cta: "Find Out More",
                delay: 0.15,
                onClick: () => handleSelectRole("student"),
              },
            ].map((card) => (
              <motion.button
                key={card.label}
                {...fadeIn}
                transition={{ duration: 0.4, delay: card.delay }}
                onClick={card.onClick}
                className="card-hover bg-white p-6 text-left cursor-pointer group w-full"
                style={{
                  borderRadius: 16, border: "1px solid #E5E7EB",
                  borderTop: `3px solid ${P}`, touchAction: "manipulation",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: P_LIGHT }}
                >
                  <card.icon className="h-5 w-5" style={{ color: P }} />
                </div>
                <h3 className="text-base font-black mb-1.5 leading-snug" style={{ color: P_DARK }}>{card.label}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>
                  {card.desc}
                </p>
                <span className="inline-flex items-center gap-1.5 font-bold text-sm group-hover:gap-2.5" style={{ color: P, transition: "gap 0.3s ease" }}>
                  {card.cta} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO VIDEO */}
      <section className="pb-14 px-4 sm:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} transition={{ duration: 0.6, delay: 0.2 }}>
            <div
              className="overflow-hidden"
              style={{ borderRadius: 20, border: `1px solid ${P_LIGHT}`, background: "#000", boxShadow: `0 24px 60px ${P_GLOW}` }}
            >
              <video
                src="https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/hero-demo.mp4"
                autoPlay muted loop playsInline className="w-full"
                onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-8 border-y" style={{ borderColor: P_LIGHT, background: P_BG }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium" style={{ color: "#6B7280" }}>
            {["DVSA syllabus aligned", "GDPR compliant", "Works on any device", "No contract required"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: P }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE EXPERIENCES */}
      <section className="py-24 px-4 sm:px-8" style={{ background: P_BG }}>
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4" style={{ color: P_DARK }}>
              One platform. Three experiences.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#6B7280" }}>
              Every role gets exactly what they need — nothing more, nothing less.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: "For Instructors",
                items: ["Lesson plans in 2 minutes", "Auto admin morning briefing", "Mock test recording", "Voice scribe notes", "Core skills tracking"],
                delay: 0,
              },
              {
                label: "For Students",
                items: ["Test routes to practise between lessons", "Progress across 27 DVSA skills", "Theory prep resources", "Lesson history", "Direct instructor connection"],
                delay: 0.1,
              },
              {
                label: "For Parents",
                items: ["Real-time progress view", "Co-pilot practice guide", "Test date countdown", "Between-lesson tracking", "Peace of mind dashboard"],
                delay: 0.2,
              },
            ].map((card) => (
              <motion.div
                key={card.label}
                {...fadeIn}
                transition={{ duration: 0.5, delay: card.delay }}
                className="card-hover bg-white p-7"
                style={{
                  borderRadius: 16, borderTop: `3px solid ${P}`,
                  border: "1px solid #E5E7EB", borderTopWidth: 3, borderTopColor: P,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: P_LIGHT }}
                >
                  <CheckCircle className="h-5 w-5" style={{ color: P }} />
                </div>
                <h3 className="text-lg font-black mb-5" style={{ color: P_DARK }}>{card.label}</h3>
                <ul className="space-y-3">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "#6B7280" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: P }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4" style={{ color: "#111827" }}>
              Everything you need, nothing you don't
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
              Built by people who understand what ADIs actually need day-to-day.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Calendar, title: "Diary & Scheduling", desc: "Manage your week at a glance. Drag lessons, block time off, colour-code by student.", img: featureCalendar, video: null },
              { icon: ClipboardCheck, title: "Pupil Progress", desc: "Score all 27 DVSA competencies on the official 1–5 scale. Share progress with students and parents.", img: featureConfidence, video: null },
              { icon: Mic, title: "Voice Scribe", desc: "Dictate lesson notes hands-free after each session. Cruzi formats them into professional records.", img: featureNotes, video: null },
              { icon: Smartphone, title: "Student App", desc: "Your students track their progress, book lessons, and study theory — all from their phone.", img: null, video: "https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/hero-mobile.mp4" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                {...fadeIn}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-hover overflow-hidden"
                style={{ borderRadius: 16, border: "1px solid #E5E7EB", background: "#fff" }}
              >
                {feature.video ? (
                  <video
                    src={feature.video} autoPlay muted loop playsInline className="w-full h-40 object-cover"
                    onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
                  />
                ) : feature.img ? (
                  <img
                    src={feature.img} alt={feature.title} className="w-full h-40 object-cover" loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : null}
                <div className="p-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: P_LIGHT }}>
                    <feature.icon className="h-5 w-5" style={{ color: P }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#111827" }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MOCK TEST DEMO */}
      <section className="py-16 px-4 sm:px-8" style={{ background: P_BG }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4" style={{ color: P_DARK }}>
                Built-in mock test recording
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: "#6B7280" }}>
                Record faults against all 26 DVSA categories during a mock test drive. Generate a professional debrief report instantly — no paper, no clipboard.
              </p>
              <ul className="space-y-3 text-sm" style={{ color: "#6B7280" }}>
                {["All 26 DVSA fault categories", "Driver and serious fault tracking", "One-tap report sharing with students", "Stored in pupil history automatically"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" style={{ color: P }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.2 }}>
              <div style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${P_LIGHT}`, background: "#000", boxShadow: `0 20px 50px ${P_GLOW}` }}>
                <video
                  src="https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/mocktest-demo.mp4"
                  autoPlay muted loop playsInline className="w-full"
                  onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20 px-4 sm:px-8" style={{ background: P_DARK }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeIn}
            className="relative pl-8"
            style={{ borderLeft: `4px solid ${P}` }}
          >
            <div
              className="absolute"
              style={{ top: -20, left: -12, fontSize: "6rem", lineHeight: 1, fontFamily: "Georgia, serif", color: P, opacity: 0.3 }}
            >
              &ldquo;
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-6 italic" style={{ color: "#FFFFFF" }}>
              I switched from TD Drive the same week I tried Cruzi. My students are more engaged between lessons than they have ever been. Parents are now messaging me asking questions they never asked before.
            </blockquote>
            <div className="flex items-center gap-3">
              <div>
                <p className="font-bold" style={{ color: P_LIGHT }}>Erica Vale</p>
                <p className="text-sm" style={{ color: "#A78BFA" }}>Independent ADI, Chester</p>
              </div>
              <span
                className="inline-flex items-center gap-1 text-xs font-bold text-white px-3 py-1 rounded-full ml-2"
                style={{ background: P }}
              >
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4" style={{ color: "#111827" }}>
              Up and running in minutes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create your free account. No card required." },
              { step: "2", title: "Set Up Your Diary", desc: "Add your students, set your hours, and configure your rates." },
              { step: "3", title: "Invite Your Students", desc: "Share a PIN or link. They join instantly and see their progress." },
            ].map((item, i) => (
              <motion.div key={item.step} {...fadeIn} transition={{ duration: 0.5, delay: i * 0.15 }} className="text-center">
                <div
                  className="w-14 h-14 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4"
                  style={{ background: P, boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#111827" }}>{item.title}</h3>
                <p className="text-sm" style={{ color: "#6B7280" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 sm:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4" style={{ color: "#111827" }}>
              Simple, transparent pricing
            </h2>
            <p className="text-lg" style={{ color: "#6B7280" }}>Start free. Upgrade when you're ready.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {[
              {
                name: "Free",
                price: "£0",
                period: "/month",
                desc: "Up to 10 students",
                pro: false,
                features: ["All core features", "Student app", "Parent dashboard", "DVSA skill tracking", "Voice scribe notes"],
                delay: 0,
              },
              {
                name: "Pro",
                price: "£14.99",
                period: "/month",
                desc: "Up to 14 students",
                pro: true,
                features: ["Everything in Free", "Priority support", "Advanced reporting", "Auto lesson plans", "Morning briefings"],
                delay: 0.1,
              },
              {
                name: "Premium",
                price: "£24.99",
                period: "/month",
                desc: "Unlimited students",
                pro: false,
                features: ["Everything in Pro", "Multi-instructor support", "School dashboard", "Bulk student management", "Custom branding"],
                delay: 0.2,
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                {...fadeIn}
                transition={{ duration: 0.5, delay: plan.delay }}
                className={`relative flex flex-col p-7 ${plan.pro ? "pro-card-hover" : "card-hover"}`}
                style={{
                  borderRadius: 16,
                  background: "#fff",
                  border: plan.pro ? `2px solid ${P}` : "1px solid #E5E7EB",
                  boxShadow: plan.pro ? `0 0 30px rgba(124,58,237,0.2)` : undefined,
                  transform: plan.pro ? "scale(1.05)" : undefined,
                }}
              >
                {plan.pro && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-black px-4 py-1.5 rounded-full"
                    style={{ background: P }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-black mb-1" style={{ color: "#111827" }}>{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black" style={{ color: P }}>{plan.price}</span>
                    <span className="text-sm mb-1.5" style={{ color: "#6B7280" }}>{plan.period}</span>
                  </div>
                  <p className="text-sm" style={{ color: "#6B7280" }}>{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#6B7280" }}>
                      <CheckCircle className="h-4 w-4 shrink-0" style={{ color: P }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectRole("instructor")}
                  className="w-full min-h-[48px] font-bold text-sm text-white active:scale-95"
                  style={{ background: P, borderRadius: 12, transition: "opacity 0.3s ease", touchAction: "manipulation" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SAVINGS CTA */}
      <section className="py-16 px-4 sm:px-8" style={{ background: P_BG }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeIn}
            className="relative overflow-hidden text-center p-8 md:p-12 bg-white"
            style={{ borderRadius: 20, border: `1px solid ${P_LIGHT}`, boxShadow: `0 8px 40px rgba(124,58,237,0.08)` }}
          >
            <PoundSterling className="h-8 w-8 mx-auto mb-4" style={{ color: P }} />
            <h2 className="text-2xl sm:text-3xl font-black font-outfit mb-3" style={{ color: "#111827" }}>
              See how much admin time you could save
            </h2>
            <p className="mb-6" style={{ color: "#6B7280" }}>Interactive calculator — personalised to your workload</p>
            <button
              onClick={() => navigate("/savings")}
              className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 font-bold text-sm text-white active:scale-95"
              style={{ background: P, borderRadius: 16, transition: "opacity 0.3s ease", touchAction: "manipulation" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Try the Calculator
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-8 border-t" style={{ borderColor: P_LIGHT, background: P_BG }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="font-black text-lg font-outfit" style={{ color: "#111827" }}>Cruzi</span>
              <p className="text-sm mt-1" style={{ color: "#6B7280" }}>The smarter way to manage your driving school.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: "#6B7280" }}>
              <a href="/terms" className="hover:text-purple-700 transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-purple-700 transition-colors">Privacy</a>
              <a href="/cookies" className="hover:text-purple-700 transition-colors">Cookies</a>
              <a href="/acceptable-use" className="hover:text-purple-700 transition-colors">Acceptable Use</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-xs" style={{ borderColor: P_LIGHT, color: "#6B7280" }}>
            © {new Date().getFullYear()} Cruzi. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Owner Crown — secret access */}
      <div className="fixed bottom-4 right-4 z-50" style={{ opacity: 0.2, transition: "opacity 0.3s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.2")}
      >
        <button
          onClick={() => navigate("/owner")}
          className="flex items-center justify-center w-8 h-8 rounded-full"
          style={{ background: "#F3F4F6", transition: "background 0.3s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FCD34D")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
        >
          <Crown className="h-4 w-4" style={{ color: "#9CA3AF" }} />
        </button>
      </div>
    </div>
  );
};

export default Index;
