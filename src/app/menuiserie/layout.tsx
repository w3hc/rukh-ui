import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artisan Alpha Bois - Marie Assistante Commerciale',
  description: 'Discutez avec Marie, votre assistante commerciale spécialisée en menuiserie',

  openGraph: {
    title: 'Artisan Alpha Bois - Marie Assistante Commerciale',
    description: 'Discutez avec Marie, votre assistante commerciale spécialisée en menuiserie',
    url: 'https://rukh-ui.netlify.app/menuiserie',
    siteName: 'Artisan Alpha Bois Assistant',
    images: [
      {
        url: '/huangshan.png',
        width: 1200,
        height: 630,
        alt: 'Artisan Alpha Bois Marie Assistant',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisan Alpha Bois - Marie Assistante Commerciale',
    description: 'Discutez avec Marie, votre assistante commerciale spécialisée en menuiserie',
    images: ['/huangshan.png'],
  },
}

export default function MenuiserieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
