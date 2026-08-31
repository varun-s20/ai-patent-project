import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal/company";
import { Clause, Highlight, LegalPage, List } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Patent Register",
  description:
    "What we collect, who processes it, where it is stored, how long we keep it, and how to have it deleted.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="What we collect, who else touches it, where it lives, how long we keep it, and how to get it deleted. Written to be read, not to be skipped."
    >
      <Clause n={1} title="Who we are">
        <p>
          {LEGAL.brand} is operated by {LEGAL.entity}, a company registered in Australia. We
          handle personal information in accordance with the Privacy Act 1988 (Cth) and the
          Australian Privacy Principles.
        </p>
        <p>
          Privacy questions, access requests, and deletion requests go to{" "}
          <a className="text-ink underline underline-offset-2" href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </a>
          .
        </p>
      </Clause>

      <Clause n={2} title="What we collect">
        <List
          items={[
            <>
              <span className="text-ink">Your invention.</span> The title, industry, problem
              statement, and description you enter.
            </>,
            <>
              <span className="text-ink">Contact details.</span> Your name, email address, and
              phone number if you provide it.
            </>,
            <>
              <span className="text-ink">Account details.</span> Your email address and a
              hashed password, if you create an account.
            </>,
            <>
              <span className="text-ink">Payment details.</span> Handled entirely by Stripe.
              We receive a confirmation that payment succeeded. We never see or store your
              card number.
            </>,
            <>
              <span className="text-ink">Usage information.</span> Which page you arrived
              from, and basic technical data your browser sends.
            </>,
          ]}
        />
        <p>
          If you begin filling in the form and do not complete payment, what you have typed
          may already have been saved. You can ask us to delete it at any time.
        </p>
      </Clause>

      <Clause n={3} title="Why we collect it">
        <List
          items={[
            "To produce your report and certificate, which is the service you are paying for",
            "To send you those documents and to contact you about your submission",
            "To take payment and keep the records we are required to keep",
            "To forward your report to a patent attorney, but only if you ask us to and only to an attorney you choose",
            "To understand how people find the service, so we can improve it",
          ]}
        />
        <p>
          We do not sell personal information, and we do not use your invention for
          advertising or profiling.
        </p>
      </Clause>

      <Clause n={4} title="Who else processes your information">
        <p>
          We use a small number of service providers. This is all of them, and what each one
          receives.
        </p>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[34rem] text-left text-[14.5px]">
            <thead>
              <tr className="border-b border-line bg-paper/70">
                <th className="px-4 py-3 font-medium text-ink">Provider</th>
                <th className="px-4 py-3 font-medium text-ink">What it receives</th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              <tr className="border-b border-line">
                <td className="px-4 py-3 text-ink">{LEGAL.aiProvider}</td>
                <td className="px-4 py-3">
                  The invention text only. Not your name, email, or phone number. Contractually
                  prohibited from training AI models on it.
                </td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-4 py-3 text-ink">Supabase</td>
                <td className="px-4 py-3">
                  Database and file storage. Holds your submission, your account, and your
                  generated documents.
                </td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-4 py-3 text-ink">Stripe</td>
                <td className="px-4 py-3">Payment processing. Your card details go to Stripe, not to us.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-ink">Google (Gmail)</td>
                <td className="px-4 py-3">
                  Sends your report and certificate to you as email attachments.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Some of these providers store or process information outside Australia. We remain
          accountable for how they handle it, and we choose providers whose terms require them
          to protect it.
        </p>
      </Clause>

      <Clause n={5} title="Comparison against other submissions">
        <p>
          To tell you whether something similar has come through this service before, we
          compare the text of your submission against earlier submissions inside our own
          database. This runs automatically and returns only counts.
        </p>
        <p>
          <span className="text-ink">
            Your submission is never shown to another user, and no other submitter is ever
            identified to you.
          </span>{" "}
          The comparison happens entirely within our database and no text is sent anywhere for
          it.
        </p>
      </Clause>

      <Clause n={6} title="How long we keep it, and how to delete it">
        <Highlight>
          <p className="font-medium">You can have your submission deleted at any time.</p>
          <p className="mt-2">
            Email{" "}
            <a className="underline underline-offset-2" href={`mailto:${LEGAL.contactEmail}`}>
              {LEGAL.contactEmail}
            </a>{" "}
            from the address you submitted with, and we will delete your submission, your
            report, and your certificate within 30 days.
          </p>
        </Highlight>
        <p>
          Otherwise we keep your submission for as long as you have an account with us, so
          that you can access your documents again. Records we are legally required to keep,
          such as transaction records for tax purposes, are kept for as long as the law
          requires and no longer.
        </p>
        <p>
          Deleting your submission also removes it from the anonymous comparison described in
          clause 5.
        </p>
      </Clause>

      <Clause n={7} title="Your rights">
        <List
          items={[
            "Ask for a copy of the personal information we hold about you",
            "Ask us to correct it if it is wrong",
            "Ask us to delete your submission and your account",
            "Withdraw consent to any optional use, such as an attorney referral",
          ]}
        />
        <p>
          Email us and we will respond within 30 days. There is no charge for a reasonable
          request.
        </p>
      </Clause>

      <Clause n={8} title="Security">
        <p>
          Traffic to and from the site is encrypted in transit. Your submission is stored in a
          database with access controls that restrict each account to its own records, and
          generated documents are held in private storage that is not publicly reachable.
        </p>
        <p>
          No system is perfectly secure. If a data breach occurs that is likely to cause you
          serious harm, we will notify you and the Office of the Australian Information
          Commissioner, as the Notifiable Data Breaches scheme requires.
        </p>
      </Clause>

      <Clause n={9} title="Cookies">
        <p>
          We use cookies that are necessary for the site to work, such as keeping you signed
          in. We do not use cookies to build advertising profiles.
        </p>
      </Clause>

      <Clause n={10} title="Complaints">
        <p>
          If you think we have mishandled your personal information, email us first and we
          will try to resolve it. If you are not satisfied, you can complain to the Office of
          the Australian Information Commissioner at{" "}
          <a
            className="text-ink underline underline-offset-2"
            href="https://www.oaic.gov.au"
            target="_blank"
            rel="noopener noreferrer"
          >
            oaic.gov.au
          </a>
          .
        </p>
      </Clause>

      <Clause n={11} title="Changes">
        <p>
          We may update this policy. The current version is always the one published here, and
          material changes will be reflected in the &ldquo;last updated&rdquo; date above. Our{" "}
          <Link className="text-ink underline underline-offset-2" href="/terms">
            Terms of Service
          </Link>{" "}
          cover ownership of your invention and your report.
        </p>
      </Clause>
    </LegalPage>
  );
}
