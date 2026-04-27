import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, KeyRound } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [inviteStep, setInviteStep] = useState<'none' | 'question' | 'input'>('none');
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/instructor';

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: sentToEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) toast.error(error.message);
      else { toast.success("Email resent"); startResendCooldown(); }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message.includes("Invalid login") ? "Invalid email or password" : error.message);
        } else {
          toast.success("Welcome back!");
          navigate(redirectTo, { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, "instructor");
        if (error) {
          toast.error(error.message.includes("already registered") ? "This email is already registered. Try signing in." : error.message);
        } else {
          setSentToEmail(email);
          setInviteStep('question');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const advanceToCheckEmail = () => {
    setInviteStep('none');
    setShowEmailSent(true);
    startResendCooldown();
  };

  const handleInviteSkip = () => {
    localStorage.removeItem('pending_instructor_code');
    advanceToCheckEmail();
  };

  const handleInviteConnect = () => {
    const cleaned = inviteCode.replace(/\s+/g, '').toUpperCase();
    if (cleaned.length !== 8) {
      setInviteError('Enter the 8-character code your student sent you.');
      return;
    }
    localStorage.setItem('pending_instructor_code', cleaned);
    advanceToCheckEmail();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-outfit neural-gradient-text mb-2">Cruzi</h1>
        <p className="text-black">Instructor sign in</p>
      </div>

      <GlassCard className="w-full max-w-md" padding="lg">
        {inviteStep === 'question' ? (
          <div className="flex flex-col items-center text-center gap-6 py-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-outfit">Account created</h2>
              <p className="text-muted-foreground text-sm">
                Has a student sent you an invite code?
              </p>
            </div>
            <button
              onClick={() => setInviteStep('input')}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold transition-all hover:bg-primary/90"
            >
              Yes, I have a code
            </button>
            <button
              onClick={handleInviteSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              No, not yet — continue
            </button>
          </div>
        ) : inviteStep === 'input' ? (
          <div className="flex flex-col items-center text-center gap-5 py-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-outfit">Enter your invite code</h2>
              <p className="text-muted-foreground text-sm">
                Type the 8-character code from your student
                <br />(for example, AK9MA65Q)
              </p>
            </div>
            <Input
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.replace(/\s+/g, '').toUpperCase());
                if (inviteError) setInviteError('');
              }}
              maxLength={8}
              placeholder="AK9MA65Q"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="text-center tracking-[0.4em] font-mono text-xl uppercase"
            />
            {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
            <button
              onClick={handleInviteConnect}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold transition-all hover:bg-primary/90"
            >
              Connect
            </button>
            <button
              onClick={handleInviteSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </div>
        ) : showEmailSent ? (
          <div className="flex flex-col items-center text-center gap-6 py-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-outfit">Check your inbox</h2>
              <p className="text-muted-foreground text-sm">We have sent a verification link to</p>
              <p className="font-semibold text-foreground break-all">{sentToEmail}</p>
            </div>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 transition-all hover:bg-primary/90"
            >
              {isLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
            </button>
            <button
              onClick={() => setShowEmailSent(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Wrong email? Go back
            </button>
          </div>
        ) : (
          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="signup" className="mt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Create your instructor account. Students sign up via the Cruzi mobile app.
                </p>
              </TabsContent>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <GradientButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </GradientButton>

                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            </form>
          </Tabs>
        )}
      </GlassCard>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default AuthPage;
