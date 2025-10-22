import type { Metadata } from 'next'
import { Inter, Georgia } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const georgia = Georgia({
  subsets: ['latin'],
  variable: '--font-georgia',
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Bite Size Academic - Stay Current with Academic Research',
  description: 'Get weekly curated digests of cutting-edge academic research in your field. Stay current in 15 minutes per week without the information overload.',
  keywords: ['academic research', 'research digest', 'scientific papers', 'academic journals', 'research summaries'],
  authors: [{ name: 'Bite Size Academic' }],
  openGraph: {
    title: 'Bite Size Academic - Stay Current with Academic Research',
    description: 'Get weekly curated digests of cutting-edge academic research in your field. Stay current in 15 minutes per week.',
    type: 'website',
    locale: 'en_US',
    url: 'https://bite-size-academic.com',
    siteName: 'Bite Size Academic',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bite Size Academic - Stay Current with Academic Research',
    description: 'Get weekly curated digests of cutting-edge academic research in your field.',
    creator: '@bitesizeacademic',
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
      </head>
      <body className={`${inter.variable} ${georgia.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}