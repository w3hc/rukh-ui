import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Batappli IA Alpha',
  description: 'Discutez avec Marc, votre assistant Batappli IA spécialisé en menuiserie',

  openGraph: {
    title: 'Batappli IA Alpha',
    description: 'Discutez avec Marc, votre assistant Batappli IA spécialisé en menuiserie',
    url: 'https://rukh-ui.netlify.app/menuiserie',
    siteName: 'Batappli IA Alpha',
    images: [
      {
        url: '/huangshan.png',
        width: 1200,
        height: 630,
        alt: 'Batappli IA Alpha',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Batappli IA Alpha',
    description: 'Discutez avec Marc, votre assistant Batappli IA spécialisé en menuiserie',
    images: ['/huangshan.png'],
  },
}

export default function MenuiserieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
