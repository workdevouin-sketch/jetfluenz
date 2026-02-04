import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  themeColor: '#1F07BA',
  width: 'device-width',
  initialScale: 1,
}

export const metadata = {
  metadataBase: new URL('https://jetfluenz.com'),
  title: {
    default: 'Jetfluenz — Micro-Influencer Marketing Platform',
    template: '%s | Jetfluenz'
  },
  description: 'Connect with micro-influencers (<10K followers) to run affordable, targeted marketing campaigns. The best platform for startups to hire authentic creators.',
  keywords: [
    'micro influencer platform',
    'influencer marketing for startups',
    'hire micro influencers',
    'creator marketplace India',
    'brand collaboration tool',
    'nano influencer marketing',
    'cost effective influencer marketing',
    'find instagram influencers',
    'influencer engagement calculator'
  ],
  authors: [{ name: 'Jetfluenz Team' }],
  creator: 'Jetfluenz',
  publisher: 'Jetfluenz',
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
    title: 'Jetfluenz — The #1 Micro-Influencer Marketplace',
    description: 'Launch authentic campaigns with micro-influencers. High engagement, low cost. Join the waitlist today.',
    url: 'https://jetfluenz.com',
    siteName: 'Jetfluenz',
    images: [
      {
        url: '/card1-hero.png', // Using an existing hero image as OG image for now
        width: 800,
        height: 600,
        alt: 'Jetfluenz Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jetfluenz — Micro-Influencer Marketing',
    description: 'Connect with micro-influencers for authentic, affordable campaigns.',
    images: ['/card1-hero.png'],
    creator: '@jetfluenz', // Assuming handle
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo-new.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  }
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {children}
        </div>
      </body>
    </html>
  )
}