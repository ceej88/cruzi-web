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

const AcceptableUse: React.FC = () => {
  return (
    <LegalPageLayout title="Acceptable Use Policy" lastUpdated="7 April 2026">
      <p className="text-base text-muted-foreground mb-10 leading-relaxed border-l-4 border-[#7C3AED] pl-4 py-2 bg-primary/5 rounded-r-lg">
        This Acceptable Use Policy ("AUP") sets out the rules for using the Cruzi platform. It applies to all users,
        including instructors and students. By using our platform, you agree to comply with this policy.
      </p>

      <Section number="1" title="Overview">
        <p className="text-muted-foreground">
          Cruzi is designed to facilitate driving instruction through technology, including AI-powered features. To
          maintain a safe and productive environment for all users, we expect everyone to use the platform responsibly
          and in accordance with UK law.
        </p>
      </Section>

      <Section number="2" title="Prohibited Content">
        <p className="text-muted-foreground mb-3">You must not upload, share, or transmit:</p>
        <BulletList items={[
          <><strong>Illegal Content:</strong> Anything that violates UK law, including child exploitation material, terrorism content, or hate speech</>,
          <><strong>Harassment:</strong> Abusive, threatening, or intimidating messages to other users</>,
          <><strong>Discrimination:</strong> Content that discriminates based on race, ethnicity, religion, gender, sexual orientation, disability, or age</>,
          <><strong>Explicit Material:</strong> Pornographic or sexually explicit content</>,
          <><strong>Violence:</strong> Content that promotes or glorifies violence</>,
          <><strong>Spam:</strong> Unsolicited commercial communications or repetitive messages</>,
          <><strong>Misinformation:</strong> False information that could endanger road safety</>,
          <><strong>Malware:</strong> Viruses, trojans, or other malicious code</>,
        ]} />
      </Section>

      <Section number="3" title="Prohibited Activities">
        <p className="text-muted-foreground mb-3">You must not:</p>
        <BulletList items={[
          "Attempt to access other users' accounts without authorisation",
          "Use the platform while driving a vehicle (unless as a hands-free passenger feature)",
          "Share your account credentials with others",
          "Create multiple accounts to circumvent bans or restrictions",
          "Scrape, crawl, or use automated tools to access the platform",
          "Reverse engineer our software or AI models",
          "Interfere with the platform's operation or security",
          "Impersonate another person or organisation",
          "Falsely claim ADI credentials or qualifications",
          "Use the platform for purposes other than driving instruction",
        ]} />
      </Section>

      <Section number="4" title="Messaging Guidelines">
        <p className="text-muted-foreground mb-3">
          The in-app messaging system is for lesson-related communication only. Users should:
        </p>
        <BulletList items={[
          "Keep messages professional and relevant to lessons",
          "Avoid sharing unnecessary personal information",
          "Not request or share contact details to circumvent the platform",
          <><strong>Report</strong> any inappropriate messages to <a href="mailto:support@cruzi.co.uk" className="text-primary hover:underline">support@cruzi.co.uk</a></>,
        ]} />
      </Section>

      <Section number="5" title="AI Feature Usage">
        <p className="text-muted-foreground mb-4">Cruzi includes AI-powered features that require responsible use:</p>

        <h3 className="font-semibold text-foreground mb-2">Voice Scribe (Voice Notes)</h3>
        <BulletList items={[
          "Only record with the knowledge and consent of all parties present",
          "Do not record private conversations not related to the lesson",
          "Use recordings for lesson documentation purposes only",
        ]} />

        <h3 className="font-semibold text-foreground mt-5 mb-2">Cruzi Mentor (AI Assistant)</h3>
        <BulletList items={[
          "Do not attempt to manipulate the AI to produce harmful content",
          "Understand that AI responses are guidance, not professional advice",
          "Report any concerning AI outputs to support",
        ]} />

        <h3 className="font-semibold text-foreground mt-5 mb-2">Solo Practice (GPS Tracking)</h3>
        <BulletList items={[
          "Only use when practising with a supervising driver",
          "The driver must not interact with the app while driving",
          "Do not manipulate GPS data or recordings",
        ]} />
      </Section>

      <Section number="6" title="Voice Recording Consent">
        <p className="text-muted-foreground mb-3">Before using any voice features, you must:</p>
        <BulletList items={[
          "Provide explicit consent through the app's consent mechanism",
          "Inform all parties present that recording is taking place",
          "Understand that recordings are processed by third-party AI services",
        ]} />
        <p className="text-muted-foreground mt-3">
          You can disable voice features at any time in your account settings.
        </p>
      </Section>

      <Section number="7" title="Instructor Conduct">
        <p className="text-muted-foreground mb-3">Instructors have additional responsibilities:</p>
        <BulletList items={[
          "Maintain professional boundaries with students at all times",
          "Never request personal relationships with students",
          "Provide accurate skill assessments and progress updates",
          "Respect student privacy and data protection rights",
          "Report any safeguarding concerns appropriately",
          "Follow the DVSA code of practice",
        ]} />
      </Section>

      <Section number="8" title="Student Conduct">
        <p className="text-muted-foreground mb-3">Students are expected to:</p>
        <BulletList items={[
          "Treat instructors with respect and professionalism",
          "Attend lessons prepared and on time",
          "Follow reasonable instructions during lessons",
          "Provide honest information about experience and abilities",
          "Not attend lessons under the influence of alcohol or drugs",
        ]} />
      </Section>

      <Section number="9" title="Enforcement">
        <p className="text-muted-foreground mb-3">
          We take violations of this policy seriously. Depending on severity and frequency, we may:
        </p>
        <BulletList items={[
          <><strong>Issue a Warning:</strong> For first-time minor violations</>,
          <><strong>Temporary Suspension:</strong> Restrict access for a defined period</>,
          <><strong>Permanent Ban:</strong> Remove access to the platform entirely</>,
          <><strong>Report to Authorities:</strong> For illegal activity, we will report to relevant authorities including the police and DVSA</>,
        ]} />
        <p className="text-muted-foreground mt-3">
          Decisions are made at our discretion and we are not obligated to provide appeal processes for all actions.
        </p>
      </Section>

      <Section number="10" title="Reporting Violations">
        <p className="text-muted-foreground mb-3">
          If you encounter content or behaviour that violates this policy:
        </p>
        <BulletList items={[
          <><strong>In-App:</strong> Use the report feature on messages or profiles</>,
          <><strong>Email:</strong> <a href="mailto:support@cruzi.co.uk" className="text-primary hover:underline">support@cruzi.co.uk</a></>,
          <><strong>Emergency:</strong> For immediate safety concerns, contact emergency services first</>,
        ]} />
        <p className="text-muted-foreground mt-3">
          All reports are reviewed within 24 hours.
        </p>
      </Section>

      <Section number="11" title="Changes to This Policy">
        <p className="text-muted-foreground">
          We may update this Acceptable Use Policy from time to time. Continued use of the platform after changes
          constitutes acceptance. Significant changes will be communicated via email or platform notification.
        </p>
      </Section>

      <Section number="12" title="Contact">
        <p className="text-muted-foreground mb-3">For questions about this policy:</p>
        <BulletList items={[
          <><strong>Email:</strong> <a href="mailto:support@cruzi.co.uk" className="text-primary hover:underline">support@cruzi.co.uk</a></>,
          <><strong>Address:</strong> Cruzi Ltd, 3rd Floor, 86-90 Paul Street, London, England, EC2A 4NE</>,
        ]} />
      </Section>
    </LegalPageLayout>
  );
};

export default AcceptableUse;
