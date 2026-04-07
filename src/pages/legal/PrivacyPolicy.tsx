import React from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

const Section: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold text-[#7C3AED] mb-4">
      {number}. {title}
    </h2>
    <div className="text-foreground leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

const BulletList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="7 April 2026">
      <p className="text-base text-muted-foreground mb-10 leading-relaxed border-l-4 border-[#7C3AED] pl-4 py-2 bg-primary/5 rounded-r-lg">
        This Privacy Policy explains how Cruzi Ltd ("we", "us", "our") collects, uses, and protects your personal data
        when you use the Cruzi driving instruction platform — including our mobile app, website at cruzi.co.uk, and
        related services. We are committed to protecting your privacy in accordance with the UK General Data Protection
        Regulation (UK GDPR) and the Data Protection Act 2018.
      </p>

      <Section number="1" title="Data Controller">
        <BulletList items={[
          <><strong>Company Name:</strong> Cruzi Ltd</>,
          <><strong>Contact Email:</strong> <a href="mailto:privacy@cruzi.co.uk" className="text-primary hover:underline">privacy@cruzi.co.uk</a></>,
          <><strong>Address:</strong> 3rd Floor, 86-90 Paul Street, London, England, EC2A 4NE, United Kingdom</>,
          <><strong>ICO Registration:</strong> In progress</>,
        ]} />
      </Section>

      <Section number="2" title="Information We Collect">
        <h3 className="font-semibold text-foreground mt-4 mb-2">Instructors</h3>
        <BulletList items={[
          "Name, email address, phone number",
          "ADI number, badge expiry date, grade",
          "Profile photo",
          "Lesson schedule and student data",
          "Payment information via Stripe Connect",
          "Voice recordings (Voice Scribe feature)",
          "Location data (optional, for lesson route tracking)",
        ]} />

        <h3 className="font-semibold text-foreground mt-6 mb-2">Students</h3>
        <BulletList items={[
          "Name, email address, date of birth, phone number",
          "Home address",
          "Provisional licence number (optional)",
          "Theory test status (optional)",
          "Emergency contact details",
          "Lesson history and skill progress",
          "Payment transaction records",
        ]} />

        <h3 className="font-semibold text-foreground mt-6 mb-2">Parents / Supervisors</h3>
        <BulletList items={[
          "Name, email address",
          "Co-Pilot session recordings (audio, when feature is enabled)",
          "Practice session data",
        ]} />
      </Section>

      <Section number="3" title="How We Use Your Information">
        <BulletList items={[
          "Providing and improving the Cruzi platform",
          "Processing lesson bookings and payments",
          "Generating AI-powered lesson plans and coaching insights",
          "Sending notifications about lessons and progress",
          "Complying with legal obligations",
          "Customer support",
        ]} />
      </Section>

      <Section number="4" title="Legal Bases for Processing">
        <p className="text-muted-foreground mb-4">We process your data under the following legal bases:</p>
        <BulletList items={[
          <><strong>Contract:</strong> To provide the services you have signed up for</>,
          <><strong>Legitimate interests:</strong> To improve our platform and prevent fraud</>,
          <><strong>Consent:</strong> For optional features such as voice recording and location tracking</>,
          <><strong>Legal obligation:</strong> To comply with UK law</>,
        ]} />
      </Section>

      <Section number="5" title="Voice Recording and AI Features">
        <h3 className="font-semibold text-foreground mt-2 mb-2">Voice Scribe (Instructors)</h3>
        <p className="text-muted-foreground">
          Instructors can record audio reflections after lessons. These recordings are processed by AI (OpenAI Whisper
          and GPT) to generate lesson summaries and skill assessments. Audio files are processed in real time and are
          not permanently stored on our servers.
        </p>

        <h3 className="font-semibold text-foreground mt-6 mb-2">Co-Pilot Audio (Parents / Supervisors)</h3>
        <p className="text-muted-foreground">
          When the Co-Pilot audio feature is enabled, the app records audio during supervised practice drives. This
          audio is analysed by AI to provide coaching feedback. Recordings are processed immediately and not stored
          permanently. This feature requires explicit consent before activation.
        </p>
      </Section>

      <Section number="6" title="Location Data">
        <p className="text-muted-foreground">
          Location data is collected only when you enable route tracking during lessons. This data is used to display
          lesson routes in the app. Location tracking is optional and can be disabled at any time in your device
          settings.
        </p>
      </Section>

      <Section number="7" title="Payment Information">
        <p className="text-muted-foreground">
          Payments are processed securely by Stripe. We do not store your full card details. Cruzi receives only
          transaction confirmations and payout information.{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Stripe's privacy policy
          </a>{" "}
          applies to payment processing.
        </p>
      </Section>

      <Section number="8" title="Data Sharing and Third Parties">
        <p className="text-muted-foreground mb-4">We share data with the following trusted third parties:</p>
        <BulletList items={[
          <><strong>Stripe</strong> — payment processing</>,
          <><strong>OpenAI</strong> — AI features (Voice Scribe, lesson plans, Co-Pilot)</>,
          <><strong>Resend</strong> — email delivery</>,
          <><strong>Supabase</strong> — secure database hosting (EU servers)</>,
          <><strong>Twilio</strong> — SMS notifications (optional)</>,
          <><strong>Google Maps</strong> — route display</>,
        ]} />
        <p className="text-muted-foreground mt-4 font-medium">We do not sell your personal data to any third party.</p>
      </Section>

      <Section number="9" title="International Transfers">
        <p className="text-muted-foreground">
          Our data is stored on servers located in the EU (Ireland). Where data is transferred outside the UK/EU, we
          ensure appropriate safeguards are in place including Standard Contractual Clauses.
        </p>
      </Section>

      <Section number="10" title="Data Retention">
        <BulletList items={[
          <><strong>Account data:</strong> retained while your account is active and for 2 years after deletion</>,
          <><strong>Lesson records:</strong> retained for 6 years for legal compliance</>,
          <><strong>Voice recordings:</strong> processed in real time, not retained</>,
          <><strong>Payment records:</strong> retained for 7 years for tax compliance</>,
        ]} />
      </Section>

      <Section number="11" title="Your Rights">
        <p className="text-muted-foreground mb-4">Under UK GDPR you have the right to:</p>
        <BulletList items={[
          "Access your personal data",
          "Correct inaccurate data",
          "Request deletion of your data",
          "Object to processing",
          "Data portability",
          "Withdraw consent at any time",
        ]} />
        <p className="text-muted-foreground mt-4">
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@cruzi.co.uk" className="text-primary hover:underline">privacy@cruzi.co.uk</a>.
        </p>
      </Section>

      <Section number="12" title="Account Deletion">
        <p className="text-muted-foreground">
          You can delete your account at any time from within the Cruzi app under Settings then Delete Account. Upon
          deletion, your personal data will be removed within 30 days, except where retention is required by law.
        </p>
      </Section>

      <Section number="13" title="Children's Privacy">
        <p className="text-muted-foreground">
          Cruzi is intended for users aged 16 and over. Learner drivers under 18 require parental consent to use the
          platform. We do not knowingly collect data from children under 16 without parental consent.
        </p>
      </Section>

      <Section number="14" title="Mobile Application">
        <p className="text-muted-foreground mb-4">
          The Cruzi app is available on iOS (App Store). The app requests the following permissions:
        </p>
        <BulletList items={[
          <><strong>Microphone</strong> — for Voice Scribe and Co-Pilot audio features</>,
          <><strong>Location</strong> — for optional route tracking during lessons</>,
          <><strong>Camera</strong> — for profile photo upload and ADI badge verification</>,
        ]} />
        <p className="text-muted-foreground mt-4">
          All permissions are optional and can be managed in your device settings.
        </p>
      </Section>

      <Section number="15" title="Changes to This Policy">
        <p className="text-muted-foreground">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by email or
          in-app notification. The latest version is always available at{" "}
          <a href="https://cruzi.co.uk/privacy" className="text-primary hover:underline">cruzi.co.uk/privacy</a>.
        </p>
      </Section>

      <Section number="16" title="Complaints">
        <p className="text-muted-foreground mb-4">
          If you have concerns about how we handle your data, you have the right to lodge a complaint with the
          Information Commissioner's Office (ICO):
        </p>
        <BulletList items={[
          <><strong>Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a></>,
          <><strong>Phone:</strong> 0303 123 1113</>,
        ]} />
      </Section>

      <Section number="17" title="Contact Us">
        <p className="text-muted-foreground mb-4">For any privacy-related questions:</p>
        <BulletList items={[
          <><strong>Email:</strong> <a href="mailto:privacy@cruzi.co.uk" className="text-primary hover:underline">privacy@cruzi.co.uk</a></>,
          <><strong>Address:</strong> Cruzi Ltd, 3rd Floor, 86-90 Paul Street, London, England, EC2A 4NE</>,
        ]} />
      </Section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
