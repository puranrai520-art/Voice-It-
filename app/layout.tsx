import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#1e0052',
};

export const metadata: Metadata = {
  title: 'VoiceIt — College Complaint Management System',
  description: 'VoiceIt gives every student a direct line to college administration — transparent, trackable, and AI-powered.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VoiceIt',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'VoiceIt — College Complaint Management System',
    description: 'Submit, track, and resolve college complaints with AI assistance.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        elements: {
          organizationSwitcher: 'hidden',
          createOrganizationButton: 'hidden',
          organizationPreviewButton: 'hidden',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Favicon */}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" href="/icon-192x192.png" sizes="192x192" type="image/png" />

          {/* PWA manifest — required for Android install prompt */}
          <link rel="manifest" href="/manifest.json" />

          {/* Apple / iOS PWA */}
          <link rel="apple-touch-icon" href="/icon-512x512.png" />
          <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="VoiceIt" />

          {/* Android / Chrome PWA */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#1e0052" media="(prefers-color-scheme: dark)" />
          <meta name="theme-color" content="#1e0052" media="(prefers-color-scheme: light)" />
          <meta name="application-name" content="VoiceIt" />

          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          />

          {/* PWA Service Worker Registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function(reg) {
        // Store the install prompt event for use in UI
        window.addEventListener('beforeinstallprompt', function(e) {
          e.preventDefault();
          window.__pwaInstallPrompt = e;
          // Dispatch a custom event so UI components can react
          window.dispatchEvent(new CustomEvent('pwaInstallReady'));
        });
        window.addEventListener('appinstalled', function() {
          window.__pwaInstallPrompt = null;
          window.dispatchEvent(new CustomEvent('pwaInstalled'));
        });
      })
      .catch(function() {});
  });
}`,
            }}
          />
        </head>
        <body className="font-sans antialiased" suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
