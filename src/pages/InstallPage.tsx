import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react';

const CRUZI_APP_SCHEME = 'cruzi://';
const APP_STORE_URL = 'https://apps.apple.com/gb/app/cruzi/id6759689036';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cruzi.app';

const InstallPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const payment = searchParams.get('payment');

  if (payment === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">C</span>
              </div>
              <span className="font-black text-lg tracking-tight text-foreground">Cruzi</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">Payment successful</h1>
              <p className="text-lg text-muted-foreground">Your lesson hours have been added to your account. Return to the Cruzi app to see your balance.</p>
            </div>
            <a
              href={CRUZI_APP_SCHEME}
              className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-primary text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-lg"
              style={{ touchAction: 'manipulation' }}
            >
              Return to Cruzi app
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (payment === 'cancelled') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">C</span>
              </div>
              <span className="font-black text-lg tracking-tight text-foreground">Cruzi</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
              <XCircle size={48} className="text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">Payment cancelled</h1>
              <p className="text-lg text-muted-foreground">No payment was taken. Return to the Cruzi app to try again.</p>
            </div>
            <a
              href={CRUZI_APP_SCHEME}
              className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-primary text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-lg"
              style={{ touchAction: 'manipulation' }}
            >
              Return to Cruzi app
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-black text-lg tracking-tight text-foreground">Cruzi</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <section className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
            <span className="text-white font-black text-4xl">C</span>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
              Account confirmed!
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Download the Cruzi app to complete your setup and start learning.
            </p>
          </div>
        </section>

        <section className="bg-muted/30 rounded-3xl p-6 border border-border/50 space-y-4">
          <h2 className="font-black text-foreground text-lg">What to do next</h2>
          {[
            { step: '1', text: 'Download Cruzi using the button below' },
            { step: '2', text: 'Open the app and log in with your email and password' },
            { step: '3', text: 'Complete your profile — takes about 2 minutes' },
            { step: '4', text: 'Wait for your instructor to approve your account' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white font-black text-sm">{item.step}</span>
              </div>
              <p className="text-foreground font-medium pt-1">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4 flex flex-col items-center">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-zinc-800 active:scale-95 transition-all shadow-lg w-full max-w-xs justify-center"
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

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-zinc-800 active:scale-95 transition-all shadow-lg w-full max-w-xs justify-center"
            style={{ touchAction: 'manipulation' }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white shrink-0">
              <path d="M3.18 23.76c.3.17.64.24.99.2l12.7-12.7L13.41 8l-10.23 15c-.01.01-.01.02-.02.03.01.27.1.55.29.75.32.33.73.02 1.73-.02zm17.85-10.66c.26-.23.4-.55.4-.89s-.14-.66-.4-.89l-2.18-1.25L15.96 13l2.89 2.89 2.18-1.25v.46zM2 1.08L14.69 13.8 11.19 17.3 2.62 2.47C2.26 1.7 2.3.77 2.83.25A.8.8 0 0 1 2 1.08zm11.71 11.03L2 24c.09.04.18.07.27.07.34 0 .67-.16.9-.44l11.95-11.96-1.41-1.56z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-75 leading-none mb-0.5">Get it on</div>
              <div className="text-lg font-black leading-none">Google Play</div>
            </div>
          </a>
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
      </main>
    </div>
  );
};

export default InstallPage;
