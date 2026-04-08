import React from "react";
import {
  Target,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { FadeInSection } from "./shared";

const statBlocks = [
  {
    value: "50%",
    label: "UK Pass Rate",
    sub: "That's a coin flip.",
    style: "text-muted-foreground",
    border: "border-border",
  },
  {
    value: "70%",
    label: "Engagement Increase",
    sub: "With structured practice plans.",
    style: "text-primary",
    border: "border-primary/30",
  },
  {
    value: "3×",
    label: "Parent Involvement",
    sub: "When progress is shared automatically.",
    style: "text-primary",
    border: "border-primary/30",
  },
];

const features = [
  {
    icon: Target,
    title: "Real Practice Plans",
    description:
      "Students get focused practice objectives between lessons — not vague 'just practise more' advice.",
  },
  {
    icon: Users,
    title: "Parent Progress Updates",
    description:
      "Parents see exactly what their teen is working on and where they need help. Engaged parents = faster learners.",
  },
  {
    icon: ClipboardCheck,
    title: "DVSA Skill Tracking",
    description:
      "Every lesson scored against the official 27-point syllabus. Students see their weak spots and know what to work on.",
  },
  {
    icon: BookOpen,
    title: "Study Hub",
    description:
      "Theory practice tied to their current driving skills, so revision actually connects to what they're doing on the road.",
  },
];

const StudentOutcomesSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-10 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeInSection>
          <div className="flex items-center justify-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-primary" />
            <p className="text-sm font-black uppercase tracking-[0.3em] text-secondary-foreground">
              Student Success
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit text-center mb-4">
            Your Students Deserve{" "}
            <span className="whitespace-nowrap">Better Than 50/50</span>
          </h2>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto text-center leading-relaxed font-medium mb-14 text-secondary-foreground">
            The UK driving test pass rate sits at just 50%. Cruzi helps you
            change those odds.
          </p>
        </FadeInSection>

        {/* Stat Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {statBlocks.map((stat, i) => (
            <FadeInSection key={stat.label} delay={0.1 * i}>
              <div
                className={`bg-card rounded-[2rem] border ${stat.border} shadow-xl p-6 sm:p-8 text-center`}
              >
                <p
                  className={`text-5xl sm:text-6xl font-black font-outfit tracking-tight mb-2 ${stat.style}`}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-secondary-foreground">{stat.sub}</p>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* How Cruzi Helps */}
        <FadeInSection>
          <div className="flex items-center justify-center gap-2 mb-8">
            <BarChart3 className="w-4 h-4 text-primary" />
            <p className="text-sm font-black uppercase tracking-[0.3em] text-secondary-foreground">
              How Cruzi Helps
            </p>
          </div>
        </FadeInSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <FadeInSection key={feat.title} delay={0.05 * i}>
              <div className="bg-card rounded-[2rem] border border-border shadow-xl p-6 sm:p-8 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <feat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-black mb-2">{feat.title}</h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudentOutcomesSection;
