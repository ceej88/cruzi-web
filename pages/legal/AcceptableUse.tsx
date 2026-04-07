import React from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";

const AcceptableUse: React.FC = () => {
  return (
    <LegalPageLayout title="Acceptable Use Policy" lastUpdated="30 January 2026">
      <p className="text-lg text-muted-foreground mb-8">
        This Acceptable Use Policy ("AUP") sets out the rules for using the
        Cruzi AI platform. It applies to all users, including instructors and
        students. By using our platform, you agree to comply with this policy.
      </p>

      <LegalSection id="overview" title="1. Overview" defaultOpen>
        <p className="mb-4">
          Cruzi AI is designed to facilitate driving instruction through
          technology, including AI-powered features. To maintain a safe and
          productive environment for all users, we expect everyone to use the
          platform responsibly and in accordance with UK law.
        </p>
      </LegalSection>

      <LegalSection id="prohibited-content" title="2. Prohibited Content">
        <p className="mb-4">You must not upload, share, or transmit:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Illegal Content:</strong> Anything that violates UK law,
            including but not limited to child exploitation material, terrorism
            content, or hate speech
          </li>
          <li>
            <strong>Harassment:</strong> Abusive, threatening, or intimidating
            messages to other users
          </li>
          <li>
            <strong>Discrimination:</strong> Content that discriminates based on
            race, ethnicity, religion, gender, sexual orientation, disability,
            or age
          </li>
          <li>
            <strong>Explicit Material:</strong> Pornographic or sexually explicit
            content
          </li>
          <li>
            <strong>Violence:</strong> Content that promotes or glorifies
            violence
          </li>
          <li>
            <strong>Spam:</strong> Unsolicited commercial communications or
            repetitive messages
          </li>
          <li>
            <strong>Misinformation:</strong> False information that could
            endanger road safety
          </li>
          <li>
            <strong>Malware:</strong> Viruses, trojans, or other malicious code
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="prohibited-activities" title="3. Prohibited Activities">
        <p className="mb-4">You must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Attempt to access other users' accounts without authorisation
          </li>
          <li>
            Use the platform while driving a vehicle (unless as a hands-free
            passenger feature)
          </li>
          <li>
            Share your account credentials with others
          </li>
          <li>
            Create multiple accounts to circumvent bans or restrictions
          </li>
          <li>
            Scrape, crawl, or use automated tools to access the platform
          </li>
          <li>
            Reverse engineer our software or AI models
          </li>
          <li>
            Interfere with the platform's operation or security
          </li>
          <li>
            Impersonate another person or organisation
          </li>
          <li>
            Falsely claim ADI credentials or qualifications
          </li>
          <li>
            Use the platform for purposes other than driving instruction
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="messaging" title="4. Messaging Guidelines">
        <p className="mb-4">
          The in-app messaging system is for lesson-related communication only.
          Users should:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Keep messages professional and relevant to lessons</li>
          <li>
            Avoid sharing unnecessary personal information
          </li>
          <li>
            Not request or share contact details to circumvent the platform
          </li>
          <li>
            Report any inappropriate messages to support@cruzi.app
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="ai-features" title="5. AI Feature Usage">
        <p className="mb-4">
          Cruzi AI includes AI-powered features that require responsible use:
        </p>

        <h4 className="font-semibold mt-4 mb-2">Neural Scribe (Voice Notes)</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            Only record with the knowledge and consent of all parties present
          </li>
          <li>
            Do not record private conversations not related to the lesson
          </li>
          <li>
            Use recordings for lesson documentation purposes only
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Cruzi Mentor (AI Assistant)</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            Do not attempt to manipulate the AI to produce harmful content
          </li>
          <li>
            Understand that AI responses are guidance, not professional advice
          </li>
          <li>
            Report any concerning AI outputs to support
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Solo Practice (GPS Tracking)</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Only use when practising with a supervising driver
          </li>
          <li>
            The driver must not interact with the app while driving
          </li>
          <li>
            Do not manipulate GPS data or recordings
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="voice-consent" title="6. Voice Recording Consent">
        <p className="mb-4">
          Before using any voice features, you must:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Provide explicit consent through the app's consent mechanism
          </li>
          <li>
            Inform all parties present that recording is taking place
          </li>
          <li>
            Understand that recordings are processed by third-party AI services
          </li>
        </ul>
        <p className="mt-4">
          You can disable voice features at any time in your account settings.
        </p>
      </LegalSection>

      <LegalSection id="instructor-conduct" title="7. Instructor Conduct">
        <p className="mb-4">
          Instructors have additional responsibilities:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Maintain professional boundaries with students at all times
          </li>
          <li>
            Never request personal relationships with students
          </li>
          <li>
            Provide accurate skill assessments and progress updates
          </li>
          <li>
            Respect student privacy and data protection rights
          </li>
          <li>
            Report any safeguarding concerns appropriately
          </li>
          <li>
            Follow the DVSA code of practice
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="student-conduct" title="8. Student Conduct">
        <p className="mb-4">
          Students are expected to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Treat instructors with respect and professionalism
          </li>
          <li>
            Attend lessons prepared and on time
          </li>
          <li>
            Follow reasonable instructions during lessons
          </li>
          <li>
            Provide honest information about experience and abilities
          </li>
          <li>
            Not attend lessons under the influence of alcohol or drugs
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="enforcement" title="9. Enforcement">
        <p className="mb-4">
          We take violations of this policy seriously. Depending on the severity
          and frequency of violations, we may:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Issue a Warning:</strong> For first-time minor violations
          </li>
          <li>
            <strong>Temporary Suspension:</strong> Restrict access for a defined
            period
          </li>
          <li>
            <strong>Permanent Ban:</strong> Remove access to the platform
            entirely
          </li>
          <li>
            <strong>Report to Authorities:</strong> For illegal activity, we
            will report to relevant authorities including the police and DVSA
          </li>
        </ul>
        <p>
          Decisions are made at our discretion and we are not obligated to
          provide appeal processes for all actions.
        </p>
      </LegalSection>

      <LegalSection id="reporting" title="10. Reporting Violations">
        <p className="mb-4">
          If you encounter content or behaviour that violates this policy:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>In-App:</strong> Use the report feature on messages or
            profiles
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:report@cruzi.app"
              className="text-primary hover:underline"
            >
              report@cruzi.app
            </a>
          </li>
          <li>
            <strong>Emergency:</strong> For immediate safety concerns, contact
            emergency services first
          </li>
        </ul>
        <p className="mt-4">
          All reports are reviewed within 24 hours. We may request additional
          information and will keep you informed of actions taken where
          appropriate.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="11. Changes to This Policy">
        <p className="mb-4">
          We may update this Acceptable Use Policy from time to time. Continued
          use of the platform after changes constitutes acceptance.
        </p>
        <p>
          Significant changes will be communicated via email or platform
          notification.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact">
        <p className="mb-4">
          For questions about this policy:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Email:</strong>{" "}
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

export default AcceptableUse;
