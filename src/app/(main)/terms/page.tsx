export default function TermsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-white sm:px-6 md:px-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-white/45">Legal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          Terms of Use
        </h1>

        <div className="mt-8 space-y-8 text-sm leading-7 text-white/72 sm:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Use of the Platform</h2>
            <p>
              mock4ielts provides IELTS practice content, mock exams, and related learning tools.
              You agree to use the platform lawfully and not attempt to disrupt, copy, or misuse
              protected content or account systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Accounts and Access</h2>
            <p>
              You are responsible for activity under your account. Keep your login method secure
              and notify us if you believe your access has been compromised.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Content and Availability</h2>
            <p>
              We may improve, update, or remove features at any time. Practice content is provided
              for educational use and may be revised without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p>
              For account, billing, or legal questions, contact the mock4ielts team through the
              support channels provided on the platform.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
