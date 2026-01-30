import { listMDXFiles, readMDXFile } from '@/lib/fs-utils'
import axios from 'axios'

import { BlogDetailProps, BlogItem, CommentItemProps } from '@/common/types/blog'

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function getBlogData(): Promise<BlogItem[]> {
  try {
    // Prioritize local blog posts (admin-created and MDX files)
    const localPosts = await getLocalBlogPosts()

    // Only try dev.to if API key exists and as supplementary content
    let devtoPosts: BlogItem[] = []
    if (process.env.DEVTO_KEY) {
      try {
        const response = await axios.get('https://dev.to/api/articles/me/all', {
          headers: {
            'api-key': process.env.DEVTO_KEY
          }
        })
        if (response?.status === 200) {
          // Mark dev.to posts clearly and ensure they don't conflict with local posts
          devtoPosts = response.data.map((post: any) => ({
            ...post,
            source: 'devto',
            is_local: false,
            post_type: 'devto'
          }))
        }
      } catch (error) {
        console.log('Dev.to API unavailable, using local posts only')
        // Don't treat this as an error - system should work without dev.to
      }
    }

    // Combine sources with local posts taking priority
    const allPosts = [...localPosts, ...devtoPosts]

    // Apply smart sorting algorithm
    return smartSortPosts(allPosts)
  } catch (error) {
    console.error('Failed to fetch blog data:', error)
    return []
  }
}

/**
 * Smart sorting algorithm that alternates posts to the top based on:
 * 1. Recent posts (published within last 7 days)
 * 2. High engagement (likes + comments + views)
 * 3. Trending posts (good engagement in recent time)
 */
function smartSortPosts(posts: BlogItem[]): BlogItem[] {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Calculate engagement score for each post
  const postsWithScores = posts.map(post => {
    const publishedDate = new Date(post.published_at)
    const daysSincePublished = Math.max(1, (now.getTime() - publishedDate.getTime()) / (24 * 60 * 60 * 1000))

    // Base engagement score
    const engagementScore =
      (post.public_reactions_count || 0) + (post.comments_count || 0) * 2 + (post.page_views_count || 0) * 0.1

    // Boost recent posts
    const recencyBoost = publishedDate > sevenDaysAgo ? 100 : 0

    // Time-decay factor (newer posts get higher scores)
    const timeDecayFactor = Math.max(0.1, 1 / Math.sqrt(daysSincePublished))

    // Final smart score
    const smartScore = engagementScore * timeDecayFactor + recencyBoost

    return {
      post,
      smartScore,
      isRecent: publishedDate > sevenDaysAgo,
      engagementScore,
      daysSincePublished
    }
  })

  // Sort by smart score (highest first)
  postsWithScores.sort((a, b) => b.smartScore - a.smartScore)

  // Create alternating pattern: high engagement -> recent -> trending
  const sortedPosts: BlogItem[] = []
  const highEngagement = postsWithScores.filter(p => p.engagementScore > 10)
  const recentPosts = postsWithScores.filter(p => p.isRecent && p.engagementScore <= 10)
  const otherPosts = postsWithScores.filter(p => !p.isRecent && p.engagementScore <= 10)

  // Alternate between categories
  const maxLength = Math.max(highEngagement.length, recentPosts.length, otherPosts.length)

  for (let i = 0; i < maxLength; i++) {
    if (highEngagement[i]) sortedPosts.push(highEngagement[i].post)
    if (recentPosts[i]) sortedPosts.push(recentPosts[i].post)
    if (otherPosts[i]) sortedPosts.push(otherPosts[i].post)
  }

  return sortedPosts
}

async function getLocalBlogPosts(): Promise<BlogItem[]> {
  try {
    const posts: BlogItem[] = []

    // 1. Get MDX files from contents/blog directory
    const blogFiles = await listMDXFiles('contents/blog')
    console.log('Blog files found:', blogFiles)

    for (const file of blogFiles) {
      const slug = file.replace(/\.mdx?$/, '')
      const filePath = `contents/blog/${file}`
      const fileData = await readMDXFile(filePath)

      if (fileData && fileData.frontmatter.published !== false) {
        // Convert category to collection_id
        const category = fileData.frontmatter.category || 'all'
        console.log(`Processing ${slug}: category=${category}`)
        let collection_id: number | null = null // Default to home (null)

        if (category === 'nextjs') {
          collection_id = 24593
        } else if (category === 'typescript') {
          collection_id = 24596
        } else if (category === 'home') {
          collection_id = null
        }

        // Transform local MDX to BlogItem format
        const basePost = {
          type_of: 'article',
          id: Date.parse(fileData.frontmatter.date || new Date().toISOString()),
          title: fileData.frontmatter.title || slug,
          description: fileData.frontmatter.description || '',
          published: true,
          published_at: fileData.frontmatter.date || new Date().toISOString(),
          slug: slug,
          path: `/blog/${slug}`,
          url: `${process.env.DOMAIN || ''}/blog/${slug}?id=${
            fileData.frontmatter.postType === 'devto' && fileData.frontmatter.devtoId
              ? fileData.frontmatter.devtoId
              : `local-${slug}`
          }`,
          comments_count: 0,
          public_reactions_count: 0,
          page_views_count: 0,
          published_timestamp: fileData.frontmatter.date || new Date().toISOString(),
          body_markdown: fileData.content,
          positive_reactions_count: 0,
          cover_image: fileData.frontmatter.image || '',
          tag_list: fileData.frontmatter.tags || [],
          canonical_url: `${process.env.DOMAIN || ''}/blog/${slug}`,
          reading_time_minutes: Math.ceil(fileData.content.split(' ').length / 200),
          user: {
            name: fileData.frontmatter.author || 'Maliq Al Fathir',
            username: 'codemaliq',
            twitter_username: null,
            github_username: 'maliq04',
            user_id: 0,
            profile_image: process.env.NEXT_PUBLIC_PROFILE_IMAGE || '',
            profile_image_90: process.env.NEXT_PUBLIC_PROFILE_IMAGE || '',
            website_url: process.env.DOMAIN || ''
          },
          db_views_count: 0,
          total_views_count: 0,
          created_at: fileData.frontmatter.date || new Date().toISOString(),
          // Add flags to identify post type
          is_local: fileData.frontmatter.postType !== 'devto',
          post_type: fileData.frontmatter.postType || 'local',
          devto_id: fileData.frontmatter.devtoId,
          source: 'mdx'
        }

        if (category === 'all') {
          // Add to all categories
          console.log(`Adding ${slug} to all categories`)
          posts.push({ ...basePost, collection_id: null, tags: basePost.tag_list.join(', ') } as any) // Home
          posts.push({
            ...basePost,
            collection_id: 24593,
            id: basePost.id + 1,
            tags: basePost.tag_list.join(', ')
          } as any) // Next.js
          posts.push({
            ...basePost,
            collection_id: 24596,
            id: basePost.id + 2,
            tags: basePost.tag_list.join(', ')
          } as any) // TypeScript
        } else {
          console.log(`Adding ${slug} to category ${category} with collection_id ${collection_id}`)
          posts.push({ ...basePost, collection_id, tags: basePost.tag_list.join(', ') } as any)
        }
      }
    }

    // 2. Get admin-created posts from Firebase (if available)
    try {
      const { database } = await import('@/lib/firebase-admin')
      const adminPostsRef = database.ref('admin/blog_posts')
      const snapshot = await adminPostsRef.once('value')
      const adminPosts = snapshot.val()

      if (adminPosts) {
        console.log('Admin posts found in Firebase:', Object.keys(adminPosts).length)

        Object.entries(adminPosts).forEach(([postId, postData]: [string, any]) => {
          if (postData && postData.published !== false) {
            const adminPost = {
              type_of: 'article',
              id: parseInt(postId) || Date.now(),
              title: postData.title || 'Untitled',
              description: postData.description || postData.excerpt || '',
              published: postData.published !== false,
              published_at: postData.publishedAt || postData.createdAt || new Date().toISOString(),
              slug: postData.slug || postId,
              path: `/blog/${postData.slug || postId}`,
              url: `${process.env.DOMAIN || ''}/blog/${postData.slug || postId}?id=admin-${postId}`,
              comments_count: postData.commentsCount || 0,
              public_reactions_count: postData.likesCount || 0,
              page_views_count: postData.viewsCount || 0,
              published_timestamp: postData.publishedAt || postData.createdAt || new Date().toISOString(),
              body_markdown: postData.content || postData.body || '',
              positive_reactions_count: postData.likesCount || 0,
              cover_image: postData.coverImage || postData.image || '',
              tag_list: postData.tags || [],
              canonical_url: `${process.env.DOMAIN || ''}/blog/${postData.slug || postId}`,
              reading_time_minutes: Math.ceil((postData.content || '').split(' ').length / 200),
              user: {
                name: postData.author || 'Maliq Al Fathir',
                username: 'codemaliq',
                twitter_username: null,
                github_username: 'maliq04',
                user_id: 0,
                profile_image: process.env.NEXT_PUBLIC_PROFILE_IMAGE || '',
                profile_image_90: process.env.NEXT_PUBLIC_PROFILE_IMAGE || '',
                website_url: process.env.DOMAIN || ''
              },
              db_views_count: postData.viewsCount || 0,
              total_views_count: postData.viewsCount || 0,
              created_at: postData.createdAt || new Date().toISOString(),
              collection_id: postData.category === 'nextjs' ? 24593 : postData.category === 'typescript' ? 24596 : null,
              tags: Array.isArray(postData.tags) ? postData.tags.join(', ') : postData.tags || '',
              // Add flags to identify post type
              is_local: true,
              post_type: 'admin',
              source: 'firebase'
            }

            posts.push(adminPost as any)
          }
        })
      }
    } catch (firebaseError) {
      console.log('Firebase admin posts not available:', firebaseError)
      // Don't fail if Firebase is not available
    }

    // Sort by date, newest first
    posts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

    console.log(`Total local posts created: ${posts.length}`)
    posts.forEach(p => console.log(`  - ${p.title} (source: ${(p as any).source}, collection_id: ${p.collection_id})`))

    return posts
  } catch (error) {
    console.error('Failed to fetch local blog posts:', error)
    return []
  }
}

export async function getBlogDetail({ searchParams }: Props): Promise<BlogDetailProps> {
  const postId = searchParams.id as string

  console.log('=== getBlogDetail START ===')
  console.log('postId:', postId)
  console.log('searchParams:', searchParams)

  // Default user object
  const defaultUser = {
    name: 'Maliq Al Fathir',
    username: 'codemaliq',
    twitter_username: null,
    github_username: 'maliq04',
    user_id: 0,
    profile_image: process.env.NEXT_PUBLIC_PROFILE_IMAGE || '',
    profile_image_90: process.env.NEXT_PUBLIC_PROFILE_IMAGE || '',
    website_url: process.env.DOMAIN || ''
  }

  // Check if it's an admin post
  if (postId && postId.startsWith('admin-')) {
    const adminPostId = postId.replace('admin-', '')

    console.log('Loading admin post')
    console.log('adminPostId:', adminPostId)

    try {
      const { database } = await import('@/lib/firebase-admin')
      const adminPostRef = database.ref(`admin/blog_posts/${adminPostId}`)
      const snapshot = await adminPostRef.once('value')
      const postData = snapshot.val()

      if (postData) {
        console.log('Admin post found!')
        console.log('title:', postData.title)
        console.log('content length:', (postData.content || '').length)

        return {
          type_of: 'article',
          id: parseInt(adminPostId) || Date.now(),
          title: postData.title || 'Untitled',
          description: postData.description || postData.excerpt || '',
          readable_publish_date: new Date(
            postData.publishedAt || postData.createdAt || new Date()
          ).toLocaleDateString(),
          published_at: postData.publishedAt || postData.createdAt || new Date().toISOString(),
          created_at: postData.createdAt || new Date().toISOString(),
          slug: postData.slug || adminPostId,
          path: `/blog/${postData.slug || adminPostId}`,
          url: `${process.env.DOMAIN || ''}/blog/${postData.slug || adminPostId}?id=${postId}`,
          comments_count: postData.commentsCount || 0,
          public_reactions_count: postData.likesCount || 0,
          collection_id: postData.category === 'nextjs' ? 24593 : postData.category === 'typescript' ? 24596 : null,
          published_timestamp: postData.publishedAt || postData.createdAt || new Date().toISOString(),
          positive_reactions_count: postData.likesCount || 0,
          cover_image: postData.coverImage || postData.image || '',
          social_image: postData.coverImage || postData.image || '',
          canonical_url: `${process.env.DOMAIN || ''}/blog/${postData.slug || adminPostId}`,
          edited_at: postData.updatedAt || null,
          crossposted_at: null,
          last_comment_at: null,
          tag_list: Array.isArray(postData.tags) ? postData.tags.join(', ') : postData.tags || '',
          tags: Array.isArray(postData.tags) ? postData.tags : postData.tags ? [postData.tags] : [],
          reading_time_minutes: Math.ceil((postData.content || '').split(' ').length / 200),
          body_html: `<div>${postData.content || ''}</div>`,
          body_markdown: postData.content || '',
          user: {
            ...defaultUser,
            name: postData.author || defaultUser.name
          },
          blog_slug: null
        } as BlogDetailProps
      } else {
        console.error('Admin post not found in Firebase')
      }
    } catch (error) {
      console.error('Error reading admin blog post:', error)
    }
  }

  // Check if it's a local post
  if (postId && postId.startsWith('local-')) {
    const slug = postId.replace('local-', '')
    const filePath = `contents/blog/${slug}.mdx`

    console.log('Loading local post')
    console.log('slug:', slug)
    console.log('filePath:', filePath)

    try {
      const fileData = await readMDXFile(filePath)

      console.log('fileData exists:', !!fileData)
      console.log('filePath attempted:', filePath)

      if (fileData) {
        console.log('Local post found!')
        console.log('title:', fileData.frontmatter.title)
        console.log('content length:', fileData.content?.length || 0)
        console.log('content preview:', fileData.content?.substring(0, 100) || 'No content')

        // Fetch stats from Firebase (optional, don't block content)
        let stats = { views: 0, likes: 0, comments: 0, shares: 0 }
        // Note: Stats will be loaded client-side in LocalReaderPage

        return {
          type_of: 'article',
          id: Date.parse(fileData.frontmatter.date || new Date().toISOString()),
          title: fileData.frontmatter.title || slug,
          description: fileData.frontmatter.description || '',
          readable_publish_date: new Date(fileData.frontmatter.date || new Date()).toLocaleDateString(),
          published_at: fileData.frontmatter.date || new Date().toISOString(),
          created_at: fileData.frontmatter.date || new Date().toISOString(),
          slug: slug,
          path: `/blog/${slug}`,
          url: `${process.env.DOMAIN || ''}/blog/${slug}?id=${postId}`,
          comments_count: stats.comments,
          public_reactions_count: stats.likes + stats.shares,
          collection_id: null,
          published_timestamp: fileData.frontmatter.date || new Date().toISOString(),
          positive_reactions_count: stats.likes,
          cover_image: fileData.frontmatter.image || '',
          social_image: fileData.frontmatter.image || '',
          canonical_url: `${process.env.DOMAIN || ''}/blog/${slug}`,
          edited_at: null,
          crossposted_at: null,
          last_comment_at: null,
          tag_list: (fileData.frontmatter.tags || []).join(', '),
          tags: fileData.frontmatter.tags || [],
          reading_time_minutes: Math.ceil(fileData.content.split(' ').length / 200),
          body_html: `<div>${fileData.content}</div>`,
          body_markdown: fileData.content,
          user: {
            ...defaultUser,
            name: fileData.frontmatter.author || defaultUser.name
          },
          blog_slug: null
        } as BlogDetailProps
      } else {
        console.error('fileData is null or undefined')
      }
    } catch (error) {
      console.error('Error reading local blog post:', error)
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Check if it's a dev.to post (numeric ID) - could be from admin or original dev.to
  if (postId && !postId.startsWith('local-') && !isNaN(Number(postId))) {
    try {
      const URL = `https://dev.to/api/articles/${postId}`
      console.log('Fetching from dev.to:', URL)
      const response = await axios.get(URL, {
        headers: {
          'api-key': process.env.DEVTO_KEY
        }
      })
      if (response.status === 200 && response.data) {
        console.log('Dev.to post found:', response.data.title)
        return response.data
      }
    } catch (error) {
      console.error('Failed to fetch blog detail from dev.to:', error)

      // If dev.to fetch fails, check if it's a local post with devto_id
      // This handles admin-created dev.to posts that might not exist on dev.to yet
      try {
        const blogFiles = await listMDXFiles('contents/blog')
        for (const file of blogFiles) {
          const slug = file.replace(/\.mdx?$/, '')
          const filePath = `contents/blog/${file}`
          const fileData = await readMDXFile(filePath)

          if (fileData && fileData.frontmatter.devtoId === postId) {
            console.log('Found local post with matching devto_id:', slug)

            return {
              type_of: 'article',
              id: Number(postId),
              title: fileData.frontmatter.title || slug,
              description: fileData.frontmatter.description || '',
              readable_publish_date: new Date(fileData.frontmatter.date || new Date()).toLocaleDateString(),
              published_at: fileData.frontmatter.date || new Date().toISOString(),
              created_at: fileData.frontmatter.date || new Date().toISOString(),
              slug: slug,
              path: `/blog/${slug}`,
              url: `https://dev.to/codemaliq/${slug}-${postId}`,
              comments_count: 0,
              public_reactions_count: 0,
              collection_id: null,
              published_timestamp: fileData.frontmatter.date || new Date().toISOString(),
              positive_reactions_count: 0,
              cover_image: fileData.frontmatter.image || '',
              social_image: fileData.frontmatter.image || '',
              canonical_url: `https://dev.to/codemaliq/${slug}-${postId}`,
              edited_at: null,
              crossposted_at: null,
              last_comment_at: null,
              tag_list: (fileData.frontmatter.tags || []).join(', '),
              tags: fileData.frontmatter.tags || [],
              reading_time_minutes: Math.ceil(fileData.content.split(' ').length / 200),
              body_html: `<div>${fileData.content}</div>`,
              body_markdown: fileData.content,
              user: {
                ...defaultUser,
                name: fileData.frontmatter.author || defaultUser.name
              },
              blog_slug: null
            } as BlogDetailProps
          }
        }
      } catch (localError) {
        console.error('Error checking local posts for devto_id:', localError)
      }
    }
  }

  // Return a default empty blog with user object
  console.log('No post found, returning default "Blog Post Not Found"')
  return {
    type_of: 'article',
    id: 0,
    title: 'Blog Post Not Found',
    description: 'The requested blog post could not be found.',
    readable_publish_date: new Date().toLocaleDateString(),
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    slug: '',
    path: '',
    url: '',
    comments_count: 0,
    public_reactions_count: 0,
    collection_id: null,
    published_timestamp: new Date().toISOString(),
    positive_reactions_count: 0,
    cover_image: '',
    social_image: '',
    canonical_url: '',
    edited_at: null,
    crossposted_at: null,
    last_comment_at: null,
    tag_list: '',
    tags: [],
    reading_time_minutes: 0,
    body_html: '<p>Blog post not found.</p>',
    body_markdown: 'Blog post not found.',
    user: defaultUser,
    blog_slug: null
  } as BlogDetailProps
}

export async function getComments(postId: string): Promise<CommentItemProps[]> {
  // Local posts don't have comments from dev.to
  if (postId && postId.startsWith('local-')) {
    return []
  }

  // Only fetch comments for dev.to posts
  try {
    const DEV_TO_URL = `https://dev.to/api/comments/?a_id=${postId}`
    const response = await axios.get(DEV_TO_URL, {
      headers: {
        'api-key': process.env.DEVTO_KEY
      }
    })
    if (response?.status !== 200) return []
    return response.data
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return []
  }
}
