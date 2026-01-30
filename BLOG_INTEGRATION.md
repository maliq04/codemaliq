# Blog Integration Guide

## How Blog Posts Flow Through the System

### 1. Creating Blog Posts

- **Admin Dashboard**: Go to `/admin-portal-x7k9m2p/blog` and click "Create New Post"
- Posts are saved as MDX files in `contents/blog/` directory
- Each post has frontmatter (title, description, date, image, tags, published status)

### 2. Blog Posts Appear Everywhere

#### Home Page - Latest Articles Section

- **Location**: Home page (`/`)
- **Component**: `modules/home/components/LatestArticle.tsx`
- **How it works**:
  - Fetches all blog posts using `getBlogData()` from `services/blog.ts`
  - Shows the 4 most recent posts
  - Each card is clickable and links to the full post

#### Blog List Page

- **Location**: `/blog?category=home`
- **Component**: `modules/blog/components/Blog.tsx`
- **How it works**:
  - Fetches all blog posts using `getBlogData()`
  - Filters by category (home, Next.js, TypeScript, etc.)
  - Shows all posts in that category

#### Blog Detail Page

- **Location**: `/blog/[slug]?id=local-{slug}`
- **Component**: `components/elements/ReaderPage.tsx`
- **How it works**:
  - Fetches specific post using `getBlogDetail()`
  - Shows full content with markdown rendering
  - Shows comments and view count

### 3. Data Flow

```
Admin Creates Post
    ↓
Saved to contents/blog/{slug}.mdx
    ↓
getBlogData() reads all MDX files
    ↓
Posts appear in:
  - Home page (Latest Articles)
  - Blog list page (/blog?category=home)
  - Blog detail page (/blog/{slug})
```

### 4. Local vs DEV.TO Posts

The system supports both:

- **Local posts**: Created in admin, stored in `contents/blog/`
  - ID format: `local-{slug}`
  - Example: `local-aku-mau-cerita`
- **DEV.TO posts**: Fetched from DEV.TO API (if DEVTO_KEY is set)
  - ID format: numeric (e.g., `123456`)
  - Requires DEVTO_KEY environment variable

Both types appear together in all blog sections!

### 5. Blog Post Structure

```yaml
---
title: My Blog Post Title
description: A brief description
date: '2026-01-15T13:20:17.742Z'
image: 'https://example.com/image.jpg'
tags: ['javascript', 'react']
published: true
author: Maliq Al Fathir
---
Your markdown content here...
```

### 6. Key Files

- **Blog Service**: `services/blog.ts` - Fetches and combines local + DEV.TO posts
- **Admin Blog API**: `app/api/admin/blog/route.ts` - CRUD operations
- **Admin Blog UI**: `components/admin/blog/` - Blog management interface
- **Public Blog Pages**: `app/blog/` - Public-facing blog pages
- **Home Page**: `app/page.tsx` - Shows latest articles

## Everything is Connected! 🎉

When you create a blog post in the admin:

1. It's saved as an MDX file
2. It appears on the home page in "Latest Articles"
3. It appears in the blog list at `/blog?category=home`
4. It's fully readable at `/blog/{slug}`
5. All posts are interconnected through the same data source

No separation - everything flows together seamlessly!
