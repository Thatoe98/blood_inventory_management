# Vercel Deployment Guide 🚀

## Quick Deployment Steps

### Step 1: Ensure Code is on GitHub ✅
Your code is already pushed to: `https://github.com/Thatoe98/blood_inventory_management.git`

### Step 2: Deploy to Vercel

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select: `Thatoe98/blood_inventory_management`

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables** (CRITICAL!)
   Click "Environment Variables" and add:
   
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [Your Supabase Project URL]
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [Your Supabase Anon Key]
   ```

   **Where to find these:**
   - Go to your Supabase project
   - Click "Settings" → "API"
   - Copy "Project URL" and "anon/public" key

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://your-project.vercel.app`

### Step 3: Configure Supabase for Production

**IMPORTANT:** After deployment, update Supabase settings:

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URLs:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: Add these URLs:
     ```
     https://your-project.vercel.app/**
     https://your-project.vercel.app
     ```

4. Go to **Settings** → **API**
   - Verify your API keys are correct
   - Check that RLS (Row Level Security) is properly configured

### Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Check all pages work:
   - Dashboard
   - Donors
   - Donations
   - Inventory
   - Hospitals
   - Campaigns
   - Patients

3. Test CRUD operations:
   - Create a new donor
   - Add a donation
   - Check if data persists

### Troubleshooting 🔧

**If you get errors:**

1. **"Supabase client not initialized"**
   - Check environment variables are set in Vercel
   - Verify the URLs don't have trailing slashes
   - Redeploy after adding env vars

2. **"Invalid API key"**
   - Make sure you're using the `anon/public` key, not the `service_role` key
   - Copy the key again from Supabase

3. **Build fails**
   - Check the build logs in Vercel
   - Make sure all dependencies are in package.json
   - Try running `npm run build` locally first

4. **Pages load but no data**
   - Check Supabase connection
   - Verify database tables exist
   - Check browser console for errors
   - Verify Row Level Security (RLS) policies

### Update Deployment

When you make changes:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically redeploy! 🎉

### Custom Domain (Optional)

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for DNS propagation (up to 48 hours)

### Environment Variables for Different Environments

Vercel allows environment variables for:
- **Production** (main branch)
- **Preview** (pull requests)
- **Development** (local)

Make sure to set them for the correct environment!

### Performance Tips

1. **Enable Edge Caching**
   - Vercel automatically caches static assets
   - Your images and fonts are CDN-served

2. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor build times
   - Check function execution logs

3. **Optimize Images**
   - Use Next.js Image component
   - Images are automatically optimized

### Security Checklist ✅

- [ ] Environment variables set in Vercel (not in code)
- [ ] `.env.local` added to `.gitignore`
- [ ] Supabase RLS policies configured
- [ ] Supabase URL whitelist updated
- [ ] No sensitive keys in repository
- [ ] HTTPS enabled (automatic on Vercel)

### Useful Vercel Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from command line
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

### Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

---

## Your Project URLs

- **GitHub**: https://github.com/Thatoe98/blood_inventory_management
- **Vercel**: [Will be generated after deployment]
- **Supabase**: [Your Supabase project URL]

---

**Ready to deploy?** Go to https://vercel.com/new and import your GitHub repository!
