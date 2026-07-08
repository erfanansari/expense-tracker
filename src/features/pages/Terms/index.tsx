import Link from 'next/link';

import LegalPageLayout, { LegalSection } from '@components/LandingPage/LegalPageLayout';

const Terms = () => {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="2026-07-08">
      <LegalSection title="Agreement">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of Kharji, the personal finance tracker available
          at{' '}
          <a href="https://kharji.app" className="text-blue hover:underline">
            kharji.app
          </a>{' '}
          (&quot;the Service&quot;). By creating an account or using the Service, you agree to these Terms. If you do
          not agree, please do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="The Service">
        <p>
          Kharji lets you track expenses, income, and assets, view reports and summaries, and convert amounts between
          currencies using third-party exchange rates. The Service is provided as-is and may change over time as
          features are added, modified, or removed.
        </p>
      </LegalSection>

      <LegalSection title="Your Account">
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide a valid email address to create an account.</li>
          <li>You are responsible for keeping your password secure and for all activity under your account.</li>
          <li>You must be at least 13 years old to use the Service.</li>
          <li>One person may not maintain accounts for the purpose of abusing or disrupting the Service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Your Data">
        <p>
          You own the financial data you enter into Kharji. We claim no rights over it beyond what is needed to store
          and display it back to you. You can export your data or permanently delete your account (and all of its data)
          at any time from Settings. How we handle your data is described in our{' '}
          <Link href="/privacy" className="text-blue hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the Service for any unlawful purpose.</li>
          <li>Attempt to gain unauthorized access to other users&apos; accounts or data.</li>
          <li>Interfere with or disrupt the Service, its servers, or its networks.</li>
          <li>Scrape, resell, or redistribute the Service or its data without permission.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Not Financial Advice">
        <p>
          Kharji is a record-keeping and visualization tool. Nothing in the Service — including summaries, reports,
          charts, or exchange-rate conversions — constitutes financial, investment, tax, or legal advice. Exchange rates
          are sourced from third parties and are provided for convenience; we do not guarantee their accuracy.
        </p>
      </LegalSection>

      <LegalSection title="Availability and Warranty Disclaimer">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind,
          express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that data will
          never be lost. We recommend exporting your data periodically.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Kharji and its operator shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising
          from your use of (or inability to use) the Service.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You may stop using the Service and delete your account at any time. We may suspend or terminate accounts that
          violate these Terms or that harm the Service or other users. Upon termination, your data is deleted as
          described in the Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="Changes to These Terms">
        <p>
          We may update these Terms from time to time. If we make material changes, we will update the &quot;Last
          updated&quot; date above and, where appropriate, notify you by email. Continued use of the Service after
          changes take effect constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="More">
        <p>
          How we handle your data is described in our{' '}
          <Link href="/privacy" className="text-blue hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default Terms;
