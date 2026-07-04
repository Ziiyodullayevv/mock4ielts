import { Logo } from '@/src/components/logo';

export function AuthBrandBadge() {
  return (
    <div className="h-16 w-16 mb-5 bg-[#04061e] flex justify-center items-center rounded-lg max-sm:h-14 max-sm:w-14 max-sm:mb-4">
      <Logo />
    </div>
  );
}
