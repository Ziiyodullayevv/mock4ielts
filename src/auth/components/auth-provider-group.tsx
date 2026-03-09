import { AuthProviderButton } from './auth-provider-button';
import { AppleIcon, EmailIcon, GoogleIcon } from './auth-provider-icons';

type AuthProviderGroupProps = {
  onEmailClick: () => void;
};

export function AuthProviderGroup({ onEmailClick }: AuthProviderGroupProps) {
  return (
    <div className="flex w-full flex-col items-center gap-5 pt-10 max-lg:gap-6 max-lg:pt-6">
      <AuthProviderButton icon={<GoogleIcon />}>Continue with Google</AuthProviderButton>
      <AuthProviderButton icon={<AppleIcon />}>Continue with Apple</AuthProviderButton>
      <AuthProviderButton icon={<EmailIcon />} onClick={onEmailClick}>
        Continue with Email
      </AuthProviderButton>

      <div className="flex w-full items-center py-1 text-sm text-white opacity-70 before:mr-2 before:h-px before:w-1/2 before:bg-white after:ml-2 after:h-px after:w-1/2 after:bg-white max-lg:text-xs">
        <span className="px-2 leading-4">&amp;</span>
      </div>

      <div className="w-full">
        <input
          className="flex h-12 w-full rounded-lg border border-white/12 bg-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-white/[0.64] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Enter invitation code (optional)"
          defaultValue=""
        />
      </div>
    </div>
  );
}
