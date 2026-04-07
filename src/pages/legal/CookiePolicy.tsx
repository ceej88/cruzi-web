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

const CookieTable: React.FC<{ rows: { name: string; purpose: string; duration: string }[] }> = ({ rows }) => (
  <div className="overflow-x-auto mb-6">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border bg-muted/30">
          <th className="text-left py-2 px-3 font-semibold text-foreground">Cookie</th>
          <th className="text-left py-2 px-3 font-semibold text-foreground">Purpose</th>
          <th className="text-left py-2 px-3 font-semibold text-foreground">Duration</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-border">
            <td className="py-2 px-3 text-muted-foreground font-mono text-xs">{row.name}</td>
            <td className="py-2 px-3 text-muted-foreground">{row.purpose}</td>
            <td className="py-2 px-3 text-muted-foreground">{row.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CookiePolicy: React.FC = () => {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="7 April 2026">
      <p className="text-base text-muted-foreground mb-10 leading-relaxed border-l-4 border-[#7C3AED] pl-4 py-2 bg-primary/5 rounded-r-lg">
        This Cookie Policy explains how Cruzi ("we", "us", "our") uses cookies and similar technologies when you visit
        our platform. It explains what these technologies are and why we use them, as well as your rights to control
        our use of them.
      </p>

      <Section number="1" title="What Are Cookies?">
        <p className="text-muted-foreground">
          Cookies are small text files placed on your computer or mobile device when you visit a website. They are
          widely used to make websites work more efficiently and to provide information to website owners.
        </p>
        <p className="text-muted-foreground">
          Cookies set by the website operator are called "first-party cookies". Cookies set by parties other than the
          website operator are called "third-party cookies".
        </p>
      </Section>

      <Section number="2" title="Types of Cookies We Use">
        <h3 className="font-semibold text-foreground mb-3">Essential Cookies (Required)</h3>
        <p className="text-muted-foreground mb-3">
          These cookies are necessary for the Platform to function. They cannot be disabled.
        </p>
        <CookieTable rows={[
          { name: "sb-access-token", purpose: "Authentication session", duration: "Session" },
          { name: "sb-refresh-token", purpose: "Session refresh", duration: "7 days" },
          { name: "cruzi_cookie_consent", purpose: "Store your cookie preferences", duration: "1 year" },
        ]} />

        <h3 className="font-semibold text-foreground mt-4 mb-3">Analytics Cookies (Optional)</h3>
        <p className="text-muted-foreground mb-3">
          These cookies help us understand how visitors interact with the Platform by collecting and reporting
          information anonymously.
        </p>
        <CookieTable rows={[
          { name: "_ga", purpose: "Google Analytics visitor ID", duration: "2 years" },
          { name: "_gid", purpose: "Google Analytics session", duration: "24 hours" },
        ]} />

        <h3 className="font-semibold text-foreground mt-4 mb-2">Marketing Cookies (Optional)</h3>
        <p className="text-muted-foreground">
          We currently do not use marketing cookies, but reserve the right to implement them with proper consent
          mechanisms.
        </p>
      </Section>

      <Section number="3" title="Third-Party Cookies">
        <p className="text-muted-foreground mb-3">Some cookies are placed by third-party services that appear on our pages:</p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Provider</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Purpose</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">More Info</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-muted-foreground">Stripe</td>
                <td className="py-2 px-3 text-muted-foreground">Payment processing and fraud detection</td>
                <td className="py-2 px-3"><a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Cookies</a></td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-muted-foreground">Google</td>
                <td className="py-2 px-3 text-muted-foreground">Maps, Analytics, AI services</td>
                <td className="py-2 px-3"><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section number="4" title="Local Storage">
        <p className="text-muted-foreground mb-3">In addition to cookies, we use browser local storage to:</p>
        <BulletList items={[
          "Store your theme preferences (light/dark mode)",
          "Cache certain data for faster loading",
          "Remember your cookie consent choice",
        ]} />
        <p className="text-muted-foreground mt-3">
          Local storage data remains on your device until you clear your browser data.
        </p>
      </Section>

      <Section number="5" title="Managing Your Cookie Preferences">
        <h3 className="font-semibold text-foreground mb-2">On Our Platform</h3>
        <p className="text-muted-foreground mb-3">When you first visit Cruzi, you will see a cookie consent banner. You can:</p>
        <BulletList items={[
          "Accept all cookies",
          "Accept essential cookies only",
          "Customise your preferences for each category",
        ]} />
        <p className="text-muted-foreground mt-3 mb-4">
          To change your preferences later, clear your browser cookies and revisit the site, or contact us.
        </p>

        <h3 className="font-semibold text-foreground mb-2">Browser Settings</h3>
        <p className="text-muted-foreground mb-3">Most browsers allow you to manage cookies through settings:</p>
        <BulletList items={[
          <><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chrome</a></>,
          <><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firefox</a></>,
          <><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></>,
          <><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></>,
        ]} />
        <p className="text-muted-foreground text-sm mt-3">
          Note: Disabling essential cookies may prevent you from using certain features of the Platform.
        </p>
      </Section>

      <Section number="6" title="Do Not Track Signals">
        <p className="text-muted-foreground mb-3">
          Some browsers have a "Do Not Track" feature that signals to websites that you do not want to have your
          online activity tracked.
        </p>
        <p className="text-muted-foreground">
          Currently, there is no uniform standard for how websites should respond to these signals. We do not
          currently respond to Do Not Track signals but will update this policy if a standard is established.
        </p>
      </Section>

      <Section number="7" title="Updates to This Policy">
        <p className="text-muted-foreground">
          We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated
          "Last updated" date. For significant changes, we may also notify you via email or a notice on the Platform.
        </p>
      </Section>

      <Section number="8" title="Contact Us">
        <p className="text-muted-foreground mb-3">If you have questions about our use of cookies:</p>
        <BulletList items={[
          <><strong>Email:</strong> <a href="mailto:privacy@cruzi.co.uk" className="text-primary hover:underline">privacy@cruzi.co.uk</a></>,
          <><strong>Address:</strong> Cruzi Ltd, 3rd Floor, 86-90 Paul Street, London, England, EC2A 4NE</>,
        ]} />
      </Section>
    </LegalPageLayout>
  );
};

export default CookiePolicy;
