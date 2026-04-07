import React from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

const Section: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold text-[#7C3AED] mb-4">{number}. {title}</h2>
    <div className="text-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

const BulletList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const TermsOfService: React.FC = () => {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="7 April 2026">
      <p className="text-base text-muted-foreground mb-10 leading-relaxed border-l-4 border-[#7C3AED] pl-4 py-2 bg-primary/5 rounded-r-lg">
        These Terms of Service ("Terms") govern your use of the Cruzi platform ("Service", "Platform"). By creating an
        account or using our Service, you agree to be bound by these Terms.
      </p>

      <Section number="1" title="Definitions">
        <BulletList items={[
          <><strong>"Cruzi"</strong>, "we", "us", "our" refers to Cruzi Ltd</>,
          <><strong>"User"</strong>, "you", "your" refers to any person using the Platform</>,
          <><strong>"Instructor"</strong> refers to approved driving instructors (ADIs) using the Platform</>,
          <><strong>"Student"</strong> refers to learner drivers using the Platform</>,
          <><strong>"Content"</strong> refers to any text, audio, images, or data uploaded to the Platform</>,
        ]} />
      </Section>

      <Section number="2" title="Eligibility">
        <p className="text-muted-foreground mb-3">To use Cruzi, you must:</p>
        <BulletList items={[
          "Be at least 16 years old",
          "If under 18, have parental or guardian consent and provide a parent email during registration",
          "For instructors: Hold a valid DVSA Approved Driving Instructor (ADI) badge or be a trainee with a valid pink badge",
          "Provide accurate and complete registration information",
          "Not be prohibited from using the Service under UK law",
        ]} />
      </Section>

      <Section number="3" title="Account Responsibilities">
        <p className="text-muted-foreground mb-3">You are responsible for:</p>
        <BulletList items={[
          "Maintaining the confidentiality of your account credentials",
          "All activities that occur under your account",
          "Notifying us immediately of any unauthorised access",
          "Keeping your profile information accurate and up-to-date",
        ]} />
        <p className="text-muted-foreground mt-4">
          We reserve the right to suspend or terminate accounts that violate these Terms or our Acceptable Use Policy.
        </p>
      </Section>

      <Section number="4" title="Instructor-Specific Terms">
        <p className="text-muted-foreground mb-3">As an instructor on Cruzi, you agree to:</p>
        <BulletList items={[
          "Maintain a valid ADI qualification and inform us immediately if it lapses",
          "Complete our badge verification process",
          "Set accurate pricing and availability information",
          "Honour confirmed bookings or provide reasonable notice for cancellations",
          "Act as a data controller for student data in your care",
          "Comply with the Data Processing Addendum when processing student data",
        ]} />

        <h3 className="font-semibold text-foreground mt-6 mb-2">Stripe Connect</h3>
        <p className="text-muted-foreground mb-3">To receive payments through the Platform, instructors must set up Stripe Connect. By doing so, you agree to:</p>
        <BulletList items={[
          <><a href="https://stripe.com/legal/connect-account" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe's Connected Account Agreement</a></>,
          "Provide accurate business information for KYC verification",
          "Accept the applicable platform fees",
        ]} />
      </Section>

      <Section number="5" title="Student-Specific Terms">
        <p className="text-muted-foreground mb-3">As a student on Cruzi, you agree to:</p>
        <BulletList items={[
          "Provide accurate information about your driving experience and goals",
          "Attend booked lessons on time or cancel with reasonable notice",
          "Maintain sufficient credit balance for scheduled lessons",
          "Follow your instructor's reasonable directions during lessons",
          "Not use the Solo Practice feature while driving — passenger or observer only may control the app",
        ]} />

        <h3 className="font-semibold text-foreground mt-6 mb-2">Credit System</h3>
        <BulletList items={[
          "Credits are valid for 12 months from purchase date",
          "Credits are non-transferable between instructors unless agreed",
          "Expired credits cannot be refunded",
        ]} />
      </Section>

      <Section number="6" title="Subscriptions and Payments">
        <h3 className="font-semibold text-foreground mb-2">Instructor Subscriptions</h3>
        <p className="text-muted-foreground mb-3">We offer subscription tiers (Free, Pro, Premium) with different features:</p>
        <BulletList items={[
          "Subscriptions auto-renew at the end of each billing period",
          "You can cancel at any time through your account settings or the Cruzi website",
          "No refunds for partial billing periods upon cancellation",
          "We may change pricing with 30 days' notice",
        ]} />

        <h3 className="font-semibold text-foreground mt-6 mb-2">Refunds</h3>
        <BulletList items={[
          <><strong>Lesson Credits:</strong> Refundable within 14 days if unused</>,
          <><strong>Subscriptions:</strong> No partial refunds; access continues until period end</>,
          <><strong>Disputed Lessons:</strong> Contact support within 48 hours</>,
        ]} />
      </Section>

      <Section number="7" title="Acceptable Use">
        <p className="text-muted-foreground mb-3">You agree not to use the Platform to:</p>
        <BulletList items={[
          "Violate any applicable laws or regulations",
          "Upload harmful, offensive, or illegal content",
          "Harass, abuse, or threaten other users",
          "Attempt to access another user's account",
          "Reverse engineer or copy our Platform or AI features",
          "Use automated tools to scrape or exploit the Platform",
          "Circumvent any security or access controls",
        ]} />
        <p className="text-muted-foreground mt-4">
          See our full <a href="/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</a> for details.
        </p>
      </Section>

      <Section number="8" title="Intellectual Property">
        <h3 className="font-semibold text-foreground mb-2">Our Property</h3>
        <p className="text-muted-foreground mb-4">
          Cruzi, including all software, design, AI models, and branding, is owned by Cruzi Ltd and protected by
          intellectual property laws. You may not copy, modify, or distribute any part of our Platform without permission.
        </p>

        <h3 className="font-semibold text-foreground mb-2">Your Content</h3>
        <p className="text-muted-foreground mb-3">
          You retain ownership of content you upload (lesson notes, messages, etc.). By uploading content, you grant us a licence to:
        </p>
        <BulletList items={[
          "Store, display, and transmit your content as needed to provide the Service",
          "Use anonymised, aggregated data to improve our AI and Platform",
        ]} />
      </Section>

      <Section number="9" title="AI Features">
        <p className="text-muted-foreground mb-3">Cruzi uses artificial intelligence for various features. You acknowledge that:</p>
        <BulletList items={[
          "AI-generated content (lesson plans, feedback) is for guidance only",
          "AI is not a substitute for professional driving instruction",
          "We do not guarantee the accuracy of AI outputs",
          "Voice features require explicit consent before use",
        ]} />
      </Section>

      <Section number="10" title="Limitation of Liability">
        <p className="text-muted-foreground mb-3">To the maximum extent permitted by UK law:</p>
        <BulletList items={[
          "We are not liable for any indirect, incidental, or consequential damages",
          "Our total liability is limited to the amount you paid us in the preceding 12 months",
          "We do not guarantee uninterrupted or error-free service",
        ]} />
        <p className="text-muted-foreground mt-4">
          Nothing in these Terms limits our liability for death, personal injury, fraud, or any matter that cannot be
          legally excluded.
        </p>
      </Section>

      <Section number="11" title="Indemnification">
        <p className="text-muted-foreground mb-3">
          You agree to indemnify and hold harmless Cruzi Ltd, its officers, directors, and employees from any claims,
          damages, or expenses arising from:
        </p>
        <BulletList items={[
          "Your violation of these Terms",
          "Your use of the Platform",
          "Your content or data",
          "Your violation of any third-party rights",
        ]} />
      </Section>

      <Section number="12" title="Termination">
        <p className="text-muted-foreground mb-4">
          <strong>By You:</strong> You may close your account at any time through settings or by contacting support.
        </p>
        <p className="text-muted-foreground mb-3">
          <strong>By Us:</strong> We may suspend or terminate your account if:
        </p>
        <BulletList items={[
          "You violate these Terms or our policies",
          "Your ADI qualification lapses (instructors)",
          "We are required to by law",
          "We discontinue the Service (with reasonable notice)",
        ]} />
        <p className="text-muted-foreground mt-4">
          Upon termination, your right to use the Platform ends. Data deletion follows our Privacy Policy retention periods.
        </p>
      </Section>

      <Section number="13" title="Changes to Terms">
        <p className="text-muted-foreground mb-3">We may modify these Terms at any time. We will notify you of material changes via:</p>
        <BulletList items={[
          "Email to your registered address",
          "Notice on the Platform",
        ]} />
        <p className="text-muted-foreground mt-4">
          Continued use after changes constitutes acceptance. If you disagree, you must stop using the Platform.
        </p>
      </Section>

      <Section number="14" title="Governing Law and Disputes">
        <p className="text-muted-foreground mb-4">These Terms are governed by the laws of England and Wales.</p>
        <p className="text-muted-foreground mb-3">Any disputes will be resolved through:</p>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li><strong>Informal Resolution:</strong> Contact us at <a href="mailto:support@cruzi.co.uk" className="text-primary hover:underline">support@cruzi.co.uk</a> first</li>
          <li><strong>Mediation:</strong> If unresolved, we may suggest mediation</li>
          <li><strong>Courts:</strong> The courts of England and Wales have exclusive jurisdiction</li>
        </ol>
      </Section>

      <Section number="15" title="General Provisions">
        <BulletList items={[
          <><strong>Entire Agreement:</strong> These Terms, along with our policies, constitute the entire agreement</>,
          <><strong>Severability:</strong> If any provision is unenforceable, others remain in effect</>,
          <><strong>Waiver:</strong> Failure to enforce a right does not waive it</>,
          <><strong>Assignment:</strong> We may assign these Terms; you may not</>,
        ]} />
      </Section>

      <Section number="16" title="Contact">
        <p className="text-muted-foreground mb-3">For questions about these Terms:</p>
        <BulletList items={[
          <><strong>Email:</strong> <a href="mailto:legal@cruzi.co.uk" className="text-primary hover:underline">legal@cruzi.co.uk</a></>,
          <><strong>Support:</strong> <a href="mailto:support@cruzi.co.uk" className="text-primary hover:underline">support@cruzi.co.uk</a></>,
          <><strong>Address:</strong> Cruzi Ltd, 3rd Floor, 86-90 Paul Street, London, England, EC2A 4NE</>,
        ]} />
      </Section>
    </LegalPageLayout>
  );
};

export default TermsOfService;
