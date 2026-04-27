import { AuthLayout } from '@/src/layouts/auth';
import { ThemeProvider } from '@/src/components/providers/theme-provider';
import { RouteProviders } from '@/src/components/providers/route-providers';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      <RouteProviders>
        <AuthLayout>{children}</AuthLayout>
      </RouteProviders>
    </ThemeProvider>
  );
}
