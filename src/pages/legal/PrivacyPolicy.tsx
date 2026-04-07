import React from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="30 January 2026">
      <p className="text-lg text-muted-foreground mb-8">
        This Privacy Policy explains how Cruzi AI ("we", "us", "our") collects,
        uses, and protects your personal data when you use our driving
        instruction platform. We are committed to protecting your privacy in
        accordance with the UK General Data Protection Regulation (UK GDPR) and
        the Data Protection Act 2018.
      </p>

      <LegalSection id="data-controller" title="1. Data Controller" defaultOpen>
        <p className="mb-4">
          Cruzi AI is the data controller responsible for your personal data.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Company Name:</strong> Cruzi AI Ltd
          </li>
          <li>
            <strong>Contact Email:</strong> privacy@cruzi.app
          </li>
          <li>
            <strong>Address:</strong> United Kingdom
          </li>
          <li>
            <strong>ICO Registration:</strong> [Registration Number Pending]
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="data-collected" title="2. Information We Collect">
        <p className="mb-4">We collect the following categories of personal data:</p>

        <h4 className="font-semibold mt-6 mb-2">Information You Provide</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Identity Data:</strong> Name, email address, phone number,
            home address
          </li>
          <li>
            <strong>Professional Data (Instructors):</strong> ADI number, badge
            verification status, hourly rate
          </li>
          <li>
            <strong>Account Data:</strong> Username, password, profile picture
          </li>
          <li>
            <strong>Parent/Guardian Data:</strong> Email address of parent or
            guardian for students under 18
          </li>
        </ul>

        <h4 className="font-semibold mt-6 mb-2">Information Collected Automatically</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Device Data:</strong> Browser type, IP address, device
            identifiers
          </li>
          <li>
            <strong>Usage Data:</strong> Pages visited, features used, time
            spent on platform
          </li>
          <li>
            <strong>Location Data:</strong> GPS coordinates during solo practice
            drives (with your explicit consent)
          </li>
        </ul>

        <h4 className="font-semibold mt-6 mb-2">Sensitive Data (With Explicit Consent)</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Voice Recordings:</strong> Audio captured through Neural
            Scribe and AI features
          </li>
          <li>
            <strong>Lesson Progress:</strong> Skill assessments, mock test
            results, instructor notes
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="how-we-use" title="3. How We Use Your Information">
        <p className="mb-4">We use your personal data to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide and maintain our driving instruction platform</li>
          <li>Match students with instructors and manage bookings</li>
          <li>Process payments and manage credit balances</li>
          <li>Generate AI-powered lesson plans and feedback</li>
          <li>Track learning progress and skill development</li>
          <li>Send service-related communications</li>
          <li>Improve our platform through analytics</li>
          <li>Comply with legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection id="legal-basis" title="4. Legal Bases for Processing">
        <p className="mb-4">
          We process your personal data under the following legal bases (GDPR
          Article 6):
        </p>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Processing Activity</th>
              <th className="text-left py-2">Legal Basis</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4">Account creation & management</td>
              <td className="py-2">Contract performance</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Lesson booking & tracking</td>
              <td className="py-2">Contract performance</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Payment processing</td>
              <td className="py-2">Contract performance</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Voice recordings (Neural Scribe)</td>
              <td className="py-2">Explicit consent</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">GPS tracking (Solo Practice)</td>
              <td className="py-2">Explicit consent</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Marketing communications</td>
              <td className="py-2">Consent</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Platform analytics</td>
              <td className="py-2">Legitimate interest</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Fraud prevention</td>
              <td className="py-2">Legitimate interest</td>
            </tr>
          </tbody>
        </table>
      </LegalSection>

      <LegalSection id="voice-ai" title="5. Voice Recording & AI Features">
        <p className="mb-4">
          Cruzi AI includes voice-based features that require your explicit
          consent:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Neural Scribe:</strong> Voice-to-text lesson notes for
            instructors
          </li>
          <li>
            <strong>Epiphany Bridge:</strong> AI-generated audio narration
          </li>
          <li>
            <strong>Cruzi Mentor:</strong> AI assistant with voice capabilities
          </li>
        </ul>
        <p className="mb-4">
          Voice recordings are processed by our third-party providers (Google
          Gemini, ElevenLabs) and are not stored permanently. You can disable
          voice features at any time in your account settings.
        </p>
      </LegalSection>

      <LegalSection id="location" title="6. Location Data">
        <p className="mb-4">
          The Solo Practice (Ghost Instructor) feature uses your device's GPS to
          track practice drives. This data is used to:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Calculate distance and duration of practice sessions</li>
          <li>Generate AI feedback on your driving patterns</li>
          <li>Show progress to your instructor</li>
        </ul>
        <p>
          Location tracking only occurs when you explicitly start a recording
          session. You can revoke location permissions through your device
          settings.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="7. Payment Information">
        <p className="mb-4">
          We use Stripe to process all payments. When you make a payment or set
          up Stripe Connect (instructors):
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Card details are processed directly by Stripe and never touch our
            servers
          </li>
          <li>
            We store transaction references, amounts, and payment status
          </li>
          <li>
            Instructors using Stripe Connect are subject to Stripe's additional
            terms
          </li>
        </ul>
        <p className="mt-4">
          For more information, see{" "}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Stripe's Privacy Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="8. Data Sharing & Third Parties">
        <p className="mb-4">We share your data with the following processors:</p>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Processor</th>
              <th className="text-left py-2 pr-4">Purpose</th>
              <th className="text-left py-2">Location</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4">Stripe</td>
              <td className="py-2 pr-4">Payment processing</td>
              <td className="py-2">US (EU SCCs)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Google (Gemini AI)</td>
              <td className="py-2 pr-4">AI lesson analysis</td>
              <td className="py-2">US (EU SCCs)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">ElevenLabs</td>
              <td className="py-2 pr-4">Voice synthesis</td>
              <td className="py-2">US</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Supabase</td>
              <td className="py-2 pr-4">Database hosting</td>
              <td className="py-2">AWS (EU region)</td>
            </tr>
          </tbody>
        </table>
        <p>
          We do not sell your personal data to third parties.
        </p>
      </LegalSection>

      <LegalSection id="international" title="9. International Transfers">
        <p className="mb-4">
          Some of our service providers are based outside the UK/EEA. When
          transferring data internationally, we ensure appropriate safeguards
          are in place:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Standard Contractual Clauses (SCCs) approved by the ICO</li>
          <li>UK International Data Transfer Agreement (IDTA)</li>
          <li>Adequacy decisions where applicable</li>
        </ul>
      </LegalSection>

      <LegalSection id="retention" title="10. Data Retention">
        <p className="mb-4">We retain your data for the following periods:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account Data:</strong> Until account deletion, then 30 days
          </li>
          <li>
            <strong>Lesson Records:</strong> 7 years (legal requirement)
          </li>
          <li>
            <strong>Payment Records:</strong> 7 years (tax/accounting)
          </li>
          <li>
            <strong>Voice Recordings:</strong> Processed in real-time, not
            stored
          </li>
          <li>
            <strong>GPS Data:</strong> 90 days, then aggregated/anonymised
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="your-rights" title="11. Your Rights">
        <p className="mb-4">
          Under UK GDPR, you have the following rights:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Right of Access:</strong> Request a copy of your personal
            data
          </li>
          <li>
            <strong>Right to Rectification:</strong> Correct inaccurate data
          </li>
          <li>
            <strong>Right to Erasure:</strong> Request deletion of your data
          </li>
          <li>
            <strong>Right to Restriction:</strong> Limit how we use your data
          </li>
          <li>
            <strong>Right to Portability:</strong> Receive your data in a
            machine-readable format
          </li>
          <li>
            <strong>Right to Object:</strong> Object to processing based on
            legitimate interests
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> Withdraw consent at any
            time
          </li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:privacy@cruzi.app" className="text-primary hover:underline">
            privacy@cruzi.app
          </a>
          . We will respond within 30 days.
        </p>
      </LegalSection>

      <LegalSection id="children" title="12. Children's Privacy">
        <p className="mb-4">
          Cruzi AI is intended for users aged 17 and above (the UK minimum
          driving age). For students under 18:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            We collect a parent/guardian email during registration
          </li>
          <li>
            Parents can request access to their child's data
          </li>
          <li>
            Special protections apply under the Children's Code (Age Appropriate
            Design Code)
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes to This Policy">
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify
          you of significant changes by:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email notification to your registered address</li>
          <li>Prominent notice on our platform</li>
          <li>Updating the "Last updated" date at the top of this page</li>
        </ul>
      </LegalSection>

      <LegalSection id="complaints" title="14. Complaints">
        <p className="mb-4">
          If you're unhappy with how we've handled your data, you have the right
          to complain to the Information Commissioner's Office (ICO):
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Website:</strong>{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ico.org.uk
            </a>
          </li>
          <li>
            <strong>Phone:</strong> 0303 123 1113
          </li>
        </ul>
        <p className="mt-4">
          We encourage you to contact us first at{" "}
          <a href="mailto:privacy@cruzi.app" className="text-primary hover:underline">
            privacy@cruzi.app
          </a>{" "}
          so we can try to resolve your concerns.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="15. Contact Us">
        <p className="mb-4">
          For any questions about this Privacy Policy or your personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:privacy@cruzi.app" className="text-primary hover:underline">
              privacy@cruzi.app
            </a>
          </li>
          <li>
            <strong>Subject Access Requests:</strong>{" "}
            <a href="mailto:sar@cruzi.app" className="text-primary hover:underline">
              sar@cruzi.app
            </a>
          </li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
