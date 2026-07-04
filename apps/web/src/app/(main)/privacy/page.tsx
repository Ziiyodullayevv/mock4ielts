import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  description: 'Read how Mock4IELTS collects, uses, and protects your account and learning data.',
  path: '/privacy',
  title: 'Privacy Policy',
});

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-white sm:px-6 md:px-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-white/45">Legal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-8 text-sm leading-7 text-white/72 sm:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Information We Collect</h2>
            <p>
              We may collect account details, sign-in identifiers, practice activity, and basic
              technical data needed to keep the platform working reliably.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">How We Use Information</h2>
            <p>
              Your information is used to provide access, improve practice features, support your
              account, and maintain platform security and performance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Sharing and Protection</h2>
            <p>
              We do not share personal information except when required for service delivery,
              security, or legal compliance. Reasonable safeguards are used to protect stored data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p>
              For privacy-related questions or requests, contact the mock4ielts team through the
              support channels available on the platform.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
