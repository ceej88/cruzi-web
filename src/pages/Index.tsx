import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Crown, Calendar, ClipboardCheck, Mic, Smartphone, ArrowRight, CheckCircle, PoundSterling } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-driving.jpg";
import featureCalendar from "@/assets/feature-calendar.jpg";
import featureConfidence from "@/assets/feature-confidence.jpg";
import featureNotes from "@/assets/feature-notes.jpg";
import featureSteering from "@/assets/feature-steering.jpg";

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
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
                className="min-h-[44px] px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                style={{ touchAction: "manipulation" }}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-tight leading-[1.1] mb-6">
              The smarter way to manage your{" "}
              <span className="text-primary">driving school</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Diary, pupil progress, lesson plans and payments — all in one app.
              Built for independent ADIs across the UK.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleSelectRole("instructor")}
                className="min-h-[48px] px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
                style={{ touchAction: "manipulation" }}
              >
                Start 30-Day Free Trial
              </button>
              <button
                onClick={() => navigate("/savings")}
                className="min-h-[48px] px-8 py-3 border border-border text-foreground rounded-full font-bold text-sm hover:bg-accent active:scale-95 transition-all"
                style={{ touchAction: "manipulation" }}
              >
                See How Much You Save
              </button>
            </div>
          </motion.div>
          <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.2 }}>
            <img
              src={heroImg}
              alt="Driving instructor teaching a learner driver"
              className="w-full rounded-3xl shadow-xl object-cover aspect-[4/3]"
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>DVSA syllabus aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>GDPR compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Works on any device</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No contract required</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-8">
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
              },
              {
                icon: ClipboardCheck,
                title: "Pupil Progress",
                desc: "Score all 27 DVSA competencies on the official 1–5 scale. Share progress with students and parents.",
                img: featureConfidence,
              },
              {
                icon: Mic,
                title: "Voice Scribe",
                desc: "Dictate lesson notes hands-free after each session. Cruzi formats them into professional records.",
                img: featureNotes,
              },
              {
                icon: Smartphone,
                title: "Student App",
                desc: "Your students track their progress, book lessons, and study theory — all from their phone.",
                img: featureSteering,
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                {...fadeIn}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {feature.img && (
                  <img
                    src={feature.img}
                    alt={feature.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                )}
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

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 bg-muted/30">
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
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-black mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
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
            className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center shadow-sm"
          >
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

      {/* PORTALS */}
      <section id="portals" className="py-20 px-4 sm:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black font-outfit mb-4">
              Get started
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Instructor */}
            <motion.div
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => handleSelectRole("instructor")}
              className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-3">I'm an Instructor</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Diary, pupils, finances, compliance — everything an independent ADI needs, in one place.
              </p>
              <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </span>
            </motion.div>

            {/* Student */}
            <motion.div
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => handleSelectRole("student")}
              className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <ClipboardCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-3">I'm a Student</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Track your progress on every DVSA competency. Your instructor will give you a PIN to get started.
              </p>
              <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                Enter Student Portal <ArrowRight className="h-4 w-4" />
              </span>
            </motion.div>
          </div>
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

      {/* Owner Crown Button - Secret Admin Access */}
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
