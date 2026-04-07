import React from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";

const TermsOfService: React.FC = () => {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="30 January 2026">
      <p className="text-lg text-muted-foreground mb-8">
        These Terms of Service ("Terms") govern your use of the Cruzi AI
        platform ("Service", "Platform"). By creating an account or using our
        Service, you agree to be bound by these Terms.
      </p>

      <LegalSection id="definitions" title="1. Definitions" defaultOpen>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>"Cruzi AI"</strong>, "we", "us", "our" refers to Cruzi AI
            Ltd
          </li>
          <li>
            <strong>"User"</strong>, "you", "your" refers to any person using
            the Platform
          </li>
          <li>
            <strong>"Instructor"</strong> refers to approved driving instructors
            (ADIs) using the Platform
          </li>
          <li>
            <strong>"Student"</strong> refers to learner drivers using the
            Platform
          </li>
          <li>
            <strong>"Content"</strong> refers to any text, audio, images, or
            data uploaded to the Platform
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="eligibility" title="2. Eligibility">
        <p className="mb-4">To use Cruzi AI, you must:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Be at least 17 years old (UK minimum driving age)</li>
          <li>
            If under 18, have parental or guardian consent and provide a parent
            email during registration
          </li>
          <li>
            For instructors: Hold a valid DVSA Approved Driving Instructor
            (ADI) badge or be a trainee with a valid pink badge
          </li>
          <li>Provide accurate and complete registration information</li>
          <li>Not be prohibited from using the Service under UK law</li>
        </ul>
      </LegalSection>

      <LegalSection id="accounts" title="3. Account Responsibilities">
        <p className="mb-4">You are responsible for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Maintaining the confidentiality of your account credentials
          </li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorised access</li>
          <li>Keeping your profile information accurate and up-to-date</li>
        </ul>
        <p className="mt-4">
          We reserve the right to suspend or terminate accounts that violate
          these Terms or our Acceptable Use Policy.
        </p>
      </LegalSection>

      <LegalSection id="instructor-terms" title="4. Instructor-Specific Terms">
        <p className="mb-4">As an instructor on Cruzi AI, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            Maintain a valid ADI qualification and inform us immediately if it
            lapses
          </li>
          <li>Complete our badge verification process</li>
          <li>
            Set accurate pricing and availability information
          </li>
          <li>
            Honour confirmed bookings or provide reasonable notice for
            cancellations
          </li>
          <li>
            Act as a data controller for student data in your care
          </li>
          <li>
            Comply with the Data Processing Addendum when processing student
            data
          </li>
        </ul>

        <h4 className="font-semibold mt-6 mb-2">Stripe Connect</h4>
        <p className="mb-4">
          To receive payments through the Platform, instructors must set up
          Stripe Connect. By doing so, you agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Stripe's{" "}
            <a
              href="https://stripe.com/legal/connect-account"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Connected Account Agreement
            </a>
          </li>
          <li>
            Provide accurate business information for KYC verification
          </li>
          <li>Accept the applicable platform fees</li>
        </ul>
      </LegalSection>

      <LegalSection id="student-terms" title="5. Student-Specific Terms">
        <p className="mb-4">As a student on Cruzi AI, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Provide accurate information about your driving experience and
            goals
          </li>
          <li>
            Attend booked lessons on time or cancel with reasonable notice
          </li>
          <li>
            Maintain sufficient credit balance for scheduled lessons
          </li>
          <li>
            Follow your instructor's reasonable directions during lessons
          </li>
          <li>
            Not use the Solo Practice feature while driving (passenger/observer
            only may control the app)
          </li>
        </ul>

        <h4 className="font-semibold mt-6 mb-2">Credit System</h4>
        <p className="mb-4">
          Students purchase lesson credits in advance:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Credits are valid for 12 months from purchase date
          </li>
          <li>
            Credits are non-transferable between instructors unless agreed
          </li>
          <li>
            Expired credits cannot be refunded
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="subscriptions" title="6. Subscriptions & Payments">
        <h4 className="font-semibold mb-2">Instructor Subscriptions</h4>
        <p className="mb-4">
          We offer subscription tiers (Lite, Pro, Elite) with different
          features:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            Subscriptions auto-renew at the end of each billing period
          </li>
          <li>
            You can cancel at any time through your account settings or Stripe
            portal
          </li>
          <li>
            No refunds for partial billing periods upon cancellation
          </li>
          <li>
            We may change pricing with 30 days' notice
          </li>
        </ul>

        <h4 className="font-semibold mt-6 mb-2">Refunds</h4>
        <p className="mb-4">
          Refund policies depend on the payment type:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Lesson Credits:</strong> Refundable within 14 days if unused
          </li>
          <li>
            <strong>Subscriptions:</strong> No partial refunds; access continues
            until period end
          </li>
          <li>
            <strong>Disputed Lessons:</strong> Contact support within 48 hours
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="acceptable-use" title="7. Acceptable Use">
        <p className="mb-4">
          You agree not to use the Platform to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Violate any applicable laws or regulations
          </li>
          <li>
            Upload harmful, offensive, or illegal content
          </li>
          <li>
            Harass, abuse, or threaten other users
          </li>
          <li>
            Attempt to access another user's account
          </li>
          <li>
            Reverse engineer or copy our Platform or AI features
          </li>
          <li>
            Use automated tools to scrape or exploit the Platform
          </li>
          <li>
            Circumvent any security or access controls
          </li>
        </ul>
        <p className="mt-4">
          See our full{" "}
          <a href="/acceptable-use" className="text-primary hover:underline">
            Acceptable Use Policy
          </a>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="8. Intellectual Property">
        <h4 className="font-semibold mb-2">Our Property</h4>
        <p className="mb-4">
          Cruzi AI, including all software, design, AI models, and branding, is
          owned by Cruzi AI Ltd and protected by intellectual property laws. You
          may not copy, modify, or distribute any part of our Platform without
          permission.
        </p>

        <h4 className="font-semibold mt-6 mb-2">Your Content</h4>
        <p className="mb-4">
          You retain ownership of content you upload (lesson notes, messages,
          etc.). By uploading content, you grant us a licence to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Store, display, and transmit your content as needed to provide the
            Service
          </li>
          <li>
            Use anonymised, aggregated data to improve our AI and Platform
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="ai-features" title="9. AI Features">
        <p className="mb-4">
          Cruzi AI uses artificial intelligence for various features. You
          acknowledge that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            AI-generated content (lesson plans, feedback) is for guidance only
          </li>
          <li>
            AI is not a substitute for professional driving instruction
          </li>
          <li>
            We do not guarantee the accuracy of AI outputs
          </li>
          <li>
            Voice features require explicit consent before use
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="limitation" title="10. Limitation of Liability">
        <p className="mb-4">
          To the maximum extent permitted by UK law:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            We are not liable for any indirect, incidental, or consequential
            damages
          </li>
          <li>
            Our total liability is limited to the amount you paid us in the
            preceding 12 months
          </li>
          <li>
            We do not guarantee uninterrupted or error-free service
          </li>
        </ul>
        <p>
          Nothing in these Terms limits our liability for death, personal
          injury, fraud, or any matter that cannot be legally excluded.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="11. Indemnification">
        <p className="mb-4">
          You agree to indemnify and hold harmless Cruzi AI, its officers,
          directors, and employees from any claims, damages, or expenses arising
          from:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your violation of these Terms</li>
          <li>Your use of the Platform</li>
          <li>Your content or data</li>
          <li>Your violation of any third-party rights</li>
        </ul>
      </LegalSection>

      <LegalSection id="termination" title="12. Termination">
        <p className="mb-4">
          <strong>By You:</strong> You may close your account at any time
          through settings or by contacting support.
        </p>
        <p className="mb-4">
          <strong>By Us:</strong> We may suspend or terminate your account if:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>You violate these Terms or our policies</li>
          <li>Your ADI qualification lapses (instructors)</li>
          <li>We are required to by law</li>
          <li>We discontinue the Service (with reasonable notice)</li>
        </ul>
        <p>
          Upon termination, your right to use the Platform ends. Data deletion
          follows our Privacy Policy retention periods.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes to Terms">
        <p className="mb-4">
          We may modify these Terms at any time. We will notify you of material
          changes via:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email to your registered address</li>
          <li>Notice on the Platform</li>
        </ul>
        <p className="mt-4">
          Continued use after changes constitutes acceptance. If you disagree,
          you must stop using the Platform.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="14. Governing Law & Disputes">
        <p className="mb-4">
          These Terms are governed by the laws of England and Wales.
        </p>
        <p className="mb-4">
          Any disputes will be resolved through:
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Informal Resolution:</strong> Contact us at
            support@cruzi.app first
          </li>
          <li>
            <strong>Mediation:</strong> If unresolved, we may suggest mediation
          </li>
          <li>
            <strong>Courts:</strong> The courts of England and Wales have
            exclusive jurisdiction
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="general" title="15. General Provisions">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Entire Agreement:</strong> These Terms, along with our
            policies, constitute the entire agreement
          </li>
          <li>
            <strong>Severability:</strong> If any provision is unenforceable,
            others remain in effect
          </li>
          <li>
            <strong>Waiver:</strong> Failure to enforce a right does not waive
            it
          </li>
          <li>
            <strong>Assignment:</strong> We may assign these Terms; you may not
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contact" title="16. Contact">
        <p className="mb-4">
          For questions about these Terms:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:legal@cruzi.app"
              className="text-primary hover:underline"
            >
              legal@cruzi.app
            </a>
          </li>
          <li>
            <strong>Support:</strong>{" "}
            <a
              href="mailto:support@cruzi.app"
              className="text-primary hover:underline"
            >
              support@cruzi.app
            </a>
          </li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default TermsOfService;
