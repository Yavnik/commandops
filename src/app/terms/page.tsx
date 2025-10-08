import { SystemStatusBar } from '@/components/system-status-bar';

export default function TermsOfService() {
  return (
    <>
      <SystemStatusBar />
      <main className="min-h-screen bg-secondary/70 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Terms of Service
            </h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              <p className="text-foreground/80 leading-relaxed mb-8">
                <em>Effective date: 29 July 2025</em>
              </p>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Acceptance
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  By accessing Command Ops you agree to these Terms of Service
                  (&quot;Terms&quot;). If you do not agree, do not use the app.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Eligibility
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  You must be at least <strong>13 years old</strong>. You are
                  responsible for any activity that occurs under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Your Content
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  &quot;Content&quot; means all data you input or upload
                  (Quests, Missions, notes, etc.). You retain ownership of your
                  Content. You grant us a worldwide, non-exclusive license to
                  host and process it solely to operate the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Acceptable Use
                </h2>
                <p className="text-foreground/80 leading-relaxed mb-3">
                  You agree not to:
                </p>
                <ul className="text-foreground/80 leading-relaxed space-y-2">
                  <li>• Break the law or infringe others&apos; rights.</li>
                  <li>
                    • Upload malware or attempt unauthorized access to Command
                    Ops.
                  </li>
                  <li>
                    • Reverse-engineer or resell the service without permission.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Suspension & Termination
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  We may suspend or terminate your account if you violate these
                  Terms or create risk for us or other users. You may delete
                  your account at any time in settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Dispute Resolution & Governing Law
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  These Terms are governed by the laws of the Republic of India
                  without regard to conflict-of-law principles. Any dispute will
                  be brought exclusively in the competent courts of India, and
                  you consent to personal jurisdiction there. You waive any
                  right to participate in a class or representative action, and
                  agree that disputes will be resolved on an individual basis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Disclaimer of Warranties
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Command Ops is provided &quot;AS IS&quot; and &quot;AS
                  AVAILABLE.&quot; To the fullest extent permitted by law, we
                  disclaim all warranties, express or implied, including fitness
                  for a particular purpose and non-infringement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Limitation of Liability
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Our total liability for any claim arising out of or relating
                  to these Terms or the service will not exceed the total amount
                  you have paid to us in the 30 days immediately preceding the
                  event giving rise to the claim. We are not liable for
                  indirect, incidental, or consequential damages.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Indemnity
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  You agree to indemnify and hold us harmless from any
                  third-party claims arising out of your misuse of Command Ops
                  or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. Changes to the Service
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  We may modify or discontinue features at any time without
                  liability.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  11. Changes to Terms
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  We may update these Terms without prior notice. Continued use
                  after updated Terms take effect constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  12. Contact
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Questions? Email <strong>contact@commandops.app</strong>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
