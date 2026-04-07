import React from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";

const DataProcessingAddendum: React.FC = () => {
  return (
    <LegalPageLayout
      title="Data Processing Addendum"
      lastUpdated="30 January 2026"
    >
      <p className="text-lg text-muted-foreground mb-8">
        This Data Processing Addendum ("DPA") forms part of the Terms of Service
        between Cruzi AI Ltd ("Processor") and driving instructors ("Controller")
        using the Cruzi AI platform. This DPA sets out the terms under which we
        process personal data on your behalf.
      </p>

      <div className="bg-muted/50 p-6 rounded-xl mb-8">
        <p className="text-sm">
          <strong>Important:</strong> As an instructor, you are a data
          controller for your students' personal data. Cruzi AI acts as your data
          processor when handling this data on the platform.
        </p>
      </div>

      <LegalSection id="definitions" title="1. Definitions" defaultOpen>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>"Controller"</strong> means you, the driving instructor, who
            determines the purposes and means of processing student data
          </li>
          <li>
            <strong>"Processor"</strong> means Cruzi AI Ltd, who processes
            student data on your behalf
          </li>
          <li>
            <strong>"Sub-processor"</strong> means any third party engaged by
            the Processor to process data
          </li>
          <li>
            <strong>"Student Data"</strong> means personal data of your students
            processed through the Platform
          </li>
          <li>
            <strong>"Data Protection Laws"</strong> means UK GDPR, Data
            Protection Act 2018, and PECR
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="scope" title="2. Scope of Processing">
        <h4 className="font-semibold mb-2">Subject Matter</h4>
        <p className="mb-4">
          Processing of student personal data for the provision of driving
          instruction management services.
        </p>

        <h4 className="font-semibold mt-4 mb-2">Duration</h4>
        <p className="mb-4">
          For the duration of your use of the Platform, plus applicable
          retention periods as outlined in our Privacy Policy.
        </p>

        <h4 className="font-semibold mt-4 mb-2">Nature and Purpose</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Storing and organising student profiles and contact details</li>
          <li>Recording lesson bookings and attendance</li>
          <li>Tracking skill progress and assessments</li>
          <li>Processing lesson notes and feedback</li>
          <li>Facilitating communication between instructor and student</li>
          <li>Processing payments and credit balances</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Categories of Data</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Identity data (name, email, phone, address)</li>
          <li>Lesson records and progress notes</li>
          <li>Skill assessments and mock test results</li>
          <li>Payment and credit information</li>
          <li>Messages and communications</li>
          <li>Voice recordings (where consent is given)</li>
          <li>GPS data from solo practice sessions</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Data Subjects</h4>
        <p>Students of the Controller (driving instructor).</p>
      </LegalSection>

      <LegalSection id="controller-obligations" title="3. Controller Obligations">
        <p className="mb-4">As the Controller, you are responsible for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Having a lawful basis for processing your students' personal data
          </li>
          <li>
            Providing students with appropriate privacy notices explaining how
            their data is used
          </li>
          <li>
            Obtaining explicit consent for voice recordings and GPS tracking
          </li>
          <li>
            Responding to data subject requests (with our assistance)
          </li>
          <li>
            Ensuring the accuracy of data you input into the Platform
          </li>
          <li>
            Notifying us promptly of any data protection issues
          </li>
          <li>
            Complying with all applicable Data Protection Laws
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="processor-obligations" title="4. Processor Obligations">
        <p className="mb-4">As the Processor, Cruzi AI will:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Process Student Data only on your documented instructions (i.e.,
            through normal platform use)
          </li>
          <li>
            Ensure persons authorised to process data have committed to
            confidentiality
          </li>
          <li>
            Implement appropriate technical and organisational security measures
          </li>
          <li>
            Only engage sub-processors with prior general authorisation (see
            Section 5)
          </li>
          <li>
            Assist you in responding to data subject requests
          </li>
          <li>
            Assist you with data protection impact assessments where required
          </li>
          <li>
            Delete or return data upon termination (subject to legal retention
            requirements)
          </li>
          <li>
            Make available information to demonstrate compliance upon reasonable
            request
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="sub-processors" title="5. Sub-Processors">
        <p className="mb-4">
          By agreeing to this DPA, you provide general authorisation for us to
          engage the following sub-processors:
        </p>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Sub-Processor</th>
              <th className="text-left py-2 pr-4">Purpose</th>
              <th className="text-left py-2">Location</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4">Supabase Inc.</td>
              <td className="py-2 pr-4">Database hosting and authentication</td>
              <td className="py-2">AWS EU (Ireland)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Stripe Inc.</td>
              <td className="py-2 pr-4">Payment processing</td>
              <td className="py-2">US (EU SCCs)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Google LLC</td>
              <td className="py-2 pr-4">AI services (Gemini), Maps</td>
              <td className="py-2">US (EU SCCs)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">ElevenLabs Inc.</td>
              <td className="py-2 pr-4">Voice synthesis</td>
              <td className="py-2">US</td>
            </tr>
          </tbody>
        </table>
        <p className="mb-4">
          We will notify you of any intended changes to sub-processors, giving
          you the opportunity to object to such changes.
        </p>
      </LegalSection>

      <LegalSection id="security" title="6. Security Measures">
        <p className="mb-4">
          We implement the following security measures to protect Student Data:
        </p>

        <h4 className="font-semibold mb-2">Technical Measures</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Encryption of data in transit (TLS 1.2+)</li>
          <li>Encryption of data at rest (AES-256)</li>
          <li>Multi-factor authentication options</li>
          <li>Role-based access controls</li>
          <li>Regular security updates and patching</li>
          <li>Secure API authentication</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Organisational Measures</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>Staff training on data protection</li>
          <li>Confidentiality agreements with all personnel</li>
          <li>Access limited to need-to-know basis</li>
          <li>Regular security assessments</li>
          <li>Incident response procedures</li>
        </ul>
      </LegalSection>

      <LegalSection id="data-subject-rights" title="7. Data Subject Rights">
        <p className="mb-4">
          When a student exercises their data protection rights (access,
          rectification, erasure, etc.), we will:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Forward the request to you if addressed to us incorrectly
          </li>
          <li>
            Provide you with the tools to respond to requests (data export,
            deletion features)
          </li>
          <li>
            Assist you in responding within the statutory timeframes
          </li>
          <li>
            Provide information about data processing activities upon request
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="breach-notification" title="8. Data Breach Notification">
        <p className="mb-4">
          In the event of a personal data breach affecting Student Data:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            We will notify you without undue delay (and within 24 hours where
            feasible)
          </li>
          <li>
            Provide details of the breach including categories and approximate
            number of data subjects affected
          </li>
          <li>
            Describe the likely consequences and measures taken/proposed
          </li>
          <li>
            Assist you in meeting your notification obligations to the ICO
            (within 72 hours if required)
          </li>
        </ul>
        <p>
          You are responsible for notifying the ICO and affected individuals
          where required by law.
        </p>
      </LegalSection>

      <LegalSection id="international-transfers" title="9. International Transfers">
        <p className="mb-4">
          Where Student Data is transferred outside the UK/EEA, we ensure:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Transfers only to countries with adequacy decisions, or
          </li>
          <li>
            Appropriate safeguards are in place (Standard Contractual Clauses,
            UK IDTA)
          </li>
          <li>
            Additional technical measures where necessary to ensure equivalent
            protection
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="termination" title="10. Termination & Data Return">
        <p className="mb-4">
          Upon termination of your account:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You may export your Student Data using the platform's export
            features
          </li>
          <li>
            We will delete Student Data within 30 days of account closure
          </li>
          <li>
            Some data may be retained for legal/regulatory requirements (e.g.,
            financial records for 7 years)
          </li>
          <li>
            We will provide confirmation of deletion upon request
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="liability" title="11. Liability">
        <p className="mb-4">
          Each party shall be liable for damages caused by processing that
          violates Data Protection Laws:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Controllers are liable for processing that doesn't comply with their
            obligations
          </li>
          <li>
            Processors are liable for processing that doesn't comply with
            processor-specific obligations or that is outside the Controller's
            instructions
          </li>
          <li>
            Where both parties are responsible, liability shall be apportioned
            according to fault
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact">
        <p className="mb-4">
          For questions about this DPA or data processing activities:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Data Protection Contact:</strong>{" "}
            <a
              href="mailto:dpo@cruzi.app"
              className="text-primary hover:underline"
            >
              dpo@cruzi.app
            </a>
          </li>
          <li>
            <strong>Breach Reporting:</strong>{" "}
            <a
              href="mailto:security@cruzi.app"
              className="text-primary hover:underline"
            >
              security@cruzi.app
            </a>
          </li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default DataProcessingAddendum;
