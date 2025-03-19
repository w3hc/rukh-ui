import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cover Letter Generator',
  description: 'Generate a personalized cover letter for your job applications',

  openGraph: {
    title: 'Cover Letter Generator',
    description: 'Generate a personalized cover letter for your job applications',
    url: 'https://rukh-ui.netlify.app/aeve',
    siteName: 'Cover Letter Generator',
    images: [
      {
        url: '/huangshan.png',
        width: 1200,
        height: 630,
        alt: 'Cover Letter Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cover Letter Generator',
    description: 'Generate a personalized cover letter for your job applications',
    images: ['/huangshan.png'],
  },
}

export default function AeveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
