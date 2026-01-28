import axios from 'axios'

import { BlogItem } from '@/common/types/blog'

export async function getBlogViews(searchParams: string) {
  // For local posts, return 0 views (they use Firebase stats instead)
  if (searchParams && searchParams.startsWith('local-')) {
    return 0
  }
  
  // Only fetch views for dev.to posts
  try {
    const URL = `https://dev.to/api/articles/me/all`
    const response = await axios.get(URL, {
      headers: {
        'api-key': process.env.DEVTO_KEY
      }
    })
    if (response.status !== 200) return 0
    const data = response.data

    const findArticle = data?.find((blog: BlogItem) => blog.id === parseInt(searchParams))
    const page_views_count: number = findArticle?.page_views_count
    return page_views_count || 0
  } catch (error) {
    console.error('Failed to fetch blog views:', error)
    return 0
  }
}
