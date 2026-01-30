# Admin Dashboard Setup Guide

## Overview

The admin dashboard is a secure, feature-rich content management system for managing all website content. It provides a centralized interface for managing blog posts, projects, learning articles, chat moderation, media library, and configuration settings.

## Security Features

- **Obscured URL Route**: Admin dashboard is accessible at a non-obvious URL path
- **Email Whitelist Authentication**: Only authorized email addresses can access the dashboard
- **Google OAuth Integration**: Secure authentication via Google Sign-In
- **Session-Based Authorization**: All admin routes are protected by NextAuth sessions
- **SEO Protection**: Admin pages are excluded from search engine indexing

## Setup Instructions

### 1. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Admin Dashboard
ADMIN_EMAILS="your-admin-email@example.com,another-admin@example.com"
ADMIN_ROUTE_PATH="admin-portal-x7k9m2p"
```

**ADMIN_EMAILS**: Comma-separated list of email addresses that have admin access. These emails must match the Google accounts used to sign in.

**ADMIN_ROUTE_PATH**: The obscured URL path for the admin dashboard. You can change this to any random string for additional security.

### 2. Add Admin Users

To add a new admin user:

1. Open `.env.local`
2. Add the user's email to the `ADMIN_EMAILS` variable (comma-separated)
3. Restart the development server

Example:

```env
ADMIN_EMAILS="admin@example.com,manager@example.com,editor@example.com"
```

### 3. Access the Admin Dashboard

1. Navigate to: `http://localhost:3001/admin-portal-x7k9m2p` (or your configured route)
2. Sign in with your Google account
3. If your email is in the whitelist, you'll be granted access

## Admin Dashboard Features

### Dashboard Overview

- View statistics for all content types
- Quick actions for common tasks
- Recent activity feed

### Blog Management

- Create, edit, and delete blog posts
- Upload cover images
- Markdown editor with preview
- Tag management
- SEO metadata

### Project Management

- Add and manage portfolio projects
- Upload project images
- Reorder projects with drag-and-drop
- Tech stack management

### Chat Moderation

- View all chat messages in real-time
- Delete inappropriate messages
- Reply to users as admin
- Flag messages for review

### Learning Articles

- Create and manage educational content
- Organize by category
- Markdown editor with image upload
- Preview mode

### Roadmap Management

- Track learning goals and skills
- Update completion status
- Organize by category

### Contact Management

- View contact form submissions
- Mark messages as read/unread
- Delete old messages
- Quick email reply links

### Media Library

- Upload images to Cloudinary
- View all uploaded media
- Copy image URLs
- Delete unused media

### Configuration

- Update profile photo
- Manage social media links
- Edit site metadata
- Update contact information

### Audit Log

- View all admin actions
- Filter by action type and date
- Track changes for accountability

## Troubleshooting

### "Access Denied" Error

**Problem**: You see an "Access Denied" message after signing in.

**Solution**:

1. Verify your email is in the `ADMIN_EMAILS` environment variable
2. Make sure there are no typos in the email address
3. Restart the development server after updating `.env.local`
4. Clear your browser cache and try again

### Cannot Access Admin Dashboard

**Problem**: The admin dashboard URL returns a 404 error.

**Solution**:

1. Verify the `ADMIN_ROUTE_PATH` matches the URL you're accessing
2. Make sure the development server is running
3. Check that the admin route files exist in `app/admin-portal-x7k9m2p/`

### Session Expired

**Problem**: You're redirected to sign-in repeatedly.

**Solution**:

1. Clear your browser cookies
2. Sign out completely and sign in again
3. Check that `NEXTAUTH_SECRET` is set in `.env.local`
4. Verify `NEXTAUTH_URL` matches your development URL

### Google OAuth Not Working

**Problem**: Google sign-in fails or shows an error.

**Solution**:

1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
2. Check that the callback URL is configured in Google Cloud Console:
   - `http://localhost:3001/api/auth/callback/google`
3. Make sure the OAuth consent screen is configured
4. See `GOOGLE_OAUTH_SETUP.md` for detailed OAuth setup

## Security Best Practices

### Production Deployment

When deploying to production:

1. **Change the Admin Route Path**: Use a different, random string for `ADMIN_ROUTE_PATH`
2. **Use Strong Secrets**: Generate a new `NEXTAUTH_SECRET` using:
   ```bash
   openssl rand -base64 32
   ```
3. **Limit Admin Emails**: Only add necessary admin users to the whitelist
4. **Enable HTTPS**: Always use HTTPS in production
5. **Monitor Audit Logs**: Regularly review admin actions in the audit log
6. **Update Callback URLs**: Configure production callback URLs in Google Cloud Console

### Recommended Admin Route Paths

Generate a random string for your admin route:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Or use a password generator
# Example: admin-x7k9m2p4q8n3w5z
```

### Email Whitelist Management

- Use work/official email addresses for admin access
- Regularly audit the admin email list
- Remove access for users who no longer need it
- Keep a backup of the admin email list

## Development Workflow

### Testing Admin Features

1. Start the development server: `npm run dev`
2. Navigate to the admin dashboard
3. Sign in with an admin account
4. Test features in this order:
   - Dashboard overview
   - Blog post creation
   - Project management
   - Media upload
   - Configuration updates

### Adding New Admin Features

1. Add navigation item to `components/admin/AdminLayout.tsx`
2. Create new page in `app/admin-portal-x7k9m2p/[feature]/page.tsx`
3. Create API routes in `app/api/admin/[feature]/route.ts`
4. Add audit logging for all create/update/delete operations
5. Test with admin authentication

## Support

For issues or questions:

1. Check this documentation first
2. Review the audit log for error details
3. Check browser console for client-side errors
4. Review server logs for API errors

## Additional Resources

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [GitHub Setup Guide](./GITHUB_SETUP.md)
- [Admin Dashboard Design Document](./.kiro/specs/admin-dashboard/design.md)
- [Admin Dashboard Requirements](./.kiro/specs/admin-dashboard/requirements.md)
