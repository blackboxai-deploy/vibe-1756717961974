import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'CloudPro - Cloud Infrastructure Management',
  description: 'Professional cloud infrastructure management platform powered by Linode and Paystack',
  keywords: ['cloud', 'infrastructure', 'management', 'linode', 'paystack', 'hosting'],
  authors: [{ name: 'CloudPro Team' }],
  openGraph: {
    title: 'CloudPro - Cloud Infrastructure Management',
    description: 'Professional cloud infrastructure management platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right" 
            expand={false}
            richColors 
            closeButton
            duration={4000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}