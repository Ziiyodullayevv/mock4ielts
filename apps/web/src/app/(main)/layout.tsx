import { MainLayout } from '@/src/layouts/main';
import { RouteProviders } from '@/src/components/providers/route-providers';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <RouteProviders>
      <MainLayout>{children}</MainLayout>
    </RouteProviders>
  );
}
