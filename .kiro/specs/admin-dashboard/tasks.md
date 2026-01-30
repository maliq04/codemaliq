# Implementation Plan

## Phase 1: Foundation and Authentication

- [ ] 1. Set up admin authentication infrastructure

  - Create admin authentication utilities and middleware
  - Set up environment variables for admin email whitelist
  - Create admin route protection logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.1 Create admin authentication utilities

  - Create `lib/admin-auth.ts` with email whitelist validation
  - Create `isAdminUser()` function to check if user email is in whitelist
  - Create `getAdminSession()` function to get session with admin validation
  - _Requirements: 1.2, 1.3_

- [x] 1.2 Create AdminAuthGuard component

  - Create `components/admin/AdminAuthGuard.tsx`
  - Implement session check and admin validation
  - Add redirect logic for unauthenticated users
  - Add access denied UI for non-admin users
  - _Requirements: 1.1, 1.3_

- [x] 1.3 Create admin layout structure

  - Create `app/admin-portal-x7k9m2p/layout.tsx` with obscured route
  - Create `components/admin/AdminLayout.tsx` with sidebar and header
  - Add navigation menu with all admin sections
  - Add responsive mobile menu
  - _Requirements: 1.5_

- [x] 1.4 Create admin dashboard home page

  - Create `app/admin-portal-x7k9m2p/page.tsx`
  - Add AdminAuthGuard wrapper
  - Create basic dashboard overview structure
  - _Requirements: 1.4_

- [x] 1.5 Update environment variables
  - Add `ADMIN_EMAILS` to `.env.local` and `.env.example`
  - Add `ADMIN_ROUTE_PATH` for configurable obscured route
  - Document admin setup in new `ADMIN_SETUP.md` file
  - _Requirements: 1.2_

## Phase 2: Core API Infrastructure

- [ ] 2. Set up core API routes and utilities

  - Create API route protection middleware
  - Create file system operation utilities
  - Create Cloudinary integration utilities
  - Set up audit logging infrastructure
  - _Requirements: 12.1, 12.4_

- [x] 2.1 Create API authentication middleware

  - Create `lib/api/admin-middleware.ts`
  - Implement `withAdminAuth()` HOF for protecting API routes
  - Add error handling for unauthorized access
  - _Requirements: 1.1, 1.2_

- [x] 2.2 Create file system utilities

  - Create `lib/fs-utils.ts` for safe file operations
  - Implement `readMDXFile()`, `writeMDXFile()`, `deleteMDXFile()`
  - Implement `readJSONFile()`, `writeJSONFile()` with atomic writes
  - Add error handling and rollback logic
  - _Requirements: 3.3, 7.3, 10.2_

- [x] 2.3 Create Cloudinary integration

  - Create `lib/cloudinary.ts` for upload/delete operations
  - Implement `uploadToCloudinary()` with validation
  - Implement `deleteFromCloudinary()`
  - Implement `getCloudinaryMedia()` to list all media
  - _Requirements: 2.3, 3.4, 4.4, 9.2_

- [x] 2.4 Create audit logging system

  - Create `lib/audit-log.ts` for logging admin actions
  - Implement `createAuditLog()` function
  - Set up Firebase structure for audit logs
  - Create `getAuditLogs()` with pagination
  - _Requirements: 12.1, 12.4, 12.5_

- [x] 2.5 Create TypeScript types for admin
  - Create `common/types/admin.ts` with all admin interfaces
  - Define types for BlogPost, Project, ChatMessage, AuditLog, etc.
  - Export all types for use across admin components
  - _Requirements: All_

## Phase 3: Dashboard Overview

- [ ] 3. Implement dashboard overview and statistics

  - Create dashboard statistics API
  - Create dashboard overview UI components
  - Display summary cards for all content types
  - Show recent activity feed
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3.1 Create dashboard statistics API

  - Create `app/api/admin/dashboard/stats/route.ts`
  - Implement logic to count blogs, projects, chat messages, contacts
  - Calculate recent items (last 7 days)
  - Return formatted statistics object
  - _Requirements: 8.1, 8.2_

- [x] 3.2 Create dashboard overview components

  - Create `components/admin/dashboard/StatCard.tsx`
  - Create `components/admin/dashboard/RecentActivity.tsx`
  - Create `components/admin/dashboard/DashboardOverview.tsx`
  - Add loading states and error handling
  - _Requirements: 8.1, 8.3, 8.5_

- [x] 3.3 Implement recent activity feed
  - Fetch recent audit logs from Firebase
  - Display activity items with icons and timestamps
  - Add click handlers to navigate to relevant sections
  - _Requirements: 8.3, 8.4_

## Phase 4: Blog Management

- [x] 4. Implement blog post management

  - Create blog list API and UI
  - Create blog editor with rich text support
  - Implement blog CRUD operations
  - Add image upload for blog covers
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4.1 Create blog list API

  - Create `app/api/admin/blog/route.ts` for GET (list all)
  - Read all MDX files from `contents/blog/` directory
  - Parse frontmatter and return blog list
  - Add sorting by date
  - _Requirements: 3.1_

- [x] 4.2 Create blog detail API

  - Create `app/api/admin/blog/[slug]/route.ts` for GET (single post)
  - Implement PUT for updating blog post
  - Implement DELETE for removing blog post
  - Add audit logging for all operations
  - _Requirements: 3.3, 3.5, 3.6_

- [x] 4.3 Create blog creation API

  - Add POST handler to `app/api/admin/blog/route.ts`
  - Validate blog data with Zod schema
  - Generate unique slug from title
  - Create MDX file with frontmatter
  - _Requirements: 3.2, 3.3_

- [x] 4.4 Create blog list UI

  - Create `app/admin-portal-x7k9m2p/blog/page.tsx`
  - Create `components/admin/blog/BlogList.tsx`
  - Display blog posts in table/grid with thumbnails
  - Add search and filter functionality
  - Add "Create New" button
  - _Requirements: 3.1_

- [x] 4.5 Create blog editor UI

  - Create `app/admin-portal-x7k9m2p/blog/[slug]/page.tsx`
  - Create `components/admin/blog/BlogEditor.tsx`
  - Add form fields for title, description, tags, content
  - Integrate markdown editor (react-markdown or TipTap)
  - Add image upload button for cover image
  - Add preview mode
  - _Requirements: 3.2, 3.4, 3.6_

- [x] 4.6 Implement blog image upload
  - Add image upload to blog editor
  - Upload to Cloudinary in 'blog' folder
  - Insert image URL into frontmatter
  - Show upload progress
  - _Requirements: 3.4_

## Phase 5: Project Management

- [ ] 5. Implement project management

  - Create project list API and UI
  - Create project editor
  - Implement project CRUD operations
  - Add project reordering functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 5.1 Create project API routes

  - Create `app/api/admin/projects/route.ts` for GET and POST
  - Create `app/api/admin/projects/[id]/route.ts` for PUT and DELETE
  - Read/write from `codemaliq.json` projects array
  - Add validation with Zod
  - _Requirements: 4.2, 4.3, 4.5_

- [ ] 5.2 Create project reorder API

  - Create `app/api/admin/projects/reorder/route.ts`
  - Accept new project order array
  - Update codemaliq.json with new order
  - Add audit logging
  - _Requirements: 4.6_

- [ ] 5.3 Create project list UI

  - Create `app/admin-portal-x7k9m2p/projects/page.tsx`
  - Create `components/admin/projects/ProjectList.tsx`
  - Display projects with drag-and-drop reordering
  - Add edit and delete buttons
  - _Requirements: 4.1, 4.6_

- [ ] 5.4 Create project editor UI
  - Create `app/admin-portal-x7k9m2p/projects/new/page.tsx`
  - Create `app/admin-portal-x7k9m2p/projects/[id]/page.tsx`
  - Create `components/admin/projects/ProjectEditor.tsx`
  - Add form fields for all project properties
  - Add tech stack multi-select
  - Add image upload for project thumbnail
  - _Requirements: 4.2, 4.3, 4.4_

## Phase 6: Chat Moderation

- [ ] 6. Implement chat moderation features

  - Create chat moderation API
  - Create chat moderation UI
  - Implement delete and flag functionality
  - Add admin reply feature
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.1 Create chat moderation API

  - Create `app/api/admin/chat/route.ts` for GET (all messages)
  - Create `app/api/admin/chat/[id]/route.ts` for DELETE
  - Create `app/api/admin/chat/[id]/flag/route.ts` for PUT
  - Create `app/api/admin/chat/reply/route.ts` for POST
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6.2 Create chat moderation UI

  - Create `app/admin-portal-x7k9m2p/chat/page.tsx`
  - Create `components/admin/chat/ChatModeration.tsx`
  - Display all messages with real-time updates
  - Add delete and flag buttons
  - Add reply functionality
  - Show admin badge on admin replies
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.3 Update Firebase rules for admin
  - Update `firebase-database-rules.json` to allow admin operations
  - Add rules for flagged messages
  - Test rules in Firebase console
  - _Requirements: 5.4_

## Phase 7: Media Library

- [ ] 7. Implement media library management

  - Create media library API
  - Create media library UI with grid view
  - Implement media upload with drag-and-drop
  - Add media deletion
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 7.1 Create media library API

  - Create `app/api/admin/media/route.ts` for GET and POST
  - Implement Cloudinary listing with pagination
  - Implement upload with validation
  - Create `app/api/admin/media/[id]/route.ts` for DELETE
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 7.2 Create media library UI

  - Create `app/admin-portal-x7k9m2p/media/page.tsx`
  - Create `components/admin/media/MediaLibrary.tsx`
  - Display media in responsive grid with thumbnails
  - Add search and filter by tags
  - Show image details on click
  - _Requirements: 9.1, 9.3, 9.5_

- [ ] 7.3 Create media uploader component

  - Create `components/admin/media/MediaUploader.tsx`
  - Implement drag-and-drop with react-dropzone
  - Add file validation (type, size)
  - Show upload progress
  - Display success/error messages
  - _Requirements: 9.2_

- [ ] 7.4 Add copy-to-clipboard functionality
  - Add copy button for media URLs
  - Show toast notification on copy
  - Support copying markdown image syntax
  - _Requirements: 9.3_

## Phase 8: Configuration Management

- [ ] 8. Implement configuration management

  - Create configuration API
  - Create configuration editor UI
  - Implement profile photo update
  - Add social links management
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8.1 Create configuration API

  - Create `app/api/admin/config/route.ts` for GET and PUT
  - Read from `codemaliq.json`
  - Validate configuration with Zod schema
  - Update codemaliq.json atomically
  - _Requirements: 10.1, 10.2, 10.5_

- [ ] 8.2 Create profile photo update API

  - Create `app/api/admin/config/profile-photo/route.ts`
  - Upload new photo to Cloudinary
  - Update all references (favicon, manifest, profile)
  - Update codemaliq.json and layout metadata
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 8.3 Create configuration editor UI

  - Create `app/admin-portal-x7k9m2p/config/page.tsx`
  - Create `components/admin/config/ConfigEditor.tsx`
  - Add sections for profile, social, SEO, contact
  - Add form validation
  - Show current values
  - _Requirements: 10.1, 10.3_

- [ ] 8.4 Create profile photo uploader
  - Create `components/admin/config/ProfilePhotoUploader.tsx`
  - Show current profile photo
  - Add upload button
  - Show preview before saving
  - _Requirements: 2.1, 2.2_

## Phase 9: Contact Management

- [ ] 9. Implement contact message management

  - Set up Firebase structure for contacts
  - Create contact management API
  - Create contact list UI
  - Add read/unread status
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9.1 Set up Firebase contacts structure

  - Update `firebase-database-rules.json` for contacts
  - Create contacts node in Firebase
  - Update contact form to save to Firebase
  - _Requirements: 6.1_

- [ ] 9.2 Create contact management API

  - Create `app/api/admin/contacts/route.ts` for GET
  - Create `app/api/admin/contacts/[id]/route.ts` for DELETE
  - Create `app/api/admin/contacts/[id]/read/route.ts` for PUT
  - Fetch from Firebase Realtime Database
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9.3 Create contact list UI

  - Create `app/admin-portal-x7k9m2p/contacts/page.tsx`
  - Create `components/admin/contacts/ContactList.tsx`
  - Display contacts with read/unread status
  - Add filter for unread messages
  - Add delete functionality
  - Show email link to reply
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9.4 Add notification badge
  - Create `components/admin/NotificationBadge.tsx`
  - Show unread contact count in sidebar
  - Update in real-time
  - _Requirements: 6.5_

## Phase 10: Learning Articles Management

- [ ] 10. Implement learning article management

  - Create learning article API
  - Create article list UI by category
  - Create article editor
  - Implement article CRUD operations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10.1 Create learning article API

  - Create `app/api/admin/learn/route.ts` for GET and POST
  - Create `app/api/admin/learn/[category]/[slug]/route.ts` for GET, PUT, DELETE
  - Read from `contents/learn/` directory structure
  - Parse MDX files with frontmatter
  - _Requirements: 7.1, 7.3, 7.5_

- [ ] 10.2 Create learning article list UI

  - Create `app/admin-portal-x7k9m2p/learn/page.tsx`
  - Create `components/admin/learn/ArticleList.tsx`
  - Group articles by category
  - Add category filter
  - Show article count per category
  - _Requirements: 7.1_

- [ ] 10.3 Create learning article editor UI
  - Create `app/admin-portal-x7k9m2p/learn/new/page.tsx`
  - Create `app/admin-portal-x7k9m2p/learn/[category]/[slug]/page.tsx`
  - Create `components/admin/learn/ArticleEditor.tsx`
  - Add category selector
  - Add markdown editor with image upload
  - Add preview mode
  - _Requirements: 7.2, 7.3, 7.4_

## Phase 11: Roadmap Management

- [ ] 11. Implement roadmap and skills management

  - Create roadmap API
  - Create roadmap list UI
  - Create roadmap editor
  - Add status management
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 11.1 Create roadmap API

  - Create `app/api/admin/roadmap/route.ts` for GET and POST
  - Create `app/api/admin/roadmap/[id]/route.ts` for PUT and DELETE
  - Read/write from `codemaliq.json` roadmap array
  - Add validation
  - _Requirements: 11.2, 11.3, 11.5_

- [ ] 11.2 Create roadmap list UI

  - Create `app/admin-portal-x7k9m2p/roadmap/page.tsx`
  - Create `components/admin/roadmap/RoadmapList.tsx`
  - Group by category
  - Show status badges
  - Add quick status update
  - _Requirements: 11.1, 11.4_

- [ ] 11.3 Create roadmap editor UI
  - Create `app/admin-portal-x7k9m2p/roadmap/new/page.tsx`
  - Create `app/admin-portal-x7k9m2p/roadmap/[id]/page.tsx`
  - Create `components/admin/roadmap/RoadmapEditor.tsx`
  - Add all roadmap fields
  - Add status selector
  - _Requirements: 11.2, 11.3, 11.4_

## Phase 12: Audit Log and Activity Tracking

- [ ] 12. Implement audit log viewing

  - Create audit log API
  - Create audit log UI
  - Add filtering and search
  - Display detailed action information
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 12.1 Create audit log viewing API

  - Create `app/api/admin/audit/route.ts` for GET
  - Fetch from Firebase with pagination
  - Add filtering by action type, date, resource
  - Return formatted audit logs
  - _Requirements: 12.2, 12.3_

- [ ] 12.2 Create audit log UI

  - Create `app/admin-portal-x7k9m2p/audit/page.tsx`
  - Create `components/admin/audit/AuditLog.tsx`
  - Display logs in timeline format
  - Show admin, action, resource, timestamp
  - Add pagination
  - _Requirements: 12.2_

- [ ] 12.3 Add audit log filtering
  - Create `components/admin/audit/AuditFilters.tsx`
  - Add filters for action type, date range, resource type
  - Add search by resource title
  - Update URL params for shareable filters
  - _Requirements: 12.3_

## Phase 13: Polish and Optimization

- [ ] 13. Polish UI and add final touches

  - Add loading states to all components
  - Add error boundaries
  - Implement toast notifications
  - Add confirmation dialogs for destructive actions
  - Optimize performance

- [ ] 13.1 Add loading states

  - Create `components/admin/LoadingSpinner.tsx`
  - Create `components/admin/LoadingSkeleton.tsx`
  - Add loading states to all data fetching
  - Add loading states to form submissions
  - _Requirements: 8.5_

- [ ] 13.2 Add error handling

  - Create `components/admin/ErrorBoundary.tsx`
  - Add error states to all components
  - Create `components/admin/ErrorMessage.tsx`
  - Add retry functionality
  - _Requirements: Error Handling section_

- [ ] 13.3 Add toast notifications

  - Install and configure toast library (sonner or react-hot-toast)
  - Add success toasts for all operations
  - Add error toasts with details
  - Add info toasts for background operations
  - _Requirements: All_

- [ ] 13.4 Add confirmation dialogs

  - Create `components/admin/ConfirmDialog.tsx`
  - Add confirmation for delete operations
  - Add confirmation for destructive updates
  - Show preview of what will be deleted
  - _Requirements: 3.5, 4.5, 5.2, 7.5, 9.3_

- [ ] 13.5 Optimize performance
  - Add React.memo to expensive components
  - Implement virtual scrolling for long lists
  - Add debouncing to search inputs
  - Optimize image loading with Next.js Image
  - Add code splitting for admin routes
  - _Requirements: Performance Optimization section_

## Phase 14: Testing and Documentation

- [ ] 14. Add tests and documentation

  - Write unit tests for utilities
  - Write integration tests for API routes
  - Create admin user documentation
  - Update environment variable documentation

- [ ]\* 14.1 Write unit tests for admin utilities

  - Test `isAdminUser()` function
  - Test file system utilities
  - Test slug generation
  - Test validation functions
  - _Requirements: Testing Strategy section_

- [ ]\* 14.2 Write API integration tests

  - Test blog CRUD operations
  - Test project CRUD operations
  - Test authentication middleware
  - Test audit logging
  - _Requirements: Testing Strategy section_

- [ ]\* 14.3 Write property-based tests

  - Test admin authentication invariant
  - Test file operation atomicity
  - Test audit log completeness
  - Test configuration validation
  - _Requirements: Testing Strategy section_

- [ ] 14.4 Create admin documentation

  - Create `ADMIN_SETUP.md` with setup instructions
  - Document how to add admin users
  - Document how to access admin dashboard
  - Document all admin features
  - Add troubleshooting section
  - _Requirements: All_

- [ ] 14.5 Update environment variables
  - Update `.env.example` with all admin variables
  - Document required Cloudinary settings
  - Document Firebase setup for contacts and audit logs
  - _Requirements: 1.2, 2.3_

## Phase 15: Final Checkpoint

- [ ] 15. Final testing and deployment preparation
  - Ensure all tests pass, ask the user if questions arise
  - Verify all features work end-to-end
  - Test on different screen sizes
  - Prepare deployment checklist
