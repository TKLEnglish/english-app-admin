import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import RootLayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'English App Admin',
  description: 'Admin panel for managing vocabulary, users, and categories.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <RootLayoutClient>{children}</RootLayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}
