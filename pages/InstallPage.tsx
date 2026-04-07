import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Share, MoreVertical, Download, ArrowLeft, Wifi, Rocket, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const InstallPage: React.FC = () => {
  const { platform, installApp, isInstalled } = usePWAInstall();
  
  // Get the current URL for QR code
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleInstall = async () => {
    if (navigator.vibrate) navigator.vibrate(20);
    await installApp();
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-3xl flex items-center justify-center shadow-2xl mb-6">
          <Zap size={40} fill="white" className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tight text-foreground mb-3">
          Already Installed!
        </h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Cruzi is already on your home screen. Open it from there for the best experience.
        </p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={18} />
            Back to App
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap size={16} fill="white" className="text-primary-foreground" />
            </div>
            <span className="font-black italic text-lg tracking-tight text-foreground">Cruzi</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
            <Zap size={48} fill="white" className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tight text-foreground mb-3">
              Install Cruzi
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Get the full native app experience — faster, smoother, and always accessible.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="grid gap-4">
          {[
            { 
              icon: Rocket, 
              title: 'Lightning Fast', 
              desc: 'Cached assets load instantly, even on slow connections' 
            },
            { 
              icon: Wifi, 
              title: 'Works Offline', 
              desc: 'Access your data and continue working without internet' 
            },
            { 
              icon: Smartphone, 
              title: 'Native Feel', 
              desc: 'Full-screen experience without browser chrome' 
            },
          ].map((benefit, i) => (
            <div 
              key={i}
              className="bg-muted/30 rounded-3xl p-6 border border-border/50 flex items-start gap-5"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <benefit.icon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Platform-specific instructions */}
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-center text-foreground">
            How to Install
          </h2>

          {/* iOS Instructions */}
          <div className="bg-muted/30 rounded-3xl p-6 border border-border/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <span className="text-xl">🍎</span>
              </div>
              <h3 className="font-bold text-foreground">iPhone & iPad</h3>
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">1</span>
                <span>Open this page in <strong className="text-foreground">Safari</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">2</span>
                <span className="flex items-center gap-1.5">
                  Tap the <Share size={16} className="text-primary" /> Share button
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">3</span>
                <span>Scroll and tap <strong className="text-foreground">"Add to Home Screen"</strong></span>
              </li>
            </ol>
          </div>

          {/* Android Instructions */}
          <div className="bg-muted/30 rounded-3xl p-6 border border-border/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <h3 className="font-bold text-foreground">Android</h3>
            </div>
            
            {platform === 'android' && (
              <Button 
                onClick={handleInstall}
                className="w-full h-14 text-base font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg mb-4"
              >
                <Download size={20} className="mr-2" />
                Install Now
              </Button>
            )}
            
            <p className="text-sm text-muted-foreground">
              Or manually:
            </p>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">1</span>
                <span className="flex items-center gap-1.5">
                  Tap the <MoreVertical size={16} className="text-primary" /> menu button
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">2</span>
                <span>Select <strong className="text-foreground">"Install App"</strong> or <strong className="text-foreground">"Add to Home Screen"</strong></span>
              </li>
            </ol>
          </div>
        </section>

        {/* QR Code for sharing */}
        <section className="text-center space-y-4">
          <h2 className="text-lg font-bold text-muted-foreground">
            Share with your students
          </h2>
          <div className="inline-block bg-white p-6 rounded-3xl shadow-lg">
            <QRCodeSVG 
              value={appUrl} 
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan to open Cruzi on another device
          </p>
        </section>
      </main>
    </div>
  );
};

export default InstallPage;
