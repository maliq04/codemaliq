# Blog Flow Test

## Current Issue
Blog posts showing "Blog Post Not Found"

## Expected Flow
1. User clicks blog card
2. BlogCard generates URL: `/blog/test-1?id=local-test-1&read-mode=true`
3. Page receives params: `{ slug: 'test-1' }` and searchParams: `{ id: 'local-test-1', 'read-mode': 'true' }`
4. getBlogDetail extracts `id` from searchParams
5. Checks if id starts with 'local-'
6. Reads file from `contents/blog/test-1.mdx`
7. Returns blog data

## Debug Steps
1. Check console logs for "getBlogDetail called with postId:"
2. Check if file is being read correctly
3. Verify URL structure matches expected format

## Files to Check
- `modules/blog/components/BlogCard.tsx` - URL generation
- `app/blog/[slug]/page.tsx` - Params handling
- `services/blog.ts` - File reading logic
