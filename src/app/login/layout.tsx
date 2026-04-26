import { AuthLayout } from '@/src/layouts/auth';
import { ThemeProvider } from '@/src/components/providers/theme-provider';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      <AuthLayout>{children}</AuthLayout>
    </ThemeProvider>
  );
}
