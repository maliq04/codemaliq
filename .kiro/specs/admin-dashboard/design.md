# Admin Dashboard Design Document

## Overview

The admin dashboard is a secure, feature-rich content management system for the codemaliq portfolio website. It provides a centralized interface for managing all website content including blog posts, projects, learning articles, chat moderation, and configuration settings. The dashboard will be accessible via an obscured URL route and protected by email-based authentication.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Admin Dashboard UI (React/Next.js)           │  │
│  │  - Dashboard Overview  - Blog Management             │  │
│  │  - Project Management  - Chat Moderation             │  │
│  │  - Media Library       - Configuration               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Check   │  │ File System  │  │ Cloudinary   │     │
│  │ Middleware   │  │ Operations   │  │ Upload API   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ File System  │  │   Firebase   │  │  Cloudinary  │     │
│  │ (MDX, JSON)  │  │   Realtime   │  │    Media     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Security Architecture

1. **Route Obscurity**: Admin dashboard accessible at `/admin-portal-x7k9m2p` (random string)
2. **Authentication Layer**: NextAuth session validation on every request
3. **Authorization Layer**: Email whitelist check against `ADMIN_EMAILS` environment variable
4. **API Protection**: All API routes validate admin status before processing
5. **CSRF Protection**: Next.js built-in CSRF protection for API routes

## Components and Interfaces

### Core Components

#### 1. AdminLayout Component

```typescript
interface AdminLayoutProps {
  children: React.ReactNode
}

// Provides:
// - Sidebar navigation
// - Header with user info and logout
// - Breadcrumb navigation
// - Responsive mobile menu
```

#### 2. AdminAuthGuard Component

```typescript
interface AdminAuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Responsibilities:
// - Check NextAuth session
// - Verify admin email whitelist
// - Redirect to sign-in if not authenticated
// - Show access denied if not admin
```

#### 3. Dashboard Overview Component

```typescript
interface DashboardStats {
  totalBlogs: number
  totalProjects: number
  totalChatMessages: number
  unreadContacts: number
  recentActivity: ActivityItem[]
}

interface ActivityItem {
  id: string
  type: 'blog' | 'project' | 'chat' | 'contact' | 'media'
  action: 'created' | 'updated' | 'deleted'
  title: string
  timestamp: string
  adminEmail: string
}
```

#### 4. Blog Management Components

**BlogList Component**

```typescript
interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  image: string
  tags: string[]
  content: string
  published: boolean
}

interface BlogListProps {
  posts: BlogPost[]
  onEdit: (slug: string) => void
  onDelete: (slug: string) => void
  onCreate: () => void
}
```

**BlogEditor Component**

```typescript
interface BlogEditorProps {
  post?: BlogPost
  onSave: (post: BlogPost) => Promise<void>
  onCancel: () => void
}

// Features:
// - Rich text editor with markdown support
// - Image upload integration
// - Tag management
// - Slug auto-generation
// - Preview mode
```

#### 5. Project Management Components

**ProjectList Component**

```typescript
interface Project {
  id: string
  title: string
  description: string
  image: string
  techStack: string[]
  link?: string
  repository?: string
  featured: boolean
  order: number
}

interface ProjectListProps {
  projects: Project[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (projects: Project[]) => void
}
```

**ProjectEditor Component**

```typescript
interface ProjectEditorProps {
  project?: Project
  onSave: (project: Project) => Promise<void>
  onCancel: () => void
}
```

#### 6. Chat Moderation Components

**ChatModeration Component**

```typescript
interface ChatMessage {
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
}

interface ChatModerationProps {
  messages: ChatMessage[]
  onDelete: (id: string) => Promise<void>
  onReply: (id: string, message: string) => Promise<void>
  onFlag: (id: string) => Promise<void>
  onUnflag: (id: string) => Promise<void>
}
```

#### 7. Media Library Components

**MediaLibrary Component**

```typescript
interface MediaItem {
  public_id: string
  url: string
  secure_url: string
  format: string
  width: number
  height: number
  created_at: string
  tags: string[]
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void
  allowUpload?: boolean
  allowDelete?: boolean
}
```

**MediaUploader Component**

```typescript
interface MediaUploaderProps {
  onUploadComplete: (url: string) => void
  folder?: string
  maxSize?: number
  acceptedFormats?: string[]
}
```

#### 8. Configuration Management Component

**ConfigEditor Component**

```typescript
interface SiteConfig {
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

interface ConfigEditorProps {
  config: SiteConfig
  onSave: (config: SiteConfig) => Promise<void>
}
```

## Data Models

### Admin User Model

```typescript
interface AdminUser {
  email: string
  name: string
  image: string
  role: 'admin'
  lastLogin: string
}
```

### Audit Log Model

```typescript
interface AuditLog {
  id: string
  adminEmail: string
  action: 'create' | 'update' | 'delete'
  resourceType: 'blog' | 'project' | 'chat' | 'contact' | 'media' | 'config'
  resourceId: string
  resourceTitle: string
  changes?: Record<string, any>
  timestamp: string
  ipAddress?: string
}
```

### File System Structure

```
project-root/
├── contents/
│   ├── blog/
│   │   └── [slug].mdx
│   └── learn/
│       └── [category]/
│           └── [slug].mdx
├── codemaliq.json (projects, config, roadmap)
└── public/
    └── uploads/ (temporary, before Cloudinary)
```

### Firebase Structure

```json
{
  "chat": {
    "messageId": {
      "id": "string",
      "name": "string",
      "email": "string",
      "message": "string",
      "created_at": "ISO string",
      "is_show": "boolean",
      "flagged": "boolean"
    }
  },
  "audit_logs": {
    "logId": {
      "adminEmail": "string",
      "action": "string",
      "resourceType": "string",
      "timestamp": "ISO string"
    }
  },
  "contacts": {
    "contactId": {
      "name": "string",
      "email": "string",
      "message": "string",
      "timestamp": "ISO string",
      "read": "boolean"
    }
  }
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Admin authentication invariant

_For any_ request to admin routes, the user must have a valid NextAuth session AND their email must be in the admin whitelist, otherwise access is denied
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: File system operation atomicity

_For any_ file write operation (blog, article, config), if the operation fails, the original file content must remain unchanged
**Validates: Requirements 3.3, 7.3, 10.2**

### Property 3: Audit log completeness

_For any_ create, update, or delete operation, an audit log entry must be created with timestamp, admin email, and action details
**Validates: Requirements 12.1, 12.4**

### Property 4: Media upload validation

_For any_ file upload, the system must validate file type and size before uploading to Cloudinary, rejecting invalid files
**Validates: Requirements 2.2, 3.4, 9.2**

### Property 5: Configuration update validation

_For any_ configuration update, all required fields must be present and valid before saving to codemaliq.json
**Validates: Requirements 10.2, 10.4**

### Property 6: Chat message visibility consistency

_For any_ chat message marked as hidden or flagged, it must not appear in the public chat view but must remain in the admin moderation view
**Validates: Requirements 5.4**

### Property 7: Blog slug uniqueness

_For any_ new blog post, the slug must be unique across all existing blog posts, or the system must reject the creation
**Validates: Requirements 3.2, 3.3**

### Property 8: Project order preservation

_For any_ project reorder operation, the final order in codemaliq.json must match the order specified by the admin
**Validates: Requirements 4.6**

### Property 9: Session expiration handling

_For any_ admin action, if the session has expired, the system must redirect to sign-in and preserve the intended action for after re-authentication
**Validates: Requirements 1.1**

### Property 10: Cloudinary URL consistency

_For any_ media item uploaded to Cloudinary, the URL stored in the database must be the secure_url returned by Cloudinary
**Validates: Requirements 2.3, 3.4, 4.4, 9.2**

## Error Handling

### Error Categories

1. **Authentication Errors**

   - Session expired → Redirect to sign-in with return URL
   - Not admin → Show access denied page
   - Network error → Show retry button

2. **File System Errors**

   - File not found → Show error toast, refresh list
   - Permission denied → Log error, show admin message
   - Invalid format → Show validation error with details

3. **Upload Errors**

   - File too large → Show size limit message
   - Invalid format → Show accepted formats
   - Cloudinary error → Show error, allow retry

4. **Database Errors**

   - Firebase connection lost → Show offline indicator, queue operations
   - Write failed → Show error, preserve form data
   - Read failed → Show error, allow refresh

5. **Validation Errors**
   - Required field missing → Highlight field, show message
   - Invalid format → Show format requirements
   - Duplicate slug → Suggest alternative slug

### Error Recovery Strategies

1. **Optimistic Updates**: Update UI immediately, rollback on error
2. **Retry Logic**: Automatic retry for network errors (max 3 attempts)
3. **Form Preservation**: Save form data to localStorage on error
4. **Graceful Degradation**: Show cached data when real-time updates fail
5. **Error Logging**: Log all errors to audit log for debugging

## Testing Strategy

### Unit Testing

**Test Coverage Areas:**

- Admin authentication logic
- File system operations (read, write, delete)
- Data validation functions
- URL slug generation
- Configuration parsing and validation

**Example Unit Tests:**

```typescript
describe('Admin Authentication', () => {
  test('should allow access for whitelisted email', () => {
    // Test admin email validation
  })

  test('should deny access for non-whitelisted email', () => {
    // Test non-admin rejection
  })
})

describe('Blog Operations', () => {
  test('should generate unique slug from title', () => {
    // Test slug generation
  })

  test('should validate required blog fields', () => {
    // Test validation
  })
})
```

### Property-Based Testing

**Testing Framework**: fast-check (JavaScript property-based testing library)

**Property Test 1: Admin authentication invariant**

```typescript
// Generate random user sessions and verify admin check
fc.assert(
  fc.property(
    fc.record({
      email: fc.emailAddress(),
      name: fc.string(),
      isAdmin: fc.boolean()
    }),
    user => {
      const result = checkAdminAccess(user, adminWhitelist)
      return user.isAdmin ? result === true : result === false
    }
  )
)
```

**Property Test 2: File operation atomicity**

```typescript
// Generate random file operations and verify rollback on failure
fc.assert(
  fc.property(
    fc.record({
      filename: fc.string(),
      content: fc.string(),
      shouldFail: fc.boolean()
    }),
    async operation => {
      const originalContent = await readFile(operation.filename)
      try {
        await writeFile(operation.filename, operation.content, operation.shouldFail)
      } catch (error) {
        const currentContent = await readFile(operation.filename)
        return currentContent === originalContent
      }
      return true
    }
  )
)
```

**Property Test 3: Audit log completeness**

```typescript
// Generate random admin actions and verify audit logs are created
fc.assert(
  fc.property(
    fc.record({
      action: fc.constantFrom('create', 'update', 'delete'),
      resourceType: fc.constantFrom('blog', 'project', 'chat'),
      resourceId: fc.uuid()
    }),
    async action => {
      await performAdminAction(action)
      const logs = await getAuditLogs()
      return logs.some(
        log =>
          log.action === action.action &&
          log.resourceType === action.resourceType &&
          log.resourceId === action.resourceId
      )
    }
  )
)
```

**Property Test 4: Configuration validation**

```typescript
// Generate random config updates and verify validation
fc.assert(
  fc.property(
    fc.record({
      profile: fc.record({
        name: fc.string(),
        email: fc.emailAddress()
      }),
      social: fc.record({
        github: fc.webUrl(),
        linkedin: fc.webUrl()
      })
    }),
    config => {
      const result = validateConfig(config)
      return result.valid === true
    }
  )
)
```

### Integration Testing

**Test Scenarios:**

1. Complete blog post creation flow (upload image, save post, verify file created)
2. Project management flow (create, update, reorder, delete)
3. Chat moderation flow (flag message, reply, delete)
4. Media upload flow (upload to Cloudinary, save URL, display in library)
5. Configuration update flow (update settings, verify codemaliq.json updated)

### End-to-End Testing

**Critical User Flows:**

1. Admin login → Dashboard → Create blog post → Verify on public site
2. Admin login → Upload media → Use in project → Verify display
3. Admin login → Moderate chat → Verify changes in public chat
4. Admin login → Update config → Verify changes on public site

## API Routes

### Authentication Routes

- `GET /api/admin/auth/check` - Verify admin status
- `POST /api/admin/auth/logout` - Clear admin session

### Blog Management Routes

- `GET /api/admin/blog` - List all blog posts
- `GET /api/admin/blog/[slug]` - Get single blog post
- `POST /api/admin/blog` - Create new blog post
- `PUT /api/admin/blog/[slug]` - Update blog post
- `DELETE /api/admin/blog/[slug]` - Delete blog post

### Project Management Routes

- `GET /api/admin/projects` - List all projects
- `POST /api/admin/projects` - Create new project
- `PUT /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project
- `PUT /api/admin/projects/reorder` - Reorder projects

### Chat Moderation Routes

- `GET /api/admin/chat` - Get all chat messages
- `DELETE /api/admin/chat/[id]` - Delete chat message
- `POST /api/admin/chat/reply` - Reply to chat message
- `PUT /api/admin/chat/[id]/flag` - Flag/unflag message

### Media Management Routes

- `GET /api/admin/media` - List all media from Cloudinary
- `POST /api/admin/media/upload` - Upload media to Cloudinary
- `DELETE /api/admin/media/[id]` - Delete media from Cloudinary

### Configuration Routes

- `GET /api/admin/config` - Get current configuration
- `PUT /api/admin/config` - Update configuration

### Audit Log Routes

- `GET /api/admin/audit` - Get audit logs with pagination
- `POST /api/admin/audit` - Create audit log entry

### Contact Management Routes

- `GET /api/admin/contacts` - List all contact submissions
- `PUT /api/admin/contacts/[id]/read` - Mark contact as read
- `DELETE /api/admin/contacts/[id]` - Delete contact submission

## Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Forms**: React Hook Form
- **Rich Text Editor**: TipTap or React-Markdown with editor
- **State Management**: React Context + hooks
- **File Upload**: react-dropzone

### Backend

- **API**: Next.js API Routes
- **Authentication**: NextAuth.js
- **File System**: Node.js fs/promises
- **Database**: Firebase Realtime Database
- **Media Storage**: Cloudinary
- **Validation**: Zod

### Development Tools

- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Testing**: Vitest + React Testing Library + fast-check

## Security Considerations

1. **Route Protection**: All admin routes protected by middleware
2. **CSRF Protection**: Built-in Next.js CSRF tokens
3. **Input Sanitization**: Sanitize all user inputs before saving
4. **File Upload Validation**: Validate file types and sizes
5. **Rate Limiting**: Implement rate limiting on API routes
6. **Audit Logging**: Log all admin actions for accountability
7. **Environment Variables**: Store sensitive data in .env.local
8. **Cloudinary Signed Uploads**: Use signed upload URLs for security

## Performance Optimization

1. **Code Splitting**: Lazy load admin components
2. **Image Optimization**: Use Next.js Image component
3. **Caching**: Cache Cloudinary media list
4. **Pagination**: Paginate large lists (blogs, projects, audit logs)
5. **Debouncing**: Debounce search and filter inputs
6. **Optimistic Updates**: Update UI before server confirmation
7. **Incremental Static Regeneration**: Revalidate public pages after admin updates

## Deployment Considerations

1. **Environment Variables**: Set `ADMIN_EMAILS` in production
2. **Obscured Route**: Configure unique admin route in production
3. **Cloudinary Setup**: Configure upload presets and folders
4. **Firebase Rules**: Update rules to allow admin writes
5. **Build Process**: Ensure admin routes are included in build
6. **Monitoring**: Set up error tracking (Sentry or similar)
7. **Backup Strategy**: Regular backups of codemaliq.json and content files
