import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInstructorData } from '@/hooks/useInstructorData';
import { GlassCard } from '@/components/ui/GlassCard';
import PageAnalyticsSection from './PageAnalyticsSection';
import { Button } from '@/components/ui/button';
import {
  Crown,
  RefreshCw,
  TrendingUp,
  Shield,
  Ghost,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Shuffle,
  Factory,
  Truck,
  CheckCircle2,
  Volume2,
  ArrowLeft,
  Zap,
} from 'lucide-react';

const OwnerCommandCentre: React.FC = () => {
  const navigate = useNavigate();
  const { students, lessons } = useInstructorData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate live stats
  const liveStats = useMemo(() => {
    const totalStudents = students.length;
    const totalLessons = lessons.length;
    const activeStudents = students.filter(s => s.status === 'ACTIVE' || !s.status).length;
    const passedStudents = students.filter(s => s.status === 'PASSED').length;
    const totalHours = lessons.reduce((acc, l) => acc + (l.duration_minutes || 60) / 60, 0);
    const revenue = totalHours * 45; // £45/hour estimate
    
    // Value calculation (rough estimate based on data assets)
    const dataValue = totalLessons * 50; // Each lesson data point worth £50
    const studentValue = totalStudents * 200; // Each student relationship worth £200
    const estimatedValue = dataValue + studentValue;

    return {
      totalStudents,
      activeStudents,
      passedStudents,
      totalLessons,
      totalHours: totalHours.toFixed(1),
      revenue: revenue.toFixed(0),
      estimatedValue,
    };
  }, [students, lessons]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  // Partner targets
  const partners = [
    { name: 'Admiral Insurance', type: 'Insurance' },
    { name: 'Tesla UK', type: 'Auto Maker' },
    { name: 'Uber Safety Team', type: 'Gig Economy' },
  ];

  // Neural Board Agents
  const agents = [
    {
      id: 'strategist',
      icon: TrendingUp,
      emoji: '📊',
      name: 'The Strategist',
      color: 'bg-blue-500',
      message: `Start the engine! 🚗 You have ${liveStats.totalStudents} pupils but ${liveStats.totalLessons} lessons. Stop recruiting. Get those ${liveStats.activeStudents} driving NOW. Cash flow is truth. Action over planning. 🧼`,
    },
    {
      id: 'marketing',
      icon: Ghost,
      emoji: '👻',
      name: 'Marketing Ghost',
      color: 'bg-violet-500',
      message: 'Anxious teens with parents who pay bills 💳.',
    },
    {
      id: 'prophet',
      icon: Sparkles,
      emoji: '🔮',
      name: 'Tech Prophet',
      color: 'bg-purple-600',
      message: 'Voice-to-text grading. 🎙️ Speak the feedback, don\'t write it. Save time.',
    },
  ];

  // Industry pivot opportunities
  const pivotOpportunities = [
    {
      name: 'Delivery Driver Training 📦',
      subtitle: 'Training',
      quote: '"Amazon needs safe drivers fast."',
      potential: 'HIGH',
      icon: Factory,
    },
    {
      name: 'Corporate Fleet Safety 🚚',
      subtitle: 'Training',
      quote: '"Companies hate insurance claims."',
      potential: 'MEDIUM',
      icon: Truck,
    },
  ];

  // Unbeatable AI features
  const aiFeatures = [
    'Predictive Telemetry',
    'Psychology Mapping',
    'Cross-Industry PIVOT',
    'Partnership Playbook',
    'Exit Strategy',
  ];

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl border border-slate-200"
            onClick={() => navigate('/instructor')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-black tracking-tighter text-primary">CRUZI</span>
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl border border-slate-200">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Master Command Header */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Master Command</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
              EXECUTIVE OVERVIEW • DYSLEXIA FRIENDLY HUD
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
        >
          <RefreshCw className={`h-4 w-4 mr-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Analysing...' : 'Refresh Neural State'}
        </Button>

        {/* Project Live Worth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">
            PROJECT LIVE WORTH
          </p>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-2">
            £{liveStats.estimatedValue > 0 ? liveStats.estimatedValue.toLocaleString() : '0'} 
            <span className="text-2xl text-slate-400 ml-2">{liveStats.estimatedValue === 0 ? '(Pre-Revenue)' : ''}</span>
          </h2>
          <p className="text-xl font-black text-slate-400 italic mt-4">
            "No lessons = No value 📉. Prove the concept first."
          </p>
        </motion.div>

        {/* Partner Radar */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-4 w-4 text-rose-500" />
            <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em]">
              PARTNER RADAR
            </p>
          </div>
          <div className="space-y-3">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <span className="font-bold text-slate-900">{partner.name}</span>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest">
            Draft Partnership Proposal
          </Button>
        </div>

        {/* The Neural Board */}
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-2">
            THE NEURAL BOARD
          </p>
          <div className="space-y-4">
            {agents.map((agent, idx) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100"
              >
                <div className={`w-20 h-20 rounded-2xl ${agent.color} flex items-center justify-center text-4xl mb-4 shadow-lg`}>
                  {agent.emoji}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{agent.name}</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-4">{agent.message}</p>
                <div className="border-t border-slate-100 pt-4">
                  <button className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                    DEEP DIVE REASONING
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cruzi Unbeatable Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <h2 className="text-3xl font-black tracking-tight mb-6">
            Cruzi<br />Unbeatable<br />Features
          </h2>
          <div className="space-y-3">
            {aiFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <span className="font-bold text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Industry Pivot */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shuffle className="h-6 w-6 text-emerald-500" />
            <h2 className="text-3xl font-black text-slate-900 italic">Industry Pivot</h2>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-6">
            CROSS-SECTOR CODE REUSABILITY
          </p>
          <div className="space-y-4">
            {pivotOpportunities.map((opp) => (
              <div
                key={opp.name}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-start gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <opp.icon className="h-7 w-7 text-slate-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900">{opp.name}</h3>
                  <p className="text-slate-600 italic mb-2">{opp.quote}</p>
                  <p className={`text-xs font-black uppercase tracking-widest ${
                    opp.potential === 'HIGH' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    POTENTIAL: {opp.potential}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exit Velocity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-primary rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="inline-block bg-slate-700/50 px-4 py-2 rounded-xl mb-6">
              <p className="text-xs font-black uppercase tracking-widest">
                EXIT VELOCITY: <span className="text-emerald-400">HIGH</span>
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 italic">
              Your <span className="text-emerald-400">Future</span> is Built.
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              The AI Brain is managing the scale. Every lesson logged increases the value of your Data IP. 
              You are currently on track for a Series A exit in Year 3.
            </p>
          </div>
        </motion.div>

        {/* Page Analytics */}
        <PageAnalyticsSection />

        {/* Back to Dashboard */}
        <Button
          onClick={() => navigate('/instructor')}
          variant="outline"
          className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Instructor View
        </Button>
      </div>
    </div>
  );
};

export default OwnerCommandCentre;
