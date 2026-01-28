// Admin User Types
export interface AdminUser {
  email: string
  name: string | null
  image: string | null
  role: 'admin'
  lastLogin?: string
}

// Blog Post Types
export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  image: string
  tags: string[]
  content: string
  published: boolean
  author?: string
  readTime?: string
  category?: 'home' | 'nextjs' | 'typescript' | 'all'
  collection_id?: number | null
  postType?: 'local' | 'devto'
  devtoId?: string
}

export interface BlogPostFormData {
  title: string
  description: string
  image: string
  tags: string[]
  content: string
  published: boolean
  category?: 'home' | 'nextjs' | 'typescript' | 'all'
  postType?: 'local' | 'devto'
  devtoId?: string
}

// Project Types
export interface Project {
  id: string
  title: string
  description: string
  image: string
  techStack: string[]
  link?: string
  repository?: string
  featured: boolean
  order: number
  createdAt?: string
}

export interface ProjectFormData {
  title: string
  description: string
  image: string
  techStack: string[]
  link?: string
  repository?: string
  featured: boolean
}

// Chat Message Types
export interface ChatMessage {
  id: string
  name: string
  email: string
  image: string
  message: string
  created_at: string
  is_show: boolean
  is_reply: boolean
  reply_to?: string
  flagged?: boolean
  admin_reply?: boolean
}

// Contact Types
export interface Contact {
  id: string
  name: string
  email: string
  message: string
  timestamp: string
  read: boolean
  replied?: boolean
}

// Learning Article Types
export interface LearningArticle {
  slug: string
  category: string
  title: string
  description: string
  content: string
  image?: string
  tags?: string[]
  published: boolean
  createdAt: string
  updatedAt?: string
}

export interface LearningArticleFormData {
  title: string
  category: string
  description: string
  content: string
  image?: string
  tags?: string[]
  published: boolean
}

// Roadmap Types
export interface RoadmapItem {
  id: string
  title: string
  description: string
  category: string
  status: 'not-started' | 'in-progress' | 'completed'
  link?: string
  completedAt?: string
  order: number
}

export interface RoadmapFormData {
  title: string
  description: string
  category: string
  status: 'not-started' | 'in-progress' | 'completed'
  link?: string
}

// Media Types
export interface MediaItem {
  public_id: string
  url: string
  secure_url: string
  format: string
  width: number
  height: number
  created_at: string
  tags: string[]
  resource_type: string
  bytes?: number
}

export interface MediaUploadResult {
  success: boolean
  url?: string
  error?: string
}

// Configuration Types
export interface SiteConfig {
  profile: {
    name: string
    title: string
    email: string
    image: string
  }
  social: {
    github: string
    linkedin: string
    twitter: string
    instagram: string
    youtube?: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  contact: {
    email: string
    phone?: string
  }
}

// Audit Log Types
export type AuditAction = 'create' | 'update' | 'delete'
export type AuditResourceType = 'blog' | 'project' | 'chat' | 'contact' | 'media' | 'config' | 'learn' | 'roadmap'

export interface AuditLog {
  id: string
  adminEmail: string
  adminName?: string
  action: AuditAction
  resourceType: AuditResourceType
  resourceId: string
  resourceTitle: string
  changes?: Record<string, any>
  timestamp: string
  ipAddress?: string
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalBlogs: number
  totalProjects: number
  totalChatMessages: number
  unreadContacts: number
  recentBlogs: number
  recentProjects: number
  recentMessages: number
  recentContacts: number
}

export interface ActivityItem {
  id: string
  type: AuditResourceType
  action: AuditAction
  title: string
  timestamp: string
  adminEmail: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Form State Types
export interface FormState {
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
}

// Filter Types
export interface AuditLogFilters {
  action?: AuditAction
  resourceType?: AuditResourceType
  adminEmail?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface MediaFilters {
  folder?: string
  tag?: string
  format?: string
  search?: string
}

// Validation Types
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}
