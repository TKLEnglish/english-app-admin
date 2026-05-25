'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { ThemeProvider } from '@/components/theme-provider/ThemeProvider';
import { ThemeSwitcher } from '@/components/theme-switcher/ThemeSwitcher';
import { Button } from '@/components/button/Button';

const navItems = [
  { label: 'Vocabulary', route: '/vocabulary' },
  { label: 'Categories', route: '/category' },
  { label: 'Collections', route: '/collection' },
  { label: 'Users', route: '/users' },
  { label: 'UI Library', route: '/ui-library' },
];

const PUBLIC_ROUTES = ['/login'];

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const { token, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !token && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/login');
    }
  }, [token, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--text-secondary)',
        }}
      >
        Loading...
      </div>
    );
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  return (
    <ThemeProvider>
      {!isPublicRoute && token && (
        <Navbar brand="English App Admin" items={navItems}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <Button size="sm" variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </Navbar>
      )}
      {children}
    </ThemeProvider>
  );
}
