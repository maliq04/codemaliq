import { Inter, Roboto_Condensed, Sora } from 'next/font/google'

export const soraSans = Sora({
  variable: '--soraSans-font',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
  fallback: ['system-ui', 'arial']
})

export const robotoCondensed = Roboto_Condensed({
  variable: '--robotoCondensed-font',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  fallback: ['system-ui', 'arial']
})

export const inter = Inter({
  variable: '--inter-font',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', 'arial']
})
