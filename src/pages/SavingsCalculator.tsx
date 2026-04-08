import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Clock, PoundSterling, TrendingUp, ArrowRight, Sparkles, Heart, GraduationCap } from "lucide-react";
import { useAnimatedCounter, formatPounds, FadeInSection, StatCard } from "./savings/shared";
import TimeBackSection from "./savings/TimeBackSection";
import StudentOutcomesSection from "./savings/StudentOutcomesSection";
import { usePageTracker } from "@/hooks/usePageTracker";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/* ─── Main Page ─── */
const SavingsCalculator: React.FC = () => {
  const navigate = useNavigate();
  usePageTracker("/savings");
  useDocumentTitle("How Much Is Admin Costing You? | Cruzi");

  // Calculator state
  const [hoursSaved, setHoursSaved] = useState(1.5);
  const [hourlyRate, setHourlyRate] = useState(38);
  const [workingDays, setWorkingDays] = useState(5);

  // Computed values
  const computed = useMemo(() => {
    const hoursPerWeek = hoursSaved * workingDays;
    const hoursPerYear = hoursPerWeek * 48;
    const extraLessonsPerWeek = Math.floor(hoursPerWeek);
    const extraRevenuePerWeek = extraLessonsPerWeek * hourlyRate;
    const extraRevenuePerMonth = extraRevenuePerWeek * 4.33;
    const extraRevenuePerYear = extraRevenuePerWeek * 48;
    const eliteCostPerYear = 29.99 * 12;
    const roiMultiplier = extraRevenuePerYear / eliteCostPerYear;
    return {
      hoursPerWeek,
      hoursPerYear,
      extraLessonsPerWeek,
      extraRevenuePerWeek,
      extraRevenuePerMonth,
      extraRevenuePerYear,
      roiMultiplier,
      eliteCostPerYear
    };
  }, [hoursSaved, hourlyRate, workingDays]);

  // Animated display values
  const animHoursWeek = useAnimatedCounter(computed.hoursPerWeek);
  const animHoursYear = useAnimatedCounter(computed.hoursPerYear);
  const animLessons = useAnimatedCounter(computed.extraLessonsPerWeek);
  const animRevenueWeek = useAnimatedCounter(computed.extraRevenuePerWeek);
  const animRevenueMonth = useAnimatedCounter(computed.extraRevenuePerMonth);
  const animRevenueYear = useAnimatedCounter(computed.extraRevenuePerYear);
  const animROI = useAnimatedCounter(computed.roiMultiplier);

  // Haptic feedback
  const haptic = () => navigator.vibrate?.(10);
  const hoursPresets = [1, 2, 3, 4];
  const daysOptions = [4, 5, 6];
  return <div className="min-h-screen bg-background text-foreground overflow-x-hidden overflow-y-auto">
      {/* ─── FIXED NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border pt-safe">
        <div className="max-w-4xl mx-auto px-4 sm:px-10">
          <div className="h-16 sm:h-20 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="font-black text-xl tracking-tight neural-gradient-text" style={{
            animation: "text-glow 3s ease-in-out infinite"
          }}>
              Cruzi
            </button>
            <button onClick={() => navigate("/instructor")} className="min-h-[44px] px-5 py-2.5 bg-foreground text-background rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all" style={{
            touchAction: "manipulation"
          }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          SECTION 1 — THE HOOK
       ═══════════════════════════════════════ */}
      <section className="pt-32 pb-16 px-6 sm:px-10 min-h-[100dvh] flex flex-col items-center justify-center text-center">
        <motion.div initial={{
        opacity: 0,
        y: 40
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1]
      }} className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary border border-border rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-secondary-foreground">
            <Clock className="w-3.5 h-3.5" />
            Time &amp; Money Calculator
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-outfit tracking-[-0.03em] leading-[1.15] mb-8">
            How Much Is Admin{" "}
            <span className="whitespace-nowrap italic text-[#7c3aed] inline-block pb-1 mx-[10px] px-[4px]">
              Costing You?
            </span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium mb-16 text-secondary-foreground">Most ADIs lose 1, 3 hours a day on paperwork, texts, and record-keeping. Let's see what that means for your wallet, and your life.</p>

          <motion.div animate={{
          y: [0, 8, 0]
        }} transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }} className="text-muted-foreground">
            <ChevronDown className="w-6 h-6 mx-auto" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — THE CALCULATOR
       ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <FadeInSection>
            <p className="text-sm font-black uppercase tracking-[0.3em] mb-3 text-center text-secondary-foreground">
              Personalise Your Numbers
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit text-center mb-12">
              Build Your Savings Profile
            </h2>
          </FadeInSection>

          {/* ── HOURS SAVED SLIDER ── */}
          <FadeInSection delay={0.1}>
            <div className="bg-card rounded-[2rem] sm:rounded-[3rem] border border-border shadow-xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-black">Hours Saved Per Day</h3>
              </div>
              <p className="text-sm text-foreground mb-6 ml-[52px]">
                How much admin time could Cruzi save you each working day?
              </p>

              <div className="flex gap-2 mb-6 flex-wrap">
                {hoursPresets.map(h => <button key={h} onClick={() => {
                setHoursSaved(h);
                haptic();
              }} className={`min-h-[44px] px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-wider transition-all active:scale-95 ${hoursSaved === h ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary text-secondary-foreground hover:bg-accent"}`} style={{
                touchAction: "manipulation"
              }}>
                    {h}h
                  </button>)}
              </div>

              <div className="px-1">
                <Slider value={[hoursSaved]} onValueChange={([v]) => {
                setHoursSaved(v);
                haptic();
              }} min={0.5} max={4} step={0.5} aria-label="Hours saved per day" className="w-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                <span>30 min</span>
                <span className="font-black text-foreground text-base">
                  {hoursSaved}h
                </span>
                <span>4 hours</span>
              </div>
            </div>
          </FadeInSection>

          {/* ── HOURLY RATE SLIDER ── */}
          <FadeInSection delay={0.15}>
            <div className="bg-card rounded-[2rem] sm:rounded-[3rem] border border-border shadow-xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <PoundSterling className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-black">Your Hourly Lesson Rate</h3>
              </div>
              <p className="text-sm text-foreground mb-6 ml-[52px]">
                What do you charge per driving lesson?
              </p>

              <div className="px-1">
                <Slider value={[hourlyRate]} onValueChange={([v]) => {
                setHourlyRate(v);
                haptic();
              }} min={25} max={60} step={1} aria-label="Hourly lesson rate in pounds" className="w-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                <span>£25</span>
                <span className="font-black text-foreground text-base">
                  £{hourlyRate}
                </span>
                <span>£60</span>
              </div>
            </div>
          </FadeInSection>

          {/* ── WORKING DAYS SELECTOR ── */}
          <FadeInSection delay={0.2}>
            <div className="bg-card rounded-[2rem] sm:rounded-[3rem] border border-border shadow-xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-black">Working Days Per Week</h3>
              </div>
              <p className="text-sm text-foreground mb-6 ml-[52px]">
                How many days a week do you teach?
              </p>

              <div className="flex gap-3">
                {daysOptions.map(d => <button key={d} onClick={() => {
                setWorkingDays(d);
                haptic();
              }} className={`flex-1 min-h-[56px] rounded-2xl text-lg font-black transition-all active:scale-95 ${workingDays === d ? "bg-primary text-primary-foreground shadow-lg scale-105" : "bg-secondary text-secondary-foreground hover:bg-accent"}`} style={{
                touchAction: "manipulation"
              }}>
                    {d} days
                  </button>)}
              </div>
            </div>
          </FadeInSection>

          {/* ── LIVE RESULTS SUMMARY ── */}
          <FadeInSection delay={0.25}>
            <div className="bg-card rounded-[2rem] sm:rounded-[3rem] border border-border shadow-xl p-6 sm:p-10">
              <h3 className="text-lg font-black mb-6 text-center">
                Your Savings at a Glance
              </h3>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <StatCard label="Hours / week" value={`${animHoursWeek.toFixed(1)}h`} />
                <StatCard label="Hours / year" value={`${Math.round(animHoursYear)}h`} />
                <StatCard label="Extra lessons / week" value={`${Math.round(animLessons)}`} />
                <StatCard label="Extra revenue / week" value={formatPounds(animRevenueWeek)} highlight />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-4">
                <StatCard label="Extra revenue / month" value={formatPounds(animRevenueMonth)} highlight />
                <StatCard label="Extra revenue / year" value={formatPounds(animRevenueYear)} highlight large />
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — YOUR TIME BACK
       ═══════════════════════════════════════ */}
      <TimeBackSection hoursPerWeek={computed.hoursPerWeek} hoursPerYear={computed.hoursPerYear} />

      {/* ═══════════════════════════════════════
          SECTION 4 — STUDENT OUTCOMES
       ═══════════════════════════════════════ */}
      <StudentOutcomesSection />

      {/* ═══════════════════════════════════════
          SECTION 5 — THE PAYOFF (enhanced)
       ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-10 pb-32">
        <FadeInSection>
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden p-8 sm:p-14 text-white" style={{
            background: "#7c3aed",
            animation: "glow-breathe 3s ease-in-out infinite"
          }}>
              {/* Decorative blurs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

              <div className="relative z-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-secondary">
                  Your Potential Extra Earnings
                </p>

                <p className="text-5xl sm:text-6xl md:text-7xl font-black font-outfit tracking-tight mb-6">
                  {formatPounds(animRevenueYear)}
                  <span className="text-2xl sm:text-3xl text-white/60 ml-2">
                    /year
                  </span>
                </p>

                {/* Enhanced secondary stats */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <Heart className="w-4 h-4" />
                    <span className="font-black text-sm">
                      {Math.round(animHoursYear)}h back with your family
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-black text-sm">
                      Help students beat the 50% pass rate
                    </span>
                  </div>
                </div>

                <div className="max-w-lg mx-auto mb-10 space-y-4">
                  <p className="text-base sm:text-lg font-medium text-secondary">
                    Cruzi Elite costs £29.99/month. You could earn back{" "}
                    <span className="font-black text-white">
                      {Math.round(animROI)}× that
                    </span>
                    .
                  </p>

                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <Sparkles className="w-5 h-5 text-white" />
                    <span className="font-black text-2xl sm:text-3xl">
                      {Math.round(animROI)}× ROI
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => {
                  haptic();
                  navigate("/instructor");
                }} className="min-h-[56px] px-10 py-4 bg-white text-foreground rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3" style={{
                  touchAction: "manipulation"
                }}>
                    Start Saving Time
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => {
                  haptic();
                  navigate("/instructor");
                }} className="min-h-[44px] px-8 py-3 bg-white/10 border border-white/30 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-white/20 active:scale-95 transition-all" style={{
                  touchAction: "manipulation"
                }}>
                    Try Lite for Free
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Inline keyframes */}
      <style dangerouslySetInnerHTML={{
      __html: `
          @keyframes glow-breathe {
            0%, 100% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(45,212,191,0.3); }
            50% { box-shadow: 0 0 50px rgba(139,92,246,0.8), 0 0 100px rgba(45,212,191,0.5); }
          }
          @keyframes text-glow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(139,92,246,0.6)) drop-shadow(0 0 16px rgba(45,212,191,0.4)); }
            50% { filter: drop-shadow(0 0 16px rgba(139,92,246,0.9)) drop-shadow(0 0 32px rgba(45,212,191,0.6)); }
          }
        `
    }} />
    </div>;
};
export default SavingsCalculator;