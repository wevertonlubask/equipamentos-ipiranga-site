/**
 * Layout Raiz do Next.js
 * 
 * @description Layout principal que envolve toda a aplicação
 */

import type { Metadata } from 'next';
import { Inter, Oswald, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

// Configuração das fontes
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

// Metadata padrão
export const metadata: Metadata = {
  title: {
    default: 'Equipamentos Ipiranga | Musculação de Alta Performance desde 1969',
    template: '%s | Equipamentos Ipiranga',
  },
  description:
    'Fábrica de equipamentos de musculação de alta performance. Máquinas robustas e duráveis para academias profissionais. Desde 1969 fabricando qualidade.',
  keywords: [
    'equipamentos musculação',
    'máquinas academia',
    'fitness',
    'ipiranga fitness',
    'equipamentos academia',
    'musculação profissional',
    'equipamentos profissionais',
  ],
  authors: [{ name: 'Equipamentos Ipiranga' }],
  creator: 'Equipamentos Ipiranga',
  publisher: 'Equipamentos Ipiranga',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://equipamentosipiranga.com.br',
    siteName: 'Equipamentos Ipiranga',
    title: 'Equipamentos Ipiranga | Musculação de Alta Performance',
    description:
      'Fábrica de equipamentos de musculação de alta performance desde 1969.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Equipamentos Ipiranga - Musculação de Alta Performance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Equipamentos Ipiranga | Musculação de Alta Performance',
    description:
      'Fábrica de equipamentos de musculação de alta performance desde 1969.',
    images: ['/images/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://equipamentosipiranga.com.br',
  },
};

// Viewport configuration
export const viewport = {
  themeColor: '#DC2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-white antialiased">
        {children}
        
        {/* Sistema de notificações */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '12px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
