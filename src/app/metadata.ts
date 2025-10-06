import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://rukh-ui.netlify.app'),
  title: 'My Faithful Assistant',
  description: 'Build your own assistant in a few seconds.',

  keywords: ['Web3', 'Next.js', 'Ethereum', 'DApp', 'Blockchain', 'Wallet'],
  authors: [{ name: 'Julien', url: 'https://github.com/julienbrg' }],

  openGraph: {
    title: 'My Faithful Assistant',
    description: 'Build your own assistant in a few seconds.',
    url: 'https://rukh-ui.netlify.app',
    siteName: 'Rukh AI',
    images: [
      {
        url: '/huangshan.png',
        width: 1200,
        height: 630,
        alt: 'My Faithful Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'My Faithful Assistant',
    description: 'Build your own assistant in a few seconds.',
    images: ['/huangshan.png'],
    creator: '@julienbrg',
  },

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

  verification: {
    google: 'your-google-site-verification',
  },
}
