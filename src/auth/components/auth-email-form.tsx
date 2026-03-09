type AuthEmailFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onNext: () => void;
};

export function AuthEmailForm({ email, onEmailChange, onNext }: AuthEmailFormProps) {
  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  return (
    <div className="flex w-full flex-col items-center gap-8 pt-10 max-lg:pt-6">
      <div className="w-full">
        <input
          type="email"
          className="flex h-12 w-full rounded-lg border border-white/12 bg-white/[0.08] px-6 py-2.5 text-sm text-white placeholder:text-white/[0.64] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Email address"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!isValidEmail}
        className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-white px-4 py-2 text-base font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
