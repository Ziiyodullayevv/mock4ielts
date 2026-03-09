import { AuthCard, AuthCaptchaOverlay } from '../components';

export function AuthView() {
  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-end px-17.5 py-12 max-lg:px-12 max-md:justify-center max-md:px-4 max-md:py-24">
        <AuthCard />
      </div>

      <AuthCaptchaOverlay />
    </>
  );
}
