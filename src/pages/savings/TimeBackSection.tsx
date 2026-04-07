import React from "react";
import { Heart, TrendingUp, Battery } from "lucide-react";
import { FadeInSection, useAnimatedCounter } from "./shared";

interface TimeBackSectionProps {
  hoursPerWeek: number;
  hoursPerYear: number;
}

const TimeBackSection: React.FC<TimeBackSectionProps> = ({
  hoursPerWeek,
  hoursPerYear,
}) => {
  const animWeek = useAnimatedCounter(hoursPerWeek);
  const animYear = useAnimatedCounter(hoursPerYear);

  const cards = [
    {
      icon: Heart,
      title: "Family Time",
      description: `Spend ${animWeek.toFixed(1)} extra hours a week with your family instead of chasing texts and updating spreadsheets.`,
      accent: "text-rose-500",
      accentBg: "bg-rose-500/10",
    },
    {
      icon: TrendingUp,
      title: "Business Growth",
      description: `Use that time to take on more students, market your services, or finally build that website.`,
      accent: "text-primary",
      accentBg: "bg-primary/10",
    },
    {
      icon: Battery,
      title: "Your Wellbeing",
      description: `Or just… breathe. Less burnout. More energy for the lessons that matter.`,
      accent: "text-teal-500",
      accentBg: "bg-teal-500/10",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-10">
      <div className="max-w-4xl mx-auto">
        <FadeInSection>
          <p className="text-sm font-black uppercase tracking-[0.3em] mb-3 text-center text-secondary-foreground">
            Beyond The Numbers
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit text-center mb-4">
            It's Not Just About Money
          </h2>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto text-center leading-relaxed font-medium mb-14 text-secondary-foreground">
            Those{" "}
            <span className="font-black text-foreground">
              {animWeek.toFixed(1)} hours a week
            </span>{" "}
            — that's{" "}
            <span className="font-black text-foreground">
              {Math.round(animYear)} hours a year
            </span>{" "}
            you're not getting back.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <FadeInSection key={card.title} delay={0.1 * i}>
              <div className="bg-card rounded-[2rem] border border-border shadow-xl p-6 sm:p-8 h-full flex flex-col">
                <div
                  className={`w-12 h-12 ${card.accentBg} rounded-2xl flex items-center justify-center mb-5`}
                >
                  <card.icon className={`w-6 h-6 ${card.accent}`} />
                </div>
                <h3 className="text-lg font-black mb-3">{card.title}</h3>
                <p className="text-foreground text-sm leading-relaxed flex-1">
                  {card.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimeBackSection;
