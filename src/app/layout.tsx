
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AppProvider } from '@/contexts/AppContext';
import { FloatingChat } from '@/components/chat';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { DepositTestButton } from '@/components/dev/DepositTestPanel';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'),
  title: {
    default: 'PrimeRent — เช่าที่พักที่ใช่ เริ่มต้นที่นี่',
    template: '%s | PrimeRent',
  },
  description: 'คอนโด บ้าน อพาร์ตเมนต์ กว่า 15,000 ประกาศทั่วไทย เช่าอย่างเดียว ง่าย จบในที่เดียว พร้อมสัญญาเช่าดิจิทัลและระบบชำระเงินออนไลน์',
  keywords: ['เช่าที่พัก', 'คอนโดเช่า', 'บ้านเช่า', 'PrimeRent', 'อสังหาริมทรัพย์', 'ห้องเช่ากรุงเทพ'],
  authors: [{ name: 'PrimeRent' }],
  creator: 'PrimeRent',
  publisher: 'PrimeRent',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://primerent.app',
    siteName: 'PrimeRent',
    title: 'PrimeRent — เช่าที่พักที่ใช่ เริ่มต้นที่นี่',
    description: 'คอนโด บ้าน อพาร์ตเมนต์ กว่า 15,000 ประกาศทั่วไทย พร้อมสัญญาเช่าดิจิทัล',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PrimeRent Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrimeRent — เช่าที่พักที่ใช่ เริ่มต้นที่นี่',
    description: 'คอนโด บ้าน อพาร์ตเมนต์ กว่า 15,000 ประกาศทั่วไทย',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PrimeRent',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A56DB',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sarabun:wght@400;600;700;800&family=Kanit:wght@300;400;500;600;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased font-kanit min-h-screen flex flex-col" suppressHydrationWarning>
        <ErrorBoundary>
          <NotificationProvider>
            <AppProvider>
              <FirebaseClientProvider>
                <AuthProvider>
                  <AppShell>
                    <div className="relative w-full">
                      {children}
                    </div>
                    <FloatingChat />
                    <DepositTestButton />
                  </AppShell>
                </AuthProvider>
              </FirebaseClientProvider>
            </AppProvider>
          </NotificationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
