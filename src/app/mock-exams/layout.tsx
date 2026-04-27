import { RouteProviders } from '@/src/components/providers/route-providers';

type Props = {
  children: React.ReactNode;
};

export default function MockExamLayout({ children }: Props) {
  return <RouteProviders>{children}</RouteProviders>;
}
