import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Maliq Al Fathir - Software Engineer',
    short_name: 'Maliq Al Fathir',
    description: 'Personal website, portfolio, blog, software engineer roadmap, programming tips of Maliq Al Fathir',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/img/codemaliq.jpg',
        sizes: '192x192',
        type: 'image/jpg'
      },
      {
        src: '/img/codemaliq.jpg',
        sizes: '384x384',
        type: 'image/jpg'
      },
      {
        src: '/img/codemaliq.jpg',
        sizes: '512x512',
        type: 'image/jpg'
      }
    ]
  }
}
