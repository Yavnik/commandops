import { SystemStatusBar } from '@/components/system-status-bar';

export default function PrivacyPolicy() {
  return (
    <>
      <SystemStatusBar />
      <main className="min-h-screen bg-secondary/70 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Privacy Policy
            </h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              <p className="text-foreground/80 leading-relaxed mb-8">
                <em>Last updated: 29 July 2025</em>
              </p>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Who We Are
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Command Ops (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;)
                  is an independent software project that helps users manage
                  tasks and improve focus. We have no formal corporate entity.
                  Direct all privacy questions to{' '}
                  <strong>contact@commandops.app</strong>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Scope
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  This Privacy Policy explains how we collect, use, and share
                  your data when you access the Command Ops web or mobile app.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Minimum Age
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  You must be <strong>13 years or older</strong> to create an
                  account. By signing up, you confirm you meet this requirement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. What We Collect
                </h2>
                <ul className="text-foreground/80 leading-relaxed space-y-2">
                  <li>
                    • Account data – email address, username/handle, hashed
                    password.
                  </li>
                  <li>
                    • Task data – the Quests, Missions, and related metadata you
                    enter.
                  </li>
                  <li>
                    • Usage & analytics data – event logs and pseudonymous
                    identifiers captured via PostHog.
                  </li>
                  <li>
                    • Device data – browser type, OS, and approximate location
                    (derived from IP) for security and performance monitoring.
                  </li>
                  <li>
                    • Communication data – emails you send us and notification
                    preferences.
                  </li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  We do <strong>not</strong> collect payment, advertising, or
                  biometric data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. How We Use Data
                </h2>
                <ul className="text-foreground/80 leading-relaxed space-y-2">
                  <li>• Operate and secure the service.</li>
                  <li>
                    • Provide in-app metrics (e.g., success rate, estimate
                    accuracy).
                  </li>
                  <li>
                    • Send transactional or product-update emails. Marketing
                    emails are optional and include an unsubscribe link.
                  </li>
                  <li>• Improve features through aggregated analytics.</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  If we ever introduce third-party AI or payments, we will
                  update this policy before any new data sharing occurs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Legal Bases (GDPR)
                </h2>
                <ul className="text-foreground/80 leading-relaxed space-y-2">
                  <li>• Performance of a contract – providing the app.</li>
                  <li>
                    • Legitimate interests – security, analytics, customer
                    support.
                  </li>
                  <li>• Consent – marketing emails.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Data Retention
                </h2>
                <ul className="text-foreground/80 leading-relaxed space-y-2">
                  <li>
                    • Active accounts: data kept until you delete it or close
                    the account.
                  </li>
                  <li>
                    • Deleted quests/missions: immediately removed from the live
                    app and fully purged from backups within{' '}
                    <strong>30 days</strong>.
                  </li>
                  <li>
                    • Closed accounts: all personal data deleted or anonymized
                    within <strong>30 days</strong> of confirmation.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Your Rights
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Depending on your jurisdiction, you may have rights to access,
                  correct, delete, or export your data. Contact us at the email
                  above; we will respond within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Security
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  All traffic is encrypted (HTTPS/TLS). Data resides on our
                  self-hosted VPS with industry-standard firewall, OS-level
                  encryption, and nightly backups.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. International Transfers
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Servers are currently located in the European Union. By using
                  Command Ops you consent to transferring your data to this
                  location.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  11. Changes to This Policy
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  We may update this Privacy Policy without prior notice.
                  Continued use after updated Privacy Policy take effect
                  constitutes acceptance.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
