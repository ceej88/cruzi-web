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

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

const Index: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ scrollBehavior: "smooth" }}>

      <style>{`
        @keyframes gradientCycle {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-25px, 15px) scale(0.94); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-35px, 25px) scale(1.06); }
          66% { transform: translate(30px, -20px) scale(0.96); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.04); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.5), 0 4px 24px rgba(124,58,237,0.25); }
          50% { box-shadow: 0 0 0 10px rgba(124, 58, 237, 0), 0 4px 32px rgba(124,58,237,0.45); }
        }
        .gradient-text {
          background: linear-gradient(90deg, #7c3aed, #3b82f6, #7c3aed);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientCycle 4s ease infinite;
        }
        .cta-pulse {
          animation: pulseGlow 2.2s ease-in-out infinite;
        }
        .orb1 { animation: orbFloat1 12s ease-in-out infinite; }
        .orb2 { animation: orbFloat2 16s ease-in-out infinite; }
        .orb3 { animation: orbFloat3 20s ease-in-out infinite; }
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .dark .glass-card {
          background: rgba(255,255,255,0.03);
        }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="h-16 flex items-center justify-between">
            <span className="font-black text-xl font-outfit tracking-tight text-foreground">
              Cruzi
            </span>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#portals" className="hover:text-foreground transition-colors">Get Started</a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/auth?mode=login")}
                className="min-h-[44px] px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                style={{ touchAction: "manipulation" }}
              >
                Log In
              </button>
              <button
                onClick={() => handleSelectRole("instructor")}
                className="cta-pulse min-h-[44px] px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                style={{ touchAction: "manipulation" }}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-28 pb-10 md:pt-36 md:pb-12 px-4 sm:px-8 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb1 absolute top-10 left-1/4 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="orb2 absolute top-20 right-1/4 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="orb3 absolute bottom-0 left-1/2 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", filter: "blur(50px)" }} />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-tight leading-[1.1] mb-5">
              The Only Platform Built for{" "}
              <span className="gradient-text">Instructors, Students &amp; Parents</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Lesson plans in 2 minutes. Students practice between lessons with real test routes. Parents see real-time progress. This is what TD Drive forgot to build.
            </p>
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
                className="bg-card border border-border rounded-2xl p-6 text-left shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 active:scale-[0.98] transition-all cursor-pointer group w-full"
                style={{ touchAction: "manipulation" }}
              >
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-black mb-1.5 leading-snug">{card.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {card.desc}
                </p>
                <span className="inline-flex items-center gap-1.5 text-primary font-bold text-sm group-hover:gap-2.5 transition-all">
                  {card.cta} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO VIDEO */}
      <section className="pb-14 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-black">
              <video
                src="https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/hero-demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm font-medium">
            {["DVSA syllabus aligned", "GDPR compliant", "Works on any device", "No contract required"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE EXPERIENCES */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4">
              One platform. Three experiences.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every role gets exactly what they need — nothing more, nothing less.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: "For Instructors",
                color: "#7c3aed",
                borderColor: "border-t-purple-500",
                glowColor: "rgba(124,58,237,0.15)",
                delay: 0,
                items: [
                  "Lesson plans in 2 minutes",
                  "Auto admin morning briefing",
                  "Mock test recording",
                  "Voice scribe notes",
                  "Core skills tracking",
                ],
              },
              {
                label: "For Students",
                color: "#3b82f6",
                borderColor: "border-t-blue-500",
                glowColor: "rgba(59,130,246,0.15)",
                delay: 0.1,
                items: [
                  "Test routes to practice between lessons",
                  "Progress across 27 DVSA skills",
                  "Theory prep resources",
                  "Lesson history",
                  "Direct instructor connection",
                ],
              },
              {
                label: "For Parents",
                color: "#10b981",
                borderColor: "border-t-emerald-500",
                glowColor: "rgba(16,185,129,0.15)",
                delay: 0.2,
                items: [
                  "Real-time progress view",
                  "Co-pilot practice guide",
                  "Test date countdown",
                  "Between-lesson tracking",
                  "Peace of mind dashboard",
                ],
              },
            ].map((card) => (
              <motion.div
                key={card.label}
                {...fadeIn}
                transition={{ duration: 0.5, delay: card.delay }}
                className={`glass-card rounded-2xl border-t-4 ${card.borderColor} p-7 transition-all duration-300 hover:-translate-y-2`}
                style={{ "--glow": card.glowColor } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${card.glowColor}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                <h3 className="text-lg font-black font-outfit mb-5" style={{ color: card.color }}>
                  {card.label}
                </h3>
                <ul className="space-y-3">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: card.color }} />
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
      <section id="features" className="py-20 px-4 sm:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built by people who understand what ADIs actually need day-to-day.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: "Diary & Scheduling",
                desc: "Manage your week at a glance. Drag lessons, block time off, colour-code by student.",
                img: featureCalendar,
                video: null,
              },
              {
                icon: ClipboardCheck,
                title: "Pupil Progress",
                desc: "Score all 27 DVSA competencies on the official 1–5 scale. Share progress with students and parents.",
                img: featureConfidence,
                video: null,
              },
              {
                icon: Mic,
                title: "Voice Scribe",
                desc: "Dictate lesson notes hands-free after each session. Cruzi formats them into professional records.",
                img: featureNotes,
                video: null,
              },
              {
                icon: Smartphone,
                title: "Student App",
                desc: "Your students track their progress, book lessons, and study theory — all from their phone.",
                img: null,
                video: "https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/hero-mobile.mp4",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                {...fadeIn}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {feature.video ? (
                  <video
                    src={feature.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-40 object-cover"
                  />
                ) : feature.img ? (
                  <img
                    src={feature.img}
                    alt={feature.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="p-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MOCK TEST DEMO */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4">
                Built-in mock test recording
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Record faults against all 26 DVSA categories during a mock test drive. Generate a professional debrief report instantly — no paper, no clipboard.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["All 26 DVSA fault categories", "Driver and serious fault tracking", "One-tap report sharing with students", "Stored in pupil history automatically"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-black">
                <video
                  src="https://rolbqirsfgfsuuxptmbh.supabase.co/storage/v1/object/public/website-assets/mocktest-demo.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20 px-4 sm:px-8 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeIn}
            className="relative pl-8 border-l-4 border-primary"
          >
            <div className="absolute -top-4 -left-3 text-primary" style={{ fontSize: "5rem", lineHeight: 1, opacity: 0.25, fontFamily: "Georgia, serif" }}>&ldquo;</div>
            <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed text-foreground mb-6">
              I switched from TD Drive the same week I tried Cruzi. My students are more engaged between lessons than they have ever been. Parents are now messaging me asking questions they never asked before.
            </blockquote>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Erica Vale — Independent ADI, Chester</span>
              <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4">
              Up and running in minutes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create your free account. No card required." },
              { step: "2", title: "Set Up Your Diary", desc: "Add your students, set your hours, and configure your rates." },
              { step: "3", title: "Invite Your Students", desc: "Share a PIN or link. They join instantly and see their progress." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...fadeIn}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-lg" style={{ boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 sm:px-8 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free. Upgrade when you're ready.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                name: "Free",
                price: "£0",
                period: "/month",
                desc: "Up to 10 students",
                highlight: false,
                badge: null,
                features: [
                  "All core features",
                  "Student app",
                  "Parent dashboard",
                  "DVSA skill tracking",
                  "Voice scribe notes",
                ],
                delay: 0,
              },
              {
                name: "Pro",
                price: "£14.99",
                period: "/month",
                desc: "Up to 14 students",
                highlight: true,
                badge: "Most Popular",
                features: [
                  "Everything in Free",
                  "Priority support",
                  "Advanced reporting",
                  "Auto lesson plans",
                  "Morning briefings",
                ],
                delay: 0.1,
              },
              {
                name: "Premium",
                price: "£24.99",
                period: "/month",
                desc: "Unlimited students",
                highlight: false,
                badge: null,
                features: [
                  "Everything in Pro",
                  "Multi-instructor support",
                  "School dashboard",
                  "Bulk student management",
                  "Custom branding",
                ],
                delay: 0.2,
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                {...fadeIn}
                transition={{ duration: 0.5, delay: plan.delay }}
                className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-2 ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground shadow-2xl"
                    : "bg-card border border-border hover:shadow-lg"
                }`}
                style={plan.highlight ? { boxShadow: "0 8px 40px rgba(124,58,237,0.35)" } : {}}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background text-primary text-xs font-black px-3 py-1 rounded-full border border-primary shadow-md">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-black mb-1 ${plan.highlight ? "text-primary-foreground" : ""}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className={`text-sm mb-1.5 ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm ${plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {plan.desc}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-primary-foreground/80" : "text-primary"}`} />
                      <span className={plan.highlight ? "text-primary-foreground/90" : "text-muted-foreground"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectRole("instructor")}
                  className={`w-full min-h-[48px] rounded-full font-bold text-sm transition-all active:scale-95 hover:opacity-90 ${
                    plan.highlight
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-primary-foreground"
                  }`}
                  style={{ touchAction: "manipulation" }}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SAVINGS CTA */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeIn}
            className="relative overflow-hidden bg-card border border-border rounded-2xl p-8 md:p-12 text-center shadow-sm"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)", filter: "blur(20px)" }} />
            </div>
            <PoundSterling className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black font-outfit mb-3">
              See how much admin time you could save
            </h2>
            <p className="text-muted-foreground mb-6">
              Interactive calculator — personalised to your workload
            </p>
            <button
              onClick={() => navigate("/savings")}
              className="min-h-[48px] px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-2"
              style={{ touchAction: "manipulation" }}
            >
              Try the Calculator
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-8 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="font-black text-lg font-outfit text-foreground">Cruzi</span>
              <p className="text-sm text-muted-foreground mt-1">
                The smarter way to manage your driving school.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a>
              <a href="/acceptable-use" className="hover:text-foreground transition-colors">Acceptable Use</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cruzi. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Owner Crown Button */}
      <div className="fixed bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity duration-300 z-50">
        <button
          onClick={() => navigate("/owner")}
          className="group flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-amber-400 transition-all active:scale-95"
        >
          <Crown className="h-4 w-4 text-muted-foreground group-hover:text-amber-900 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default Index;
