import { cn } from '@/src/lib/utils';

import { AuthProviderButton } from './auth-provider-button';
import { AppleIcon, EmailIcon, GoogleIcon } from './auth-provider-icons';

type AuthProviderGroupProps = {
  errorMessage?: string | null;
  infoMessage?: string | null;
  invitationCode: string;
  isApplePending?: boolean;
  isGooglePending?: boolean;
  onAppleClick: () => void;
  onEmailClick: () => void;
  onGoogleClick: () => void;
  onInvitationCodeChange: (value: string) => void;
};

export function AuthProviderGroup({
  errorMessage,
  infoMessage,
  invitationCode,
  isApplePending = false,
  isGooglePending = false,
  onAppleClick,
  onEmailClick,
  onGoogleClick,
  onInvitationCodeChange,
}: AuthProviderGroupProps) {
  const isBusy = isApplePending || isGooglePending;

  return (
    <div className="flex w-full flex-col items-center gap-5 pt-10 max-lg:gap-6 max-lg:pt-6">
      <AuthProviderButton
        icon={<GoogleIcon />}
        loading={isGooglePending}
        onClick={onGoogleClick}
      >
        Continue with Google
      </AuthProviderButton>

      <AuthProviderButton icon={<AppleIcon />} loading={isApplePending} onClick={onAppleClick}>
        Continue with Apple
      </AuthProviderButton>

      <AuthProviderButton icon={<EmailIcon />} disabled={isBusy} onClick={onEmailClick}>
        Continue with Email
      </AuthProviderButton>

      <div className="flex w-full items-center py-1 text-sm text-white opacity-70 before:mr-2 before:h-px before:w-1/2 before:bg-white after:ml-2 after:h-px after:w-1/2 after:bg-white max-lg:text-xs">
        <span className="px-2 leading-4">&amp;</span>
      </div>

      <div className="w-full">
        <input
          className={cn(
            'flex h-12 w-full rounded-lg border border-white/12 bg-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-white/[0.64] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
            errorMessage && 'border-red-400/60'
          )}
          placeholder="Enter invitation code (optional)"
          value={invitationCode}
          onChange={(event) => onInvitationCodeChange(event.target.value)}
        />
      </div>

      {errorMessage ? (
        <p className="w-full text-left text-sm text-red-300">{errorMessage}</p>
      ) : null}

      {infoMessage ? (
        <p className="w-full text-left text-sm text-white/64">{infoMessage}</p>
      ) : null}
    </div>
  );
}
