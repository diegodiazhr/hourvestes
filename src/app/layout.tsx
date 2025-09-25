import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'HourVest',
  description: 'Realiza un seguimiento de tus proyectos CAS de Bachillerato Internacional con facilidad.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            {children}
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
