import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { AuthProvider } from '../../components/auth/AuthProvider';

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </AuthProvider>
  );
}
