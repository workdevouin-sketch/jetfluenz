import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Jetfluenz — Micro-Influencer Marketing Platform for Startups & Small Businesses',
  description: 'Jetfluenz connects micro-influencers (<10K followers) with startups and small businesses to run affordable, targeted marketing campaigns. Discover influencers, launch collaborations, and grow your brand.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  themeColor: '#1F07BA',
  viewport: 'width=device-width, initial-scale=1',
  keywords: [
    'micro influencer platform',
    'micro influencer marketing',
    'micro influencer marketplace',
    'hire micro influencers',
    'connect micro influencers with businesses',
    'micro influencer campaigns',
    'affordable influencer marketing',
    'influencer marketing for startups ',
    'influencer marketing for small business',
    'nano influencer marketing',
    'creator collaboration platform',
    'micro influencer discovery',
    'brand influencer partnerships',
    'startup influencer marketing tool',
    'micro influencer campaigns under 10k followers',
    'find micro influencers for brands',
    'cost effective influencer marketing',
    'influencer platform for India',
    'best micro influencer platform 2025',
    'micro influencer match for businesses',
    'collaborate with micro influencers',
    'small business influencer marketing platform',
    'micro influencer advertising tool',
    'influencer campaign automation for startups'
  ].join(', ')
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