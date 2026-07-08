import Link from 'next/link';

import LegalPageLayout, { LegalSection } from '@components/LandingPage/LegalPageLayout';

const Privacy = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="2026-07-08">
      <LegalSection title="Overview">
        <p>
          Kharji (&quot;we&quot;, &quot;us&quot;, or &quot;the Service&quot;) is a personal finance tracker available at{' '}
          <a href="https://kharji.app" className="text-blue hover:underline">
            kharji.app
          </a>
          . This policy explains what information we collect, how we use it, and the choices you have. We collect only
          what is needed to run the Service — nothing more.
        </p>
      </LegalSection>

      <LegalSection title="Information We Collect">
        <p>
          <strong className="text-text-primary">Account information.</strong> When you sign up we collect your email
          address, your name (optional), and a password. Passwords are never stored in plain text — they are hashed with
          an industry-standard key derivation function (PBKDF2) before being saved.
        </p>
        <p>
          <strong className="text-text-primary">Financial data you enter.</strong> Expenses, income entries, assets,
          tags, categories, and related notes that you add to your account. This data exists solely so the Service can
          work for you. We never sell it, share it with advertisers, or use it for any purpose other than providing the
          Service to you.
        </p>
        <p>
          <strong className="text-text-primary">Usage analytics.</strong> We use Vercel Analytics to collect anonymous,
          aggregated page-view statistics. This does not use cookies and does not track you across sites.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use a single, essential session cookie to keep you signed in. We do not use advertising or tracking
          cookies.
        </p>
      </LegalSection>

      <LegalSection title="How We Use Your Information">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            To provide the Service: storing and displaying your financial data, calculating summaries and reports.
          </li>
          <li>To authenticate you and keep your account secure.</li>
          <li>
            To send transactional emails (such as a welcome email, password reset links, and periodic financial
            reports). You can unsubscribe from report emails at any time via the link in the email or from Settings.
          </li>
          <li>To fetch exchange rates so amounts can be shown in your preferred currency.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Where Your Data Lives">
        <p>
          Your data is stored in a Turso (libSQL) database and the application is hosted on Vercel. Transactional emails
          are delivered through Resend. These providers process data on our behalf and are bound by their own privacy
          and security commitments.
        </p>
      </LegalSection>

      <LegalSection title="Data Sharing">
        <p>
          We do not sell, rent, or trade your personal information. We share data only with the infrastructure providers
          listed above, to the extent necessary to operate the Service, or if required by law.
        </p>
      </LegalSection>

      <LegalSection title="Your Rights and Choices">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-text-primary">Export.</strong> You can export all of your data at any time from
            Settings.
          </li>
          <li>
            <strong className="text-text-primary">Delete.</strong> You can permanently delete your account and all
            associated data from Settings. Deletion is immediate and irreversible.
          </li>
          <li>
            <strong className="text-text-primary">Correct.</strong> You can edit or delete any entry you have created
            directly in the app.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Data Retention">
        <p>
          We keep your data for as long as your account exists. When you delete your account, all of your data —
          expenses, income, assets, tags, and account details — is permanently removed from our database.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          All traffic to the Service is encrypted over HTTPS. Passwords are hashed and salted. Access to your data
          requires authentication with your credentials. No method of transmission or storage is 100% secure, but we
          take reasonable measures to protect your information.
        </p>
      </LegalSection>

      <LegalSection title="Children's Privacy">
        <p>
          The Service is not directed at children under 13, and we do not knowingly collect personal information from
          them.
        </p>
      </LegalSection>

      <LegalSection title="Changes to This Policy">
        <p>
          We may update this policy from time to time. If we make material changes, we will update the &quot;Last
          updated&quot; date above and, where appropriate, notify you by email.
        </p>
      </LegalSection>

      <LegalSection title="More">
        <p>
          See also our{' '}
          <Link href="/terms" className="text-blue hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default Privacy;
