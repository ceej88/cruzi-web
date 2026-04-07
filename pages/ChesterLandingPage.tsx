import React from 'react';
import { usePublicPage } from '@/hooks/usePublicPage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Clock, Users, MapPin, Mic, ClipboardCheck, BarChart3,
  GraduationCap, Shield, ArrowRight, Star, CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: Clock,
    title: 'Lesson Planning in Under 2 Minutes',
    desc: 'Build structured, DVSA-aligned lesson plans with Voice Scribe. Speak your notes after each lesson — Cruzi does the rest.',
  },
  {
    icon: Users,
    title: 'Parent Progress Dashboard',
    desc: 'Parents see exactly where their child is at — skills covered, areas to practise, and what\'s coming next. No chasing WhatsApp updates.',
  },
  {
    icon: MapPin,
    title: 'Chester Test Routes Built In',
    desc: 'Record and share turn-by-turn test routes from Chester test centre. Students practise independently between lessons.',
  },
  {
    icon: Mic,
    title: 'Voice Scribe — Hands-Free Notes',
    desc: 'Finish a lesson, tap record, and talk. Cruzi transcribes your debrief into structured session logs, skill updates, and the next lesson plan.',
  },
  {
    icon: ClipboardCheck,
    title: 'Mock Test Scoring',
    desc: 'Score mock tests aligned to DVSA marking standards. Track minors, serious, and dangerous faults — students see their progress over time.',
  },
  {
    icon: BarChart3,
    title: 'MTD-Compliant Financial Tracking',
    desc: 'Log income, expenses, and mileage. Generate quarterly tax summaries that align with HMRC Making Tax Digital requirements.',
  },
  {
    icon: GraduationCap,
    title: 'Content Studio',
    desc: 'Create shareable student achievement badges and progress cards. Celebrate milestones and keep students motivated between lessons.',
  },
  {
    icon: Shield,
    title: 'Student Connection Hub',
    desc: 'Students join with a simple 4-digit PIN. No complicated sign-ups, no shared passwords. Secure, simple, professional.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Cruzi has completely changed how I manage my week. Lesson planning used to take ages — now I just talk into my phone after each lesson and it\'s done.',
    name: 'Sarah T.',
    location: 'Independent ADI, Chester',
  },
  {
    quote: 'Parents love getting updates without me having to send individual messages. It makes me look more professional and saves hours every week.',
    name: 'Mark D.',
    location: 'Driving Instructor, Wrexham',
  },
];

const ChesterLandingPage: React.FC = () => {
  usePublicPage();
  useDocumentTitle('Top Driving Instructors in Chester | Cruzi');

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Cruzi — Driving Instructor Platform',
            description: 'Supporting driving instructors in Chester with lesson planning, student engagement, and parent progress updates.',
            url: 'https://cruzi-drive-mentor.lovable.app/driving-lessons-chester',
            areaServed: { '@type': 'City', name: 'Chester' },
            address: { '@type': 'PostalAddress', addressLocality: 'Chester', addressRegion: 'Cheshire', addressCountry: 'GB' },
          }),
        }}
      />
      <meta name="description" content="Find top-rated driving instructors in Chester powered by Cruzi. Lesson planning, parent updates, test route practice & more. Start your free trial today." />
      <meta property="og:image" content="https://cruzi.co.uk/og-social-share.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <link rel="canonical" href="https://cruzi-drive-mentor.lovable.app/driving-lessons-chester" />

      <div className="min-h-screen bg-background text-foreground">
        <LandingNavbar />

        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              Chester &amp; Surrounding Areas
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
              Top Driving Instructors in Chester
              <span className="text-primary"> — Powered by Cruzi</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Cruzi gives Chester's driving instructors the tools to keep students improving between lessons,
              automate the admin burden, and keep parents in the loop — so you can focus on what you do best: teaching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-xl px-8 h-12 text-base font-bold">
                <Link to="/auth">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-8 h-12 text-base font-bold">
                <Link to="/savings">See How Much You'll Save</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> No card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> Cancel anytime</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> DVSA-aligned</span>
            </div>
          </div>
        </section>

        {/* Why Chester instructors choose Cruzi */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Why Chester Instructors Choose Cruzi</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Real features that save you time, engage your students, and keep parents informed.
                No gimmicks — just practical tools built for how you actually work.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <Card key={f.title} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Chester Test Centre Info */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-black tracking-tight">Chester Test Centre</h2>
              <p className="text-muted-foreground leading-relaxed">
                Chester DVSA test centre serves learners across Chester, Saltney, Broughton, Blacon, and surrounding areas.
                Cruzi instructors record and share test routes so students can practise independently — building confidence
                before the big day.
              </p>
              <ul className="space-y-2 text-sm">
                {['Record test routes with turn-by-turn directions', 'Students practise routes on their own time', 'Share routes via a simple link — no app download needed', 'Track which routes each student has covered'].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border">
              <iframe
                title="Chester Test Centre Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2387.5!2d-2.89!3d53.19!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487ad77a0e0e0001%3A0x1!2sChester+DVSA+Test+Centre!5e0!3m2!1sen!2sgb!4v1"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 space-y-10">
            <h2 className="text-3xl font-black tracking-tight text-center">What Instructors Are Saying</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t) => (
                <Card key={t.name} className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed italic">"{t.quote}"</p>
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Ready to Join Chester's Most Organised Instructors?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start your free trial today. No card needed, no commitment.
              See why instructors across Chester are switching to Cruzi.
            </p>
            <Button asChild size="lg" className="rounded-xl px-10 h-12 text-base font-bold">
              <Link to="/auth">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
};

export default ChesterLandingPage;
