import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, ClipboardCheck } from 'lucide-react';

const InstallPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-violet-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-black text-lg tracking-tight text-foreground">Cruzi</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <section className="text-center space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-violet-400 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
            <span className="text-white font-black text-4xl">C</span>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
              Get Cruzi
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The UK's smartest driving app
            </p>
          </div>
        </section>

        <section className="grid gap-4">
          {[
            {
              icon: ClipboardCheck,
              title: 'Track your progress',
              desc: 'See your skill scores on every DVSA topic after every lesson',
            },
            {
              icon: Users,
              title: 'Practice with parents',
              desc: 'Co-Pilot mode guides supervised practice sessions at home',
            },
            {
              icon: MapPin,
              title: 'Prepare for your test',
              desc: 'Pass Zone, mock tests, and local hazard spots near your test centre',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-muted/30 rounded-3xl p-6 border border-border/50 flex items-start gap-5"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <item.icon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4 text-center">
          <a
            href="https://apps.apple.com/gb/app/cruzi/id6759689036"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-zinc-800 active:scale-95 transition-all shadow-lg w-full max-w-xs justify-center mx-auto"
            style={{ touchAction: 'manipulation' }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white shrink-0">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-75 leading-none mb-0.5">Download on the</div>
              <div className="text-lg font-black leading-none">App Store</div>
            </div>
          </a>

          <p className="text-xs text-muted-foreground">
            Free to download. Your instructor will give you a PIN to connect.
          </p>
        </section>
      </main>
    </div>
  );
};

export default InstallPage;
