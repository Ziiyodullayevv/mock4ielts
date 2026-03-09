import { MainLayout } from '@/src/layouts/main';

type Props = {
  children: React.ReactNode;
};

export default function Page({ children }: Props) {
  return <MainLayout>{children}</MainLayout>;
}
