import React from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";

const CookiePolicy: React.FC = () => {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="30 January 2026">
      <p className="text-lg text-muted-foreground mb-8">
        This Cookie Policy explains how Cruzi AI ("we", "us", "our") uses
        cookies and similar technologies when you visit our platform. It
        explains what these technologies are and why we use them, as well as
        your rights to control our use of them.
      </p>

      <LegalSection id="what-are-cookies" title="1. What Are Cookies?" defaultOpen>
        <p className="mb-4">
          Cookies are small text files that are placed on your computer or
          mobile device when you visit a website. They are widely used to make
          websites work more efficiently and to provide information to website
          owners.
        </p>
        <p className="mb-4">
          Cookies set by the website operator are called "first-party cookies".
          Cookies set by parties other than the website operator are called
          "third-party cookies".
        </p>
      </LegalSection>

      <LegalSection id="types" title="2. Types of Cookies We Use">
        <h4 className="font-semibold mb-2">Essential Cookies (Required)</h4>
        <p className="mb-4">
          These cookies are necessary for the Platform to function. They cannot
          be disabled.
        </p>
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Cookie</th>
              <th className="text-left py-2 pr-4">Purpose</th>
              <th className="text-left py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4">sb-access-token</td>
              <td className="py-2 pr-4">Authentication session</td>
              <td className="py-2">Session</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">sb-refresh-token</td>
              <td className="py-2 pr-4">Session refresh</td>
              <td className="py-2">7 days</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">cruzi_cookie_consent</td>
              <td className="py-2 pr-4">Store your cookie preferences</td>
              <td className="py-2">1 year</td>
            </tr>
          </tbody>
        </table>

        <h4 className="font-semibold mt-6 mb-2">Analytics Cookies (Optional)</h4>
        <p className="mb-4">
          These cookies help us understand how visitors interact with the
          Platform by collecting and reporting information anonymously.
        </p>
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Cookie</th>
              <th className="text-left py-2 pr-4">Purpose</th>
              <th className="text-left py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4">_ga</td>
              <td className="py-2 pr-4">Google Analytics visitor ID</td>
              <td className="py-2">2 years</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">_gid</td>
              <td className="py-2 pr-4">Google Analytics session</td>
              <td className="py-2">24 hours</td>
            </tr>
          </tbody>
        </table>

        <h4 className="font-semibold mt-6 mb-2">Marketing Cookies (Optional)</h4>
        <p className="mb-4">
          These cookies may be set through our Platform by advertising partners
          to build a profile of your interests.
        </p>
        <p className="text-sm text-muted-foreground">
          Note: We currently do not use marketing cookies, but reserve the right
          to implement them with proper consent mechanisms.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="3. Third-Party Cookies">
        <p className="mb-4">
          Some cookies are placed by third-party services that appear on our
          pages:
        </p>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Provider</th>
              <th className="text-left py-2 pr-4">Purpose</th>
              <th className="text-left py-2">More Info</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4">Stripe</td>
              <td className="py-2 pr-4">Payment processing & fraud detection</td>
              <td className="py-2">
                <a
                  href="https://stripe.com/cookies-policy/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Stripe Cookies
                </a>
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Google</td>
              <td className="py-2 pr-4">Maps, Analytics, AI services</td>
              <td className="py-2">
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Privacy
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </LegalSection>

      <LegalSection id="local-storage" title="4. Local Storage">
        <p className="mb-4">
          In addition to cookies, we use browser local storage to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Store your theme preferences (light/dark mode)</li>
          <li>Cache certain data for faster loading</li>
          <li>Remember your cookie consent choice</li>
        </ul>
        <p className="mt-4">
          Local storage data remains on your device until you clear your browser
          data.
        </p>
      </LegalSection>

      <LegalSection id="managing" title="5. Managing Your Cookie Preferences">
        <h4 className="font-semibold mb-2">On Our Platform</h4>
        <p className="mb-4">
          When you first visit Cruzi AI, you'll see a cookie consent banner. You
          can:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Accept all cookies</li>
          <li>Accept essential cookies only</li>
          <li>Customise your preferences for each category</li>
        </ul>
        <p className="mb-4">
          To change your preferences later, clear your browser cookies and
          revisit the site, or contact us.
        </p>

        <h4 className="font-semibold mt-6 mb-2">Browser Settings</h4>
        <p className="mb-4">
          Most browsers allow you to manage cookies through settings:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Note: Disabling essential cookies may prevent you from using certain
          features of the Platform.
        </p>
      </LegalSection>

      <LegalSection id="do-not-track" title="6. Do Not Track Signals">
        <p className="mb-4">
          Some browsers have a "Do Not Track" feature that signals to websites
          that you visit that you do not want to have your online activity
          tracked.
        </p>
        <p>
          Currently, there is no uniform standard for how websites should respond
          to these signals. We do not currently respond to Do Not Track signals
          but will update this policy if a standard is established.
        </p>
      </LegalSection>

      <LegalSection id="updates" title="7. Updates to This Policy">
        <p className="mb-4">
          We may update this Cookie Policy from time to time. Any changes will
          be posted on this page with an updated "Last updated" date.
        </p>
        <p>
          For significant changes, we may also notify you via email or a notice
          on the Platform.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="8. Contact Us">
        <p className="mb-4">
          If you have questions about our use of cookies:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:privacy@cruzi.app"
              className="text-primary hover:underline"
            >
              privacy@cruzi.app
            </a>
          </li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default CookiePolicy;
