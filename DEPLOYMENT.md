# Deploying to Vercel

This project is configured for deployment on Vercel.

## Prerequisites

- A Vercel account
- The project pushed to a Git repository (GitHub, GitLab, Bitbucket)

## Steps to Deploy

1.  **Log in to Vercel** and click **"Add New..."** -> **"Project"**.
2.  **Import** the Git repository containing this project.
3.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect **Vite**. If not, select it.
    - **Root Directory**: Ensure this is set to the folder containing `package.json` (e.g., `tiktoksync-main`).
    - **Build Command**: `vite build` (or `npm run build`)
    - **Output Directory**: `dist`
4.  **Environment Variables**:
    You generally need to add the following environment variables (found in your `.env` file or Supabase project settings):
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_PUBLISHABLE_KEY`
5.  Click **Deploy**.

## Configuration Files

- `vercel.json`: Handles client-side routing (SPA) by rewriting all requests to `/index.html`.
