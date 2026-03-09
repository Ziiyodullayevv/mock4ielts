import { AuthLayout } from '@/src/layouts/auth';

type Props = {
  children: React.ReactNode;
};

export default function Page({ children }: Props) {
  return <AuthLayout>{children}</AuthLayout>;
}
