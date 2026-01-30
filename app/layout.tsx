import type { Metadata, Viewport } from 'next'

import Analytics from '@/components/elements/Analytics'
import DynamicFavicon from '@/components/elements/DynamicFavicon'
import GoogleAdsense from '@/components/elements/GoogleAdsense'
import Layouts from '@/components/layouts/index'
import BrandingProvider from '@/components/providers/BrandingProvider'
import NextAuthSessionProvider from '@/components/providers/SessionProvider'
import { GeistSans } from 'geist/font/sans'
import NextTopLoader from 'nextjs-toploader'

import ThemeProviderContext from '../stores/theme'
import './globals.css'

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  }
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <GoogleAdsense />
      <body className={GeistSans.className}>
        <NextTopLoader
          color="#05b6d3"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #05b6d3,0 0 5px #45c6c0"
        />
        <NextAuthSessionProvider>
          <BrandingProvider>
            <DynamicFavicon />
            <ThemeProviderContext>
              <Layouts>{children}</Layouts>
            </ThemeProviderContext>
          </BrandingProvider>
        </NextAuthSessionProvider>

        {/* Error suppression script for browser extensions */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress browser extension connection errors
              const originalError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                if (
                  message.includes('Could not establish connection') ||
                  message.includes('Receiving end does not exist') ||
                  message.includes('Extension context invalidated') ||
                  message.includes('runtime.lastError')
                ) {
                  return; // Suppress extension-related errors
                }
                originalError.apply(console, args);
              };
              
              // Suppress unhandled promise rejections from extensions
              window.addEventListener('unhandledrejection', function(event) {
                const message = event.reason?.message || '';
                if (
                  message.includes('Could not establish connection') ||
                  message.includes('Extension context invalidated')
                ) {
                  event.preventDefault();
                }
              });
            `
          }}
        />

        <Analytics />
      </body>
    </html>
  )
}
