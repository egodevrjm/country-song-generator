# Vercel Deployment Instructions

## Important: Vercel Limitations

When deploying to Vercel, please note:
1. **API keys cannot be set in the UI** - You must use environment variables
2. **Song history is not persisted** - Vercel has a read-only filesystem

## Setup Instructions

### 1. Set Environment Variable in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your `country-song-generator` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `CLAUDE_API_KEY`
   - **Value**: Your Anthropic API key (starts with `sk-ant-...`)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### 2. Redeploy Your Application

After adding the environment variable:
1. Go to the **Deployments** tab
2. Click the three dots on the latest deployment
3. Select **Redeploy**
4. Wait for the deployment to complete

### 3. Alternative Solutions

If you prefer to handle API keys differently:

#### Option A: Client-Side Storage (Less Secure)
Modify the app to store the API key in localStorage and send it with each request. This is less secure but works with Vercel's limitations.

#### Option B: Use a Database
Use a service like:
- **Vercel KV** (Redis) for storing API keys and history
- **Upstash** for serverless Redis
- **PlanetScale** for MySQL
- **MongoDB Atlas** for document storage

#### Option C: Use Vercel Edge Functions
Create an edge function that stores the API key as an environment variable and proxies requests to Claude.

## Updated Server Code for Vercel

The server has been updated to:
- Detect when running on Vercel (`process.env.VERCEL === '1'`)
- Prevent API key setting via UI on Vercel
- Handle history gracefully (returns empty array)
- Show appropriate error messages

## Testing Your Deployment

1. Visit your deployed app
2. The API key should already be configured (check Settings)
3. Generate a song to test
4. Note: History won't persist between sessions

## Troubleshooting

### "API key couldn't be saved"
- This is expected on Vercel
- Set the key in environment variables instead

### "Failed to load history"
- History doesn't work on Vercel's read-only filesystem
- Consider using a database for persistence

### API Key Not Working
1. Verify the environment variable name is exactly `CLAUDE_API_KEY`
2. Check that you redeployed after adding the variable
3. Ensure your API key is valid and has credits

## Future Enhancements

To make the app fully functional on Vercel, consider:
1. Using Vercel KV for storing song history
2. Implementing user authentication
3. Using edge functions for better performance
