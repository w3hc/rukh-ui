import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Cover Letter Generator | Aeve',
  description: 'Generate a personalized cover letter for your job applications with AI assistance',

  openGraph: {
    title: 'AI Cover Letter Generator | Aeve',
    description:
      'Generate a personalized cover letter for your job applications with AI assistance',
    url: 'https://rukh-ui.netlify.app/aeve',
    siteName: 'Aeve - AI Cover Letter Generator',
    images: [
      {
        url: '/huangshan.png',
        width: 1200,
        height: 630,
        alt: 'AI Cover Letter Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Cover Letter Generator | Aeve',
    description:
      'Generate a personalized cover letter for your job applications with AI assistance',
    images: ['/huangshan.png'],
  },
}

export default function AeveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
