import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePublicPage } from '@/hooks/usePublicPage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Car, Bot, BookOpen, ListChecks, LineChart, Compass,
  MapPin, CheckCircle2, ArrowRight, Sparkles,
} from 'lucide-react';

/**
 * Chester learner waitlist page (PR2).
 *
 * Scope: UI only. No Stripe, no account creation, no backend write.
 * Submit is a local mock that transitions to the "joined" state.
 * Practice Pass card is visible but disabled ("Coming soon").
 *
 * Backend wiring lands in later PRs (PR3 prefill signup, PR4 Stripe).
 */

const waitlistSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Please enter a valid email address'),
});

type WaitlistValues = z.infer<typeof waitlistSchema>;

const HIDDEN_CITY = 'chester';
const HIDDEN_SOURCE = 'chester_landing';

const FEATURES: Array<{ icon: React.ComponentType<{ className?: string }>; title: string; desc: string }> = [
  { icon: Car,        title: 'Private practice support', desc: 'Structured sessions you can run with a parent or supervising driver — no guesswork about what to do next.' },
  { icon: Bot,        title: 'AI Driving Co-Pilot',      desc: 'Get instant, plain-English feedback after each practice drive so you know exactly what to work on.' },
  { icon: BookOpen,   title: 'Theory prep',              desc: 'Bite-sized DVSA theory questions, hazard perception drills and revision tracking, built for short sessions.' },
  { icon: ListChecks, title: 'Show Me Tell Me',          desc: 'Master all 14 vehicle safety questions with simple answers and quick checks before test day.' },
  { icon: LineChart,  title: 'Progress tracking',        desc: 'Watch your skills, mock-test scores and readiness improve session by session.' },
  { icon: Compass,    title: 'Chester local guidance',   desc: 'Practice ideas suited to the roads, junctions and conditions you’ll actually drive on around Chester.' },
];

const PLACES = ['Chester', 'Ellesmere Port', 'Wrexham', 'Northwich', 'Surrounding areas'];

const ChesterLearnerPage: React.FC = () => {
  usePublicPage();
  useDocumentTitle('Pass faster with smart driving practice — Chester | Cruzi');

  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [joinedFirstName, setJoinedFirstName] = useState('');

  const form = useForm<WaitlistValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const onSubmit = (values: WaitlistValues) => {
    // PR2: local mock only. Nothing is sent to a backend.
    // Hidden context that would be submitted once wired:
    //   city: HIDDEN_CITY, source: HIDDEN_SOURCE
    void HIDDEN_CITY; void HIDDEN_SOURCE;
    setJoinedFirstName(values.fullName.trim().split(/\s+/)[0] ?? '');
    setJoined(true);
    requestAnimationFrame(() => {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-background text-foreground font-inter min-h-screen">
      <LandingNavbar />

      {/* 1. HERO */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 -top-32 -z-10 opacity-60 blur-3xl pointer-events-none">
          <div className="mx-auto h-[420px] max-w-[820px] rounded-full bg-gradient-to-tr from-primary/15 via-primary-container/15 to-transparent" />
        </div>
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-pill bg-accent text-accent-foreground px-4 py-1.5 text-label-sm font-semibold mb-8"
            data-testid="badge-hero-eyebrow"
          >
            <Sparkles className="h-3.5 w-3.5" /> Chester — opening soon
          </span>
          <h1
            className="text-[36px] leading-[1.1] sm:text-headline-lg lg:text-headline-display font-bold tracking-tight text-foreground"
            data-testid="text-hero-headline"
          >
            Pass Faster With Smart Driving Practice
          </h1>
          <p className="mt-6 text-body-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subheading">
            Practise with parents, track your progress, and prepare for your test while you wait for local instructor availability in Chester.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={scrollToWaitlist}
              data-testid="button-hero-join-waitlist"
              className="rounded-chip shadow-purple-glow hover:shadow-purple-glow-hover transition-shadow"
            >
              Join Chester Waiting List <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/download')}
              data-testid="button-hero-download"
              className="rounded-chip"
            >
              Download Cruzi
            </Button>
          </div>
        </div>
      </section>

      {/* 2. PRACTICE GAP */}
      <section className="py-16 sm:py-20 border-t border-border/60">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-headline-lg-mobile sm:text-headline-lg font-bold" data-testid="text-gap-headline">
            The 22-hour practice gap
          </h2>
          <p className="mt-6 text-body-lg text-muted-foreground">
            The DVSA recommends around{' '}
            <strong className="text-foreground">22 hours of private practice</strong>{' '}
            alongside professional lessons. Most learners never know what to practise, how to track it, or how to make the time count.
          </p>
          <p className="mt-4 text-body-md text-muted-foreground">
            Cruzi turns private practice into something structured and useful — so the hours behind the wheel with a parent or supervising driver actually move you closer to test day.
          </p>
        </div>
      </section>

      {/* 3. WHAT LEARNERS GET */}
      <section className="py-16 sm:py-24 bg-surface-container-low">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-headline-lg-mobile sm:text-headline-lg font-bold" data-testid="text-features-headline">
              What you get with Cruzi
            </h2>
            <p className="mt-4 text-body-md text-muted-foreground">
              Everything you need to learn smarter between lessons — and arrive at test day actually ready.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => {
              const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              return (
                <Card
                  key={title}
                  className="rounded-card border-border/70 shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`card-feature-${slug}`}
                >
                  <CardContent className="p-card-pad">
                    <div className="h-11 w-11 rounded-chip bg-accent text-primary-container flex items-center justify-center mb-5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-headline-md font-semibold" data-testid={`text-feature-title-${slug}`}>
                      {title}
                    </h3>
                    <p className="mt-2 text-body-md text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PRACTICE WITH PARENTS */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-6 max-w-5xl grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <h2 className="text-headline-lg-mobile sm:text-headline-lg font-bold" data-testid="text-parents-headline">
              Practise with parents, properly
            </h2>
            <p className="mt-5 text-body-md text-muted-foreground">
              Most parents want to help — they just don’t know what to say or what to practise. Cruzi gives parents and supervising drivers a clear plan for every session.
            </p>
            <ul className="mt-6 space-y-3 text-body-md">
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-container shrink-0 mt-0.5" aria-hidden />
                <span>Know what to practise next, based on your latest progress</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-container shrink-0 mt-0.5" aria-hidden />
                <span>Plain-English prompts so parents know what good looks like</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-container shrink-0 mt-0.5" aria-hidden />
                <span>Track confidence and skills over time — not just hours</span>
              </li>
            </ul>
          </div>
          <Card className="rounded-card border-border/70 bg-card shadow-md" data-testid="card-session-plan-example">
            <CardContent className="p-card-pad">
              <p className="text-label-md uppercase text-muted-foreground">Session plan</p>
              <h3 className="mt-2 text-headline-md font-semibold">Roundabouts &amp; lane discipline</h3>
              <ul className="mt-5 space-y-3 text-body-md text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary-container">•</span> 15 min — quiet residential warm-up</li>
                <li className="flex gap-3"><span className="text-primary-container">•</span> 20 min — practise three local roundabouts</li>
                <li className="flex gap-3"><span className="text-primary-container">•</span> 10 min — debrief &amp; confidence check-in</li>
              </ul>
              <p className="mt-5 text-label-sm text-muted-foreground">
                Example only — your plan adapts to your progress.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. CHESTER LOCAL */}
      <section className="py-16 sm:py-20 bg-surface-container-low border-y border-border/60">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-pill bg-accent text-accent-foreground px-4 py-1.5 text-label-sm font-semibold">
            <MapPin className="h-3.5 w-3.5" /> Local to you
          </div>
          <h2 className="mt-6 text-headline-lg-mobile sm:text-headline-lg font-bold" data-testid="text-local-headline">
            Built for learners across the Chester area
          </h2>
          <p className="mt-5 text-body-md text-muted-foreground">
            We’re rolling out Cruzi for learners in:
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3" data-testid="list-places">
            {PLACES.map((place) => (
              <span
                key={place}
                className="inline-flex items-center gap-2 rounded-pill bg-surface-container px-5 py-2 text-body-md font-medium text-foreground border border-border/60"
                data-testid={`chip-place-${place.toLowerCase().replace(/[^a-z]+/g, '-')}`}
              >
                <MapPin className="h-3.5 w-3.5 text-primary-container" />
                {place}
              </span>
            ))}
          </div>
          <p className="mt-8 text-label-sm text-muted-foreground max-w-xl mx-auto">
            We match learners with instructors as availability opens up — joining the waiting list doesn’t guarantee an instructor.
          </p>
        </div>
      </section>

      {/* 6 + 7. WAITLIST FORM & JOINED STATE */}
      <section id="waitlist" className="py-20 sm:py-28">
        <div className="container mx-auto px-6 max-w-xl">
          {!joined ? (
            <Card className="rounded-card border-border/70 shadow-lg" data-testid="card-waitlist">
              <CardContent className="p-card-pad sm:p-10">
                <div className="text-center mb-8">
                  <h2 className="text-headline-md sm:text-headline-lg font-bold" data-testid="text-waitlist-headline">
                    Join the Chester waiting list
                  </h2>
                  <p className="mt-3 text-body-md text-muted-foreground">
                    Be first in line as we open up Cruzi for learners in Chester.
                  </p>
                </div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                    data-testid="form-waitlist"
                    noValidate
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              autoComplete="name"
                              data-testid="input-fullname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Hidden context fields — will be submitted once backend wiring lands */}
                    <input type="hidden" name="city" value={HIDDEN_CITY} data-testid="input-city" />
                    <input type="hidden" name="source" value={HIDDEN_SOURCE} data-testid="input-source" />
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-chip shadow-purple-glow hover:shadow-purple-glow-hover transition-shadow"
                      data-testid="button-submit-waitlist"
                    >
                      Join Chester Waiting List
                    </Button>
                    <p className="text-label-sm text-center text-muted-foreground">
                      Preview — submission isn’t connected to the backend yet. Your details aren’t being saved at this stage.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6" data-testid="state-joined">
              <Card className="rounded-card border-primary-container/30 shadow-lg bg-card">
                <CardContent className="p-card-pad sm:p-10 text-center">
                  <div className="mx-auto h-14 w-14 rounded-full bg-accent text-primary-container flex items-center justify-center mb-5">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2
                    className="text-headline-md sm:text-headline-lg font-bold"
                    data-testid="text-joined-headline"
                  >
                    {joinedFirstName
                      ? `You’re on the Chester waiting list, ${joinedFirstName}.`
                      : 'You’re on the Chester waiting list.'}
                  </h2>
                  <p className="mt-3 text-body-md text-muted-foreground">
                    We’ll email you the moment we open up Cruzi for learners in Chester.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-card border-border/70 shadow-md" data-testid="card-practice-pass">
                <CardContent className="p-card-pad sm:p-10">
                  <p className="text-label-md uppercase tracking-wider text-primary-container">Optional</p>
                  <h3 className="mt-2 text-headline-md font-semibold" data-testid="text-practice-pass-headline">
                    Want to start practising now?
                  </h3>
                  <p className="mt-3 text-body-md text-muted-foreground">
                    Start private practice while you wait. Get access to the AI Driving Co-Pilot, theory prep, Show Me Tell Me and progress tracking — no instructor needed to begin.
                  </p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-headline-lg font-bold text-foreground" data-testid="text-practice-pass-price">£9.99</span>
                    <span className="text-body-md text-muted-foreground">one-time Practice Pass</span>
                  </div>
                  <Button
                    size="lg"
                    disabled
                    className="mt-6 w-full rounded-chip"
                    data-testid="button-practice-pass"
                  >
                    Coming soon
                  </Button>
                  <p className="mt-4 text-label-sm text-muted-foreground">
                    Cruzi is free to try and the Practice Pass is optional. Paying doesn’t guarantee an instructor — it gives you the tools to start practising sooner.
                  </p>
                </CardContent>
              </Card>

              <p className="text-label-sm text-center text-muted-foreground">
                Preview — your details aren’t being saved yet. Backend wiring lands in the next update.
              </p>
            </div>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default ChesterLearnerPage;
