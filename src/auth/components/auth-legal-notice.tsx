import Link from 'next/link';

export function AuthLegalNotice() {
  return (
    <div className="flex flex-col items-start justify-center p-0 text-center">
      <p className="text-left text-xs text-white/[0.64]">
        By clicking &quot;Continue with Google,&quot; &quot;Continue with Apple,&quot; or
        &quot;Continue with Email,&quot; you confirm that you&apos;ve read and agree to
        Vidu&apos;s{' '}
        <Link
          href="/terms"
          target="_blank"
          data-google-interstitial="false"
          className="text-white underline underline-offset-4"
        >
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          target="_blank"
          data-google-interstitial="false"
          className="text-white underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
