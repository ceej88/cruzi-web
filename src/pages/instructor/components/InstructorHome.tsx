import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useInstructorData } from '@/hooks/useInstructorData';
import { useSubscription } from '@/hooks/useSubscription';
import { CruziNotification } from '@/types';
import TierLimitBanner from '@/components/subscription/TierLimitBanner';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import { Wallet, Users, CalendarCheck, Trophy, CalendarPlus, ClipboardCheck, Rocket, BookOpen, MessageCircle, Zap, Calendar, Loader2, MessageSquare, Navigation, Play } from 'lucide-react';
interface InstructorHomeProps {
  onRunPulse?: () => void;
  isPulseLoading?: boolean;
  onNavigate?: (tab: string) => void;
  onWatchVision?: () => void;
  localInsights: CruziNotification[];
}

// Command capsule configuration
// Cruzi Neural Gradient: Violet (#8b5cf6) → Cyan (#00BFFF) → Teal (#2dd4bf)
const COMMAND_CAPSULES = [{
  id: 'diary',
  label: 'DIARY',
  sublabel: 'NODE',
  icon: CalendarPlus,
  color: 'text-cruzi-indigo',
  glow: 'bg-cruzi-indigo/30'
}, {
  id: 'nav-command',
  label: 'NAV',
  sublabel: 'NOW',
  icon: Navigation,
  color: 'text-cruzi-cyan',
  glow: 'bg-cruzi-cyan/30'
}, {
  id: 'pupils',
  label: 'PUPILS',
  sublabel: 'ROSTER',
  icon: Users,
  color: 'text-neural-end',
  glow: 'bg-neural-end/30'
}, {
  id: 'mock-test',
  label: 'MOCK',
  sublabel: 'AUDIT',
  icon: ClipboardCheck,
  color: 'text-cruzi-indigo',
  glow: 'bg-cruzi-indigo/30'
}, {
  id: 'sms-hub',
  label: 'SMS',
  sublabel: 'HUB',
  icon: MessageSquare,
  color: 'text-cruzi-cyan',
  glow: 'bg-cruzi-cyan/30'
}, {
  id: 'growth-lab',
  label: 'GROWTH',
  sublabel: 'LAB',
  icon: Rocket,
  color: 'text-neural-end',
  glow: 'bg-neural-end/30'
}, {
  id: 'teaching-vault',
  label: 'TEACHING',
  sublabel: 'VAULT',
  icon: BookOpen,
  color: 'text-cruzi-indigo',
  glow: 'bg-cruzi-indigo/30'
}, {
  id: 'messages',
  label: 'MESSAGES',
  sublabel: 'HUB',
  icon: MessageCircle,
  color: 'text-cruzi-cyan',
  glow: 'bg-cruzi-cyan/30'
}];

// Animation variants for staggered entrance
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const
    }
  }
};
const InstructorHome: React.FC<InstructorHomeProps> = ({
  onRunPulse,
  isPulseLoading,
  onNavigate,
  onWatchVision,
  localInsights
}) => {
  const {
    students,
    lessons,
    templates,
    isLoading
  } = useInstructorData();
  const {
    isLiteTier,
    studentCount,
    studentLimit
  } = useSubscription();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const sortedLessons = useMemo(() => {
    return [...lessons].filter(l => new Date(l.scheduled_at) >= new Date() && l.status === 'SCHEDULED').sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).slice(0, 3);
  }, [lessons]);
  const financialStats = useMemo(() => {
    const scheduled = lessons.filter(l => l.status === 'SCHEDULED');
    const weeklyRevenue = scheduled.length * 2 * 45;
    return {
      weeklyRevenue
    };
  }, [lessons]);
  const stats = [{
    label: 'Forecast Revenue',
    value: `£${financialStats.weeklyRevenue}`,
    icon: Wallet
  }, {
    label: 'Active Students',
    value: isLiteTier ? `${studentCount}/${studentLimit}` : students.length,
    icon: Users
  }, {
    label: 'Diary Health',
    value: 'High',
    icon: CalendarCheck
  }, {
    label: 'Pass Rate',
    value: '84%',
    icon: Trophy
  }];
  const getStudentForLesson = (studentId: string) => {
    return students.find(s => s.user_id === studentId);
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>;
  }
  return <div className="min-h-screen w-full max-w-full overflow-x-hidden relative flex flex-col items-center selection:bg-indigo-500/30">
      {/* Atmospheric layers are rendered by parent InstructorDashboard.tsx */}

      <motion.div className="w-full max-w-full overflow-hidden px-4 sm:px-10 md:px-20 pt-12 md:pt-24 space-y-20 md:space-y-32 relative z-10 pb-40" variants={containerVariants} initial="hidden" animate="visible">
        {/* HEADER SECTION: NEURAL CINEMATIC TYPOGRAPHY */}
        <motion.div className="flex flex-col items-center gap-8 md:gap-12" variants={itemVariants}>
          <div className="space-y-6 md:space-y-8 text-center">
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black tracking-[-0.06em] leading-[0.85] select-none uppercase relative">
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#2DD4BF] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]" style={{
              animation: 'text-glow 3s ease-in-out infinite',
              filter: 'drop-shadow(0 0 40px rgba(139,92,246,0.4)) drop-shadow(0 0 80px rgba(45,212,191,0.3))'
            }}>
                Command Hub
              </span>
              <span className="text-[#2DD4BF] drop-shadow-[0_0_20px_rgba(45,212,191,0.6)]">.</span>
            </h1>
          </div>

          <div className="flex items-center bg-card/60 backdrop-blur-3xl p-2 md:p-3 rounded-[2rem] md:rounded-[3rem] border border-border shadow-2xl">
            <button onClick={() => onNavigate?.('core-skills')} className="px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-[1.5rem] md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl border border-white/10 whitespace-nowrap">
              Core Skills
            </button>
            <button onClick={() => onNavigate?.('neural-scribe')} className="relative px-8 md:px-12 py-4 md:py-5 font-black text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] group/voice whitespace-nowrap">
              <span className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#2DD4BF] opacity-80 group-hover/voice:opacity-100 transition-opacity" />
              <span className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#2DD4BF] blur-lg opacity-0 group-hover/voice:opacity-60 transition-opacity" />
              <span className="relative text-white">Voice Lessons</span>
            </button>
          </div>
        </motion.div>

        {/* QUICK ACTIONS: UNCLIPPED KINETIC CAPSULES */}
        <motion.section className="space-y-12 md:space-y-20" variants={itemVariants}>
          <div className="flex items-center gap-6 md:gap-10">
            <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.8em] md:tracking-[1.2em] whitespace-nowrap text-secondary-foreground">
              Quick Actions
            </h2>
            <div className="h-px bg-border flex-1" />
          </div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 md:gap-10 lg:gap-14" variants={containerVariants}>
            {COMMAND_CAPSULES.map((item, idx) => <motion.div key={item.id} className="relative group" variants={itemVariants}>
                {/* SIBLING GLOW: Not clipped by button's rounded edges */}
                <div className={`absolute -inset-8 ${item.glow} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-125 pointer-events-none`} />
                
                <button onClick={() => onNavigate?.(item.id)} className="w-full relative z-20 flex flex-col items-center gap-6 md:gap-12 pt-8 md:pt-14 pb-10 md:pb-16 bg-card/30 backdrop-blur-3xl border border-border rounded-[3rem] md:rounded-[6rem] transition-all duration-700 active:scale-90 group-hover:bg-card/60 group-hover:border-primary/20 shadow-2xl">
                  <div className="relative">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2.5rem] bg-card/50 border border-border flex items-center justify-center text-2xl md:text-4xl transition-all duration-700 group-hover:scale-125 group-hover:rotate-[8deg] group-hover:shadow-indigo-500/20 group-hover:bg-foreground group-hover:text-background">
                      <item.icon className={`h-6 w-6 md:h-8 md:w-8 transition-colors duration-700 ${item.color} group-hover:text-background`} />
                    </div>
                  </div>
                  <div className="text-center space-y-2 md:space-y-3">
                    <p className="text-foreground font-black text-lg md:text-2xl lg:text-3xl tracking-tighter leading-[0.8] transition-colors group-hover:text-foreground uppercase">
                      {item.label}<br />
                      <span className="opacity-20 font-black text-xs md:text-base">{item.sublabel}</span>
                    </p>
                    <div className="w-1.5 h-1.5 bg-border rounded-full mx-auto group-hover:w-12 md:group-hover:w-20 group-hover:bg-cruzi-indigo transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" />
                  </div>
                </button>
              </motion.div>)}
          </motion.div>
        </motion.section>

        {/* Tier Limit Banner */}
        {isLiteTier && <motion.div variants={itemVariants}>
            <TierLimitBanner onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
          </motion.div>}

        {/* PRIMARY PRESTIGE PANELS */}
        <motion.div className="pt-8 md:pt-20" variants={itemVariants}>
          {/* Vision Film Card */}
          <div onClick={onWatchVision} className="bg-primary rounded-[3rem] md:rounded-[6rem] p-12 md:p-24 text-primary-foreground relative overflow-hidden group cursor-pointer hover:shadow-[0_100px_150px_-30px_hsl(var(--primary)/0.4)] transition-all duration-1000 border-[8px] md:border-[16px] border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-700 to-indigo-950" />
            <div className="absolute top-0 right-0 w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-white opacity-5 blur-[180px] rounded-full -mr-32 md:-mr-64 -mt-32 md:-mt-64 group-hover:scale-150 transition-transform duration-[5000ms]" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20 h-full">
              <div className="space-y-8 md:space-y-12 flex-1">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
                  </div>
                  <p className="text-indigo-200 font-black text-[10px] md:text-[11px] uppercase tracking-[0.5em] md:tracking-[1em]">
                    Platform Tour
                  </p>
                </div>
                <h4 className="text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black tracking-[-0.08em] leading-[0.8] italic uppercase">
                  See Cruzi<br />In Action.
                </h4>
                <p className="text-indigo-100/50 font-medium text-base md:text-xl max-w-md leading-relaxed">
                  Watch a quick tour of your command hub and discover how Cruzi streamlines your teaching.
                </p>
              </div>

              <div className="w-32 h-32 md:w-56 md:h-56 bg-white text-primary rounded-full flex items-center justify-center text-4xl md:text-7xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shrink-0 border-[8px] md:border-[16px] border-indigo-500/50">
                <Play className="h-10 w-10 md:h-16 md:w-16 ml-2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* On The Roadmap - Coming Soon Features */}
        <motion.div className="space-y-8 md:space-y-12" variants={itemVariants}>
          <div className="flex items-center gap-6 md:gap-10">
            <h2 className="font-black uppercase whitespace-nowrap flex items-center gap-4">
              <span className="relative">
                <Rocket className="h-5 w-5 md:h-6 md:w-6 text-cruzi-indigo" />
                <span className="absolute inset-0 bg-cruzi-indigo/40 blur-lg rounded-full" />
              </span>
              <span className="text-lg md:text-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#2DD4BF] bg-clip-text text-transparent tracking-tight">
                Coming Soon
              </span>
            </h2>
            <div className="h-px bg-gradient-to-r from-cruzi-indigo/50 via-cruzi-cyan/30 to-transparent flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            {/* THE SYNAPSE CARD */}
            <motion.div className="group relative" whileHover={{
            scale: 1.02
          }} transition={{
            duration: 0.4
          }}>
              {/* Animated gradient border glow */}
              <div className="absolute -inset-[2px] rounded-[3rem] md:rounded-[4rem] bg-gradient-to-br from-cruzi-indigo via-purple-500 to-cruzi-cyan opacity-60 blur-sm group-hover:opacity-100 group-hover:blur-0 transition-all duration-700" style={{
              animation: 'glow-breathe 4s ease-in-out infinite'
            }} />
              
              {/* Card content */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 overflow-hidden">
                {/* Background auras */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cruzi-indigo/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cruzi-cyan/10 rounded-full blur-[80px]" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    {/* Glowing icon */}
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cruzi-indigo to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-all duration-700">
                        <Zap className="h-7 w-7 md:h-9 md:w-9 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-cruzi-indigo/50 rounded-2xl md:rounded-3xl blur-xl opacity-50" />
                    </div>
                    
                    {/* Coming Soon badge */}
                    <span className="px-4 py-2 bg-gradient-to-r from-cruzi-indigo/20 to-cruzi-cyan/20 backdrop-blur-xl border border-cruzi-indigo/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-cruzi-cyan" style={{
                    animation: 'glow-breathe 3s ease-in-out infinite'
                  }}>
                      Coming Soon
                    </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 italic">
                    The Synapse
                  </h3>
                  <p className="text-[10px] md:text-[11px] font-black text-cruzi-indigo uppercase tracking-[0.3em] mb-6">
                    Smart Homework
                  </p>
                  
                  <p className="text-sm md:text-base text-white leading-relaxed mb-8 font-medium">
                    Spot a weak point during a lesson? Tap it once. Cruzi sends your student a practice quiz on that exact topic before the next lesson. They revise the theory at home—you spend lesson time driving, not explaining.
                  </p>
                  
                  <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                    <div className="w-2 h-2 bg-cruzi-cyan rounded-full animate-pulse" />
                    <p className="text-sm font-black text-white italic">
                      Less repeating yourself. More road time.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* VISION REEL CARD */}
            <motion.div className="group relative" whileHover={{
            scale: 1.02
          }} transition={{
            duration: 0.4
          }}>
              {/* Animated gradient border glow */}
              <div className="absolute -inset-[2px] rounded-[3rem] md:rounded-[4rem] bg-gradient-to-br from-cruzi-cyan via-teal-400 to-emerald-500 opacity-60 blur-sm group-hover:opacity-100 group-hover:blur-0 transition-all duration-700" style={{
              animation: 'glow-breathe 4s ease-in-out infinite',
              animationDelay: '2s'
            }} />
              
              {/* Card content */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 overflow-hidden">
                {/* Background auras */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cruzi-cyan/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    {/* Glowing icon */}
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cruzi-cyan to-teal-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.4)] group-hover:shadow-[0_0_60px_rgba(45,212,191,0.6)] transition-all duration-700">
                        <Play className="h-7 w-7 md:h-9 md:w-9 text-white ml-1" />
                      </div>
                      <div className="absolute inset-0 bg-cruzi-cyan/50 rounded-2xl md:rounded-3xl blur-xl opacity-50" />
                    </div>
                    
                    {/* Coming Soon badge */}
                    <span className="px-4 py-2 bg-gradient-to-r from-cruzi-cyan/20 to-emerald-500/20 backdrop-blur-xl border border-cruzi-cyan/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-cruzi-cyan" style={{
                    animation: 'glow-breathe 3s ease-in-out infinite'
                  }}>
                      Coming Soon
                    </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 italic">
                    Vision Reel
                  </h3>
                  <p className="text-[10px] md:text-[11px] font-black text-cruzi-cyan uppercase tracking-[0.3em] mb-6">
                    Social Content Creator
                  </p>
                  
                  <p className="text-sm md:text-base text-white leading-relaxed mb-8 font-medium">
                    Sync your dashcam. Cruzi finds the best moments, adds eye-tracking overlays and 'ghost car' guides, then writes scroll-stopping captions. One tap posts to TikTok or Instagram.
                  </p>
                  
                  <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-sm font-black text-white italic">
                      Your passes become proof. Marketing made easy.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} reason="Unlock unlimited students and features." />
    </div>;
};
export default InstructorHome;