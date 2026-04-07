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

const DataProcessingAddendum: React.FC = () => {
  return (
    <LegalPageLayout title="Data Processing Addendum" lastUpdated="7 April 2026">
      <p className="text-base text-muted-foreground mb-6 leading-relaxed border-l-4 border-[#7C3AED] pl-4 py-2 bg-primary/5 rounded-r-lg">
        This Data Processing Addendum ("DPA") forms part of the Terms of Service between Cruzi Ltd ("Processor") and
        driving instructors ("Controller") using the Cruzi platform. This DPA sets out the terms under which we
        process personal data on your behalf.
      </p>

      <div className="bg-muted/50 p-5 rounded-xl mb-10 border border-border">
        <p className="text-sm text-foreground">
          <strong>Important:</strong> As an instructor, you are a data controller for your students' personal data.
          Cruzi acts as your data processor when handling this data on the platform.
        </p>
      </div>

      <Section number="1" title="Definitions">
        <BulletList items={[
          <><strong>"Controller"</strong> means you, the driving instructor, who determines the purposes and means of processing student data</>,
          <><strong>"Processor"</strong> means Cruzi Ltd, who processes student data on your behalf</>,
          <><strong>"Sub-processor"</strong> means any third party engaged by the Processor to process data</>,
          <><strong>"Student Data"</strong> means personal data of your students processed through the Platform</>,
          <><strong>"Data Protection Laws"</strong> means UK GDPR, Data Protection Act 2018, and PECR</>,
        ]} />
      </Section>

      <Section number="2" title="Scope of Processing">
        <h3 className="font-semibold text-foreground mb-2">Subject Matter</h3>
        <p className="text-muted-foreground mb-4">
          Processing of student personal data for the provision of driving instruction management services.
        </p>

        <h3 className="font-semibold text-foreground mb-2">Duration</h3>
        <p className="text-muted-foreground mb-4">
          For the duration of your use of the Platform, plus applicable retention periods as outlined in our Privacy Policy.
        </p>

        <h3 className="font-semibold text-foreground mb-2">Nature and Purpose</h3>
        <BulletList items={[
          "Storing and organising student profiles and contact details",
          "Recording lesson bookings and attendance",
          "Tracking skill progress and assessments",
          "Processing lesson notes and feedback",
          "Facilitating communication between instructor and student",
          "Processing payments and credit balances",
        ]} />

        <h3 className="font-semibold text-foreground mt-5 mb-2">Categories of Data</h3>
        <BulletList items={[
          "Identity data (name, email, phone, address)",
          "Lesson records and progress notes",
          "Skill assessments and mock test results",
          "Payment and credit information",
          "Messages and communications",
          "Voice recordings (where consent is given)",
          "GPS data from solo practice sessions",
        ]} />

        <h3 className="font-semibold text-foreground mt-5 mb-2">Data Subjects</h3>
        <p className="text-muted-foreground">Students of the Controller (driving instructor).</p>
      </Section>

      <Section number="3" title="Controller Obligations">
        <p className="text-muted-foreground mb-3">As the Controller, you are responsible for:</p>
        <BulletList items={[
          "Having a lawful basis for processing your students' personal data",
          "Providing students with appropriate privacy notices explaining how their data is used",
          "Obtaining explicit consent for voice recordings and GPS tracking",
          "Responding to data subject requests (with our assistance)",
          "Ensuring the accuracy of data you input into the Platform",
          "Notifying us promptly of any data protection issues",
          "Complying with all applicable Data Protection Laws",
        ]} />
      </Section>

      <Section number="4" title="Processor Obligations">
        <p className="text-muted-foreground mb-3">As the Processor, Cruzi will:</p>
        <BulletList items={[
          "Process Student Data only on your documented instructions (through normal platform use)",
          "Ensure persons authorised to process data have committed to confidentiality",
          "Implement appropriate technical and organisational security measures",
          "Only engage sub-processors with prior general authorisation (see Section 5)",
          "Assist you in responding to data subject requests",
          "Assist you with data protection impact assessments where required",
          "Delete or return data upon termination (subject to legal retention requirements)",
          "Make available information to demonstrate compliance upon reasonable request",
        ]} />
      </Section>

      <Section number="5" title="Sub-Processors">
        <p className="text-muted-foreground mb-4">
          By agreeing to this DPA, you provide general authorisation for us to engage the following sub-processors:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Sub-Processor</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Purpose</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Location</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Supabase Inc.", purpose: "Database hosting and authentication", location: "AWS EU (Ireland)" },
                { name: "Stripe Inc.", purpose: "Payment processing", location: "US (EU SCCs)" },
                { name: "OpenAI", purpose: "AI features (lesson plans, Voice Scribe)", location: "US (EU SCCs)" },
                { name: "Google LLC", purpose: "AI services, Maps", location: "US (EU SCCs)" },
                { name: "Resend Inc.", purpose: "Email delivery", location: "US (EU SCCs)" },
                { name: "Twilio Inc.", purpose: "SMS notifications", location: "US (EU SCCs)" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-2 px-3 text-muted-foreground">{row.name}</td>
                  <td className="py-2 px-3 text-muted-foreground">{row.purpose}</td>
                  <td className="py-2 px-3 text-muted-foreground">{row.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground">
          We will notify you of any intended changes to sub-processors, giving you the opportunity to object.
        </p>
      </Section>

      <Section number="6" title="Security Measures">
        <h3 className="font-semibold text-foreground mb-2">Technical Measures</h3>
        <BulletList items={[
          "Encryption of data in transit (TLS 1.2+)",
          "Encryption of data at rest (AES-256)",
          "Multi-factor authentication options",
          "Role-based access controls",
          "Regular security updates and patching",
          "Secure API authentication",
        ]} />

        <h3 className="font-semibold text-foreground mt-5 mb-2">Organisational Measures</h3>
        <BulletList items={[
          "Staff training on data protection",
          "Confidentiality agreements with all personnel",
          "Access limited to need-to-know basis",
          "Regular security assessments",
          "Incident response procedures",
        ]} />
      </Section>

      <Section number="7" title="Data Subject Rights">
        <p className="text-muted-foreground mb-3">
          When a student exercises their data protection rights (access, rectification, erasure, etc.), we will:
        </p>
        <BulletList items={[
          "Forward the request to you if addressed to us incorrectly",
          "Provide you with the tools to respond to requests (data export, deletion features)",
          "Assist you in responding within the statutory timeframes",
          "Provide information about data processing activities upon request",
        ]} />
      </Section>

      <Section number="8" title="Data Breach Notification">
        <p className="text-muted-foreground mb-3">In the event of a personal data breach affecting Student Data:</p>
        <BulletList items={[
          "We will notify you without undue delay (and within 24 hours where feasible)",
          "Provide details of the breach including categories and approximate number of data subjects affected",
          "Describe the likely consequences and measures taken or proposed",
          "Assist you in meeting your notification obligations to the ICO (within 72 hours if required)",
        ]} />
        <p className="text-muted-foreground mt-3">
          You are responsible for notifying the ICO and affected individuals where required by law.
        </p>
      </Section>

      <Section number="9" title="International Transfers">
        <p className="text-muted-foreground mb-3">Where Student Data is transferred outside the UK or EEA, we ensure:</p>
        <BulletList items={[
          "Transfers only to countries with adequacy decisions, or",
          "Appropriate safeguards are in place (Standard Contractual Clauses, UK IDTA)",
          "Additional technical measures where necessary to ensure equivalent protection",
        ]} />
      </Section>

      <Section number="10" title="Termination and Data Return">
        <p className="text-muted-foreground mb-3">Upon termination of your account:</p>
        <BulletList items={[
          "You may export your Student Data using the platform's export features",
          "We will delete Student Data within 30 days of account closure",
          "Some data may be retained for legal or regulatory requirements (e.g. financial records for 7 years)",
          "We will provide confirmation of deletion upon request",
        ]} />
      </Section>

      <Section number="11" title="Liability">
        <p className="text-muted-foreground mb-3">
          Each party shall be liable for damages caused by processing that violates Data Protection Laws:
        </p>
        <BulletList items={[
          "Controllers are liable for processing that does not comply with their obligations",
          "Processors are liable for processing that does not comply with processor-specific obligations or that is outside the Controller's instructions",
          "Where both parties are responsible, liability shall be apportioned according to fault",
        ]} />
      </Section>

      <Section number="12" title="Contact">
        <p className="text-muted-foreground mb-3">For questions about this DPA or data processing activities:</p>
        <BulletList items={[
          <><strong>Data Protection Contact:</strong> <a href="mailto:privacy@cruzi.co.uk" className="text-primary hover:underline">privacy@cruzi.co.uk</a></>,
          <><strong>Breach Reporting:</strong> <a href="mailto:security@cruzi.co.uk" className="text-primary hover:underline">security@cruzi.co.uk</a></>,
          <><strong>Address:</strong> Cruzi Ltd, 3rd Floor, 86-90 Paul Street, London, England, EC2A 4NE</>,
        ]} />
      </Section>
    </LegalPageLayout>
  );
};

export default DataProcessingAddendum;
