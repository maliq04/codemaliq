# Requirements Document

## Introduction

This document outlines the requirements for a secure, hidden admin dashboard for the codemaliq portfolio website. The dashboard will provide comprehensive content management capabilities, eliminating manual file editing and enabling efficient administration of the entire system through a web interface.

## Glossary

- **Admin Dashboard**: A secure web interface accessible only to authorized administrators for managing website content
- **Admin User**: An authenticated user with administrator privileges, verified by email whitelist
- **Content Management**: The ability to create, read, update, and delete website content through the dashboard
- **Obscured Route**: A URL path that is intentionally difficult to guess or discover, providing security through obscurity
- **Session**: An authenticated user's active connection to the system via NextAuth
- **Cloudinary**: The cloud-based image and media management service used for storing uploaded assets
- **MDX Content**: Markdown files with JSX support used for blog posts and learning articles
- **Firebase Realtime Database**: The real-time database service used for chat messages

## Requirements

### Requirement 1: Secure Admin Authentication

**User Story:** As a website owner, I want only authorized administrators to access the admin dashboard, so that unauthorized users cannot modify website content.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access the admin dashboard THEN the system SHALL redirect them to the Google OAuth sign-in page
2. WHEN a user signs in with Google THEN the system SHALL verify their email address against an admin whitelist stored in environment variables
3. WHEN a non-admin user attempts to access the admin dashboard THEN the system SHALL display an "Access Denied" message and prevent access
4. WHEN an admin user successfully authenticates THEN the system SHALL grant access to all dashboard features
5. WHERE the admin dashboard route is accessed, the system SHALL use an obscured URL path that is difficult to guess

### Requirement 2: Profile Photo Management

**User Story:** As an admin, I want to update my profile photo through the dashboard, so that I can keep my portfolio image current without editing code.

#### Acceptance Criteria

1. WHEN an admin views the profile management section THEN the system SHALL display the current profile photo
2. WHEN an admin uploads a new profile photo THEN the system SHALL validate the file is an image format (jpg, png, webp)
3. WHEN a valid image is uploaded THEN the system SHALL upload it to Cloudinary and update the image URL in the configuration
4. WHEN the profile photo is updated THEN the system SHALL update all references including favicon, manifest icons, and profile displays
5. WHEN an upload fails THEN the system SHALL display a clear error message and maintain the existing photo

### Requirement 3: Blog Post Management

**User Story:** As an admin, I want to create, edit, and delete blog posts through the dashboard, so that I can manage my blog content efficiently.

#### Acceptance Criteria

1. WHEN an admin views the blog management section THEN the system SHALL display a list of all existing blog posts with title, date, and status
2. WHEN an admin creates a new blog post THEN the system SHALL provide a form with fields for title, slug, description, image, content, and tags
3. WHEN an admin saves a blog post THEN the system SHALL create or update the MDX file in the contents/blog directory
4. WHEN an admin uploads a blog cover image THEN the system SHALL upload it to Cloudinary and insert the URL into the post metadata
5. WHEN an admin deletes a blog post THEN the system SHALL remove the MDX file and confirm the deletion
6. WHEN an admin edits existing content THEN the system SHALL preserve the original file structure and frontmatter format

### Requirement 4: Project Management

**User Story:** As an admin, I want to manage my portfolio projects through the dashboard, so that I can showcase my work without editing JSON files.

#### Acceptance Criteria

1. WHEN an admin views the projects section THEN the system SHALL display all projects from codemaliq.json with thumbnails and details
2. WHEN an admin creates a new project THEN the system SHALL provide fields for title, description, image, tech stack, link, and repository
3. WHEN an admin saves a project THEN the system SHALL update the codemaliq.json file with the new project data
4. WHEN an admin uploads a project image THEN the system SHALL upload it to Cloudinary and store the URL
5. WHEN an admin deletes a project THEN the system SHALL remove it from codemaliq.json and confirm the deletion
6. WHEN an admin reorders projects THEN the system SHALL update the project array order in codemaliq.json

### Requirement 5: Chat Room Moderation

**User Story:** As an admin, I want to moderate chat messages and reply to users, so that I can maintain a positive community environment.

#### Acceptance Criteria

1. WHEN an admin views the chat moderation section THEN the system SHALL display all chat messages in real-time from Firebase
2. WHEN an admin deletes a chat message THEN the system SHALL remove it from Firebase Realtime Database immediately
3. WHEN an admin replies to a chat message THEN the system SHALL post the reply with admin identification
4. WHEN an admin marks a message as inappropriate THEN the system SHALL hide it from public view while preserving it for records
5. WHEN new messages arrive THEN the system SHALL update the chat list in real-time without page refresh

### Requirement 6: Contact Message Management

**User Story:** As an admin, I want to view and manage contact form submissions, so that I can respond to inquiries efficiently.

#### Acceptance Criteria

1. WHEN an admin views the contact management section THEN the system SHALL display all contact form submissions with name, email, message, and date
2. WHEN an admin marks a contact message as read THEN the system SHALL update its status
3. WHEN an admin deletes a contact message THEN the system SHALL remove it from the database
4. WHEN an admin clicks on an email address THEN the system SHALL open the default email client with a pre-filled reply
5. WHEN new contact submissions arrive THEN the system SHALL display a notification badge with the count of unread messages

### Requirement 7: Learning Article Management

**User Story:** As an admin, I want to create and manage learning articles through the dashboard, so that I can share educational content easily.

#### Acceptance Criteria

1. WHEN an admin views the learning content section THEN the system SHALL display all learning articles organized by category
2. WHEN an admin creates a new learning article THEN the system SHALL provide fields for title, slug, category, description, and content
3. WHEN an admin saves a learning article THEN the system SHALL create or update the MDX file in the contents/learn directory
4. WHEN an admin uploads images for an article THEN the system SHALL upload them to Cloudinary and insert markdown image syntax
5. WHEN an admin deletes a learning article THEN the system SHALL remove the MDX file and confirm the deletion

### Requirement 8: Dashboard Overview and Analytics

**User Story:** As an admin, I want to see an overview of my website's content and activity, so that I can understand engagement at a glance.

#### Acceptance Criteria

1. WHEN an admin accesses the dashboard home THEN the system SHALL display summary statistics for blog posts, projects, chat messages, and contact submissions
2. WHEN statistics are displayed THEN the system SHALL show counts for total items, recent items (last 7 days), and pending actions
3. WHEN an admin views recent activity THEN the system SHALL display the 10 most recent actions across all content types
4. WHEN an admin clicks on a statistic THEN the system SHALL navigate to the relevant management section
5. WHEN data is loading THEN the system SHALL display loading indicators for each section

### Requirement 9: Media Library Management

**User Story:** As an admin, I want to manage all uploaded media files, so that I can organize and reuse images across the website.

#### Acceptance Criteria

1. WHEN an admin views the media library THEN the system SHALL display all images uploaded to Cloudinary with thumbnails
2. WHEN an admin uploads new media THEN the system SHALL support drag-and-drop and file selection
3. WHEN an admin clicks on a media item THEN the system SHALL display the full image and provide a copy-to-clipboard button for the URL
4. WHEN an admin deletes media THEN the system SHALL remove it from Cloudinary and confirm the deletion
5. WHEN an admin searches media THEN the system SHALL filter results by filename or tags

### Requirement 10: Configuration Management

**User Story:** As an admin, I want to update website configuration settings, so that I can modify site metadata and settings without editing code.

#### Acceptance Criteria

1. WHEN an admin views the configuration section THEN the system SHALL display editable fields for site title, description, social links, and contact information
2. WHEN an admin updates configuration THEN the system SHALL validate the input and update codemaliq.json
3. WHEN an admin saves configuration changes THEN the system SHALL display a success message and reflect changes immediately
4. WHEN an admin updates social media links THEN the system SHALL validate URL formats
5. WHEN configuration updates fail THEN the system SHALL display specific error messages and preserve the previous values

### Requirement 11: Roadmap and Skills Management

**User Story:** As an admin, I want to manage my learning roadmap and skills, so that I can keep my professional development journey up to date.

#### Acceptance Criteria

1. WHEN an admin views the roadmap section THEN the system SHALL display all roadmap items organized by category
2. WHEN an admin creates a new roadmap item THEN the system SHALL provide fields for title, description, category, status, and link
3. WHEN an admin updates a roadmap item THEN the system SHALL save changes to codemaliq.json
4. WHEN an admin marks a skill as completed THEN the system SHALL update the status and display completion date
5. WHEN an admin deletes a roadmap item THEN the system SHALL remove it from codemaliq.json

### Requirement 12: Audit Log and Activity Tracking

**User Story:** As an admin, I want to see a log of all administrative actions, so that I can track changes and maintain accountability.

#### Acceptance Criteria

1. WHEN an admin performs any create, update, or delete action THEN the system SHALL record the action with timestamp, user, and details
2. WHEN an admin views the audit log THEN the system SHALL display all actions in reverse chronological order
3. WHEN an admin filters the audit log THEN the system SHALL support filtering by action type, date range, and content type
4. WHEN an audit entry is created THEN the system SHALL store it in Firebase with the admin's email and action details
5. WHEN the audit log exceeds 1000 entries THEN the system SHALL archive older entries while keeping recent ones accessible
