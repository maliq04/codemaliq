# GitHub API Setup

To display real GitHub contribution data on your dashboard, you need to set up a GitHub Personal Access Token.

## Steps to get real GitHub data:

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" > "Generate new token (classic)"
3. Give it a descriptive name like "Dashboard API"
4. Select the following scopes:
   - `public_repo` (for public repositories)
   - Or `repo` (if you want to include private repositories)
5. Click "Generate token"
6. **Important**: Copy the token immediately (you won't be able to see it again)

### 2. Add the token to your environment

1. Open `.env.local` file
2. Find the line: `GITHUB_TOKEN=""`
3. Replace it with: `GITHUB_TOKEN="your_token_here"`
4. Save the file

### 3. Restart the development server

```bash
npm run dev
```

## Example:

```env
# GitHub API
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## Security Notes:

- Never commit your token to version control
- The `.env.local` file is already in `.gitignore`
- Keep your token secure and don't share it
- You can revoke the token anytime from GitHub settings

## Current Status:

- **Username**: maliq04 (configured in `common/constant/github.ts`)
- **Mock Data**: Currently showing realistic mock data based on your profile
- **Real Data**: Will automatically switch to real data when token is configured

## Troubleshooting:

If you see "Failed to fetch GitHub data" in the console:

1. Check that your token is valid
2. Ensure the token has the correct scopes
3. Verify the username in `common/constant/github.ts` matches your GitHub username
