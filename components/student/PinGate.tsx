import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PinGateProps {
  pupilName: string;
  onVerify: (pin: string) => Promise<boolean>;
}

const PinGate: React.FC<PinGateProps> = ({ pupilName, onVerify }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const newPin = [...pin];
    newPin[idx] = val.slice(-1);
    setPin(newPin);
    setError(false);

    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newPin = pastedData.split('');
      setPin(newPin);
      inputRefs.current[5]?.focus();
    }
  };

  useEffect(() => {
    if (pin.every(digit => digit !== '')) {
      verifyPin();
    }
  }, [pin]);

  const verifyPin = async () => {
    setIsVerifying(true);
    const enteredPin = pin.join('');
    
    // Slight delay for premium feel
    await new Promise(r => setTimeout(r, 600));
    
    const isValid = await onVerify(enteredPin);
    
    if (!isValid) {
      setError(true);
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setIsVerifying(false);
  };

  const firstName = pupilName.split(' ')[0] || 'Student';

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-background via-card to-background flex items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cruzi-indigo/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-500">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-6 border border-primary/20">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter mb-2">
            Identity Verification
          </h1>
          <p className="text-muted-foreground text-sm">
            Hello, <span className="text-primary font-bold">{firstName}</span>. Enter the 6-digit access PIN sent to your mobile.
          </p>
        </div>

        {/* PIN Input Grid */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
          <div 
            className="flex justify-center gap-2 md:gap-3"
            onPaste={handlePaste}
          >
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                className={`w-11 h-14 md:w-12 md:h-16 bg-muted border-2 rounded-xl text-center text-2xl font-black text-foreground transition-all outline-none ${
                  error 
                    ? 'border-destructive animate-shake' 
                    : 'border-border focus:border-primary focus:bg-primary/5 focus:shadow-lg focus:shadow-primary/20'
                }`}
                disabled={isVerifying}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 mt-4 text-destructive animate-in slide-in-from-bottom-2">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-bold">Incorrect PIN. Access Denied.</p>
            </div>
          )}

          {/* Verifying State */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-3 mt-6 text-primary animate-in fade-in">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-bold uppercase tracking-widest">Verifying...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="h-3 w-3" />
            Secure End-to-End Encryption
          </p>
          <p className="text-[9px] text-muted-foreground/60">
            Student Gateway v2.4
          </p>
        </div>
      </div>

      {/* Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default PinGate;
