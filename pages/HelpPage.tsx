import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, FileText, Shield, ArrowLeft, HelpCircle, BookOpen, Users } from 'lucide-react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';

const faqs = [
  {
    q: 'How do I book a driving lesson?',
    a: 'Your instructor will schedule lessons through the app. You can view upcoming lessons on your dashboard and request new slots if booking requests are enabled.',
  },
  {
    q: 'How do I top up my lesson credits?',
    a: 'Go to Settings in your student portal and tap "Top Up Credits". You can pay by card or bank transfer depending on your instructor\'s preferences.',
  },
  {
    q: 'How is my Test Readiness percentage calculated?',
    a: 'It\'s based on your scores across the 27 core DVSA skills. Each skill is scored 1-5 by your instructor. Your percentage = total points earned ÷ 135 × 100.',
  },
  {
    q: 'Can my parents see my progress?',
    a: 'Yes! Add your parent or guardian\'s email in Settings. They\'ll receive automated progress updates after your instructor scores your skills.',
  },
  {
    q: 'How do I connect with my instructor?',
    a: 'Your instructor will give you a Student PIN or invite link. Enter it during sign-up to link your account to theirs.',
  },
  {
    q: 'What is a Booking Pass?',
    a: 'A Booking Pass gives you temporary access to your instructor\'s PRN so you can book your practical driving test on the DVSA website.',
  },
];

const HelpPage: React.FC = () => {
  return (
    <LegalPageLayout title="Help & Support" lastUpdated="19 February 2026">
      <div className="space-y-12">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Contact Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-black text-foreground tracking-tight">Contact Us</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Need help? We're here for you. Tap the button below to send us an email and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:support@cruzi.co.uk?subject=Cruzi%20Support%20Request"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
          >
            <Mail className="h-5 w-5" />
            Email Support
          </a>
          <p className="text-xs text-muted-foreground">
            support@cruzi.co.uk — We typically respond within 24 hours.
          </p>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-black text-foreground tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 bg-muted rounded-2xl border border-border space-y-2">
                <h3 className="font-black text-foreground">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-black text-foreground tracking-tight">Useful Links</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/terms" className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border hover:bg-accent transition-all">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground text-sm">Terms of Service</span>
            </Link>
            <Link to="/privacy" className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border hover:bg-accent transition-all">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground text-sm">Privacy Policy</span>
            </Link>
            <Link to="/cookies" className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border hover:bg-accent transition-all">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground text-sm">Cookie Policy</span>
            </Link>
            <Link to="/acceptable-use" className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border hover:bg-accent transition-all">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground text-sm">Acceptable Use</span>
            </Link>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default HelpPage;
