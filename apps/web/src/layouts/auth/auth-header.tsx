import { Logo } from '@/src/components/logo';

export function AuthHeader() {
  return (
    <header className="absolute ml-17.5 flex h-20 items-center max-lg:ml-5">
      <Logo variant="light" />
    </header>
  );
}
