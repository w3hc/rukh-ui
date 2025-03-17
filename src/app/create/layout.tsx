import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Faithful Assistant',
  description: 'Build your own assistant in a few seconds.',

  openGraph: {
    title: 'My Faithful Assistant',
    description: 'Build your own assistant in a few seconds.',
    url: 'https://rukh-ui.netlify.app/create',
    siteName: 'My Faithful Assistant',
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
  },
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
