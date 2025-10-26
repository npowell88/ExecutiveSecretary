# Executive Secretary - Production Deployment Guide

This guide walks you through deploying the Executive Secretary to production using Vercel (recommended) or other hosting platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Deployment Option 1: Vercel (Recommended)](#deployment-option-1-vercel-recommended)
- [Deployment Option 2: Other Platforms](#deployment-option-2-other-platforms)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Domain Setup](#domain-setup)
- [Security Checklist](#security-checklist)

---

## Prerequisites

Before deploying to production, ensure you have:

- [ ] GitHub account (for deploying to Vercel)
- [ ] Production domain name (optional but recommended)
- [ ] PostgreSQL database (Neon or Supabase free tier)
- [ ] Google Cloud project for OAuth
- [ ] Anthropic API account
- [ ] Aurinko API account

---

## Deployment Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps and offers a generous free tier.

### Step 1: Prepare Your Code (5 minutes)

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Executive Secretary"
   ```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository called `executive-secretary`
   - Follow the instructions to push your code:
     ```bash
     git remote add origin https://github.com/YOUR-USERNAME/executive-secretary.git
     git branch -M main
     git push -u origin main
     ```

### Step 2: Set Up Production Database (10 minutes)

We'll use Neon's free tier for PostgreSQL:

1. Go to https://neon.tech
2. Sign up/log in
3. Create a new project:
   - Name: `executive-secretary-prod`
   - Region: Choose closest to your users
4. Copy the connection string (starts with `postgresql://`)
5. Save it - you'll need it for environment variables

### Step 3: Configure OAuth Providers (20 minutes)

Set up your OAuth credentials BEFORE deploying so you have all environment variables ready.

#### Generate NextAuth Secret:

```bash
openssl rand -base64 32
```

Save this value - you'll need it for `NEXTAUTH_SECRET`.

#### Google OAuth:

1. Go to https://console.cloud.google.com
2. Select your project (or create new one: "Executive Secretary Production")
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Name: "Executive Secretary Production"
7. **Authorized redirect URIs** (you'll add your actual Vercel URL later, but set up the client now):
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   (You'll update this with production URL after deploying)

8. Click "Create"
9. **Save these values**:
   - Client ID: `GOOGLE_CLIENT_ID`
   - Client Secret: `GOOGLE_CLIENT_SECRET`

10. **Configure OAuth Consent Screen**:
    - Go to "OAuth consent screen"
    - User Type: "External"
    - Fill in app name: "Executive Secretary"
    - User support email: your email
    - Developer contact: your email
    - Save

#### Microsoft OAuth (Optional - for Outlook support):

1. Go to https://portal.azure.com
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name: "Executive Secretary Production"
5. Supported account types: "Accounts in any organizational directory"
6. Redirect URI: Web, `http://localhost:3000/api/auth/callback/azure-ad`
7. Register
8. **Save these values**:
   - Application (client) ID: `MICROSOFT_CLIENT_ID`
9. Go to "Certificates & secrets" → "New client secret"
10. Description: "Production secret"
11. Expires: 24 months
12. **Save this value**: `MICROSOFT_CLIENT_SECRET`

#### Aurinko Calendar API:

1. Go to https://aurinko.io
2. Sign up/log in
3. Create a new application:
   - Name: "Executive Secretary Production"
4. **Save these values**:
   - Client ID: `AURINKO_CLIENT_ID`
   - Client Secret: `AURINKO_CLIENT_SECRET`
   - App Secret: `AURINKO_APP_SECRET`
5. Add callback URL (you'll update with production URL after deploying):
   ```
   http://localhost:3000/api/calendar/callback
   ```

#### Anthropic API:

1. Go to https://console.anthropic.com
2. Sign up/log in
3. Go to "API Keys"
4. Create a new key
5. **Save this value**: `ANTHROPIC_API_KEY` (starts with `sk-ant-`)

**Keep all these credentials handy** - you'll add them to Vercel in the next step.

### Step 4: Deploy to Vercel (10 minutes)

1. Go to https://vercel.com
2. Sign up/log in with GitHub
3. Click "Add New Project"
4. Import your `executive-secretary` repository
5. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

6. **Add Environment Variables**:
   Click "Environment Variables" and add these (click "Add" after each):

   ```
   DATABASE_URL = postgresql://your-neon-connection-string-from-step-2

   NEXTAUTH_URL = https://your-app.vercel.app
   NEXTAUTH_SECRET = [the value you generated in Step 3]

   GOOGLE_CLIENT_ID = [from Google Cloud Console]
   GOOGLE_CLIENT_SECRET = [from Google Cloud Console]

   AURINKO_CLIENT_ID = [from Aurinko dashboard]
   AURINKO_CLIENT_SECRET = [from Aurinko dashboard]
   AURINKO_APP_SECRET = [from Aurinko dashboard]

   ANTHROPIC_API_KEY = [from Anthropic console]
   ```

   **Optional (for Outlook support):**
   ```
   MICROSOFT_CLIENT_ID = [from Azure Portal]
   MICROSOFT_CLIENT_SECRET = [from Azure Portal]
   ```

7. Click "Deploy"
8. Wait 2-3 minutes for the build to complete
9. You'll get a URL like `https://executive-secretary-abc123.vercel.app`

### Step 5: Update OAuth Redirect URIs (10 minutes)

Now that you have your Vercel URL, update all OAuth providers with the production redirect URIs:

#### Google OAuth:

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID (the one you created in Step 3)
5. Add **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
   (Replace `your-app.vercel.app` with your actual Vercel URL from Step 4)

6. Click "Save"

#### Microsoft OAuth (if using):

1. Go to https://portal.azure.com
2. Navigate to "Azure Active Directory" → "App registrations"
3. Select your app (created in Step 3)
4. Go to "Authentication"
5. Add redirect URI:
   ```
   https://your-app.vercel.app/api/auth/callback/azure-ad
   ```
6. Save

#### Aurinko Calendar API:

1. Go to https://aurinko.io
2. Sign in to your account
3. Go to your application settings (created in Step 3)
4. Update callback URL:
   ```
   https://your-app.vercel.app/api/calendar/callback
   ```
5. Save

### Step 6: Initialize Database (5 minutes)

1. In your Vercel dashboard, go to your project
2. Click "Settings" → "General" → scroll to "Build & Development Settings"
3. Or use Vercel CLI:

   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.production
   ```

4. **Push database schema**:
   ```bash
   # Using the production database URL
   DATABASE_URL="postgresql://..." npx prisma db push
   ```

5. **Create your first user**:
   ```bash
   DATABASE_URL="postgresql://..." npm run setup "Your Ward" "Your Stake" "your-email@gmail.com"
   ```

   Or use Prisma Studio:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma studio
   ```

### Step 7: Test Your Deployment (10 minutes)

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Click "Admin Portal" → "Sign in"
3. Sign in with Google using your email
4. Configure your ward settings
5. Connect your calendar
6. Test the scheduling flow at `/schedule`

---

## Deployment Option 2: Other Platforms

### Railway.app

1. Go to https://railway.app
2. Create new project from GitHub repo
3. Add PostgreSQL database (from Railway marketplace)
4. Set environment variables in Railway dashboard
5. Deploy automatically on git push

### DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Create app from GitHub repo
3. Add managed PostgreSQL database
4. Configure environment variables
5. Deploy

### AWS (EC2 + RDS)

More complex but full control:
1. Set up RDS PostgreSQL instance
2. Launch EC2 instance with Node.js
3. Clone repo and build
4. Use PM2 for process management
5. Configure nginx as reverse proxy
6. Set up SSL with Let's Encrypt

### Self-Hosted (VPS)

Requirements:
- Ubuntu 22.04+ server
- Node.js 18+
- PostgreSQL 14+
- Nginx
- SSL certificate

Basic setup:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Clone and build
git clone https://github.com/YOUR-USERNAME/executive-secretary.git
cd executive-secretary
npm install
npm run build

# Set up environment variables
nano .env.production

# Run with PM2
npm install -g pm2
pm2 start npm --name "executive-secretary" -- start
pm2 startup
pm2 save

# Configure Nginx (see nginx config below)
```

---

## Domain Setup

### Using a Custom Domain with Vercel

1. **Add domain in Vercel**:
   - Go to your project settings
   - Click "Domains"
   - Add your domain (e.g., `executive-secretary.yourward.org`)

2. **Configure DNS**:
   - Add a CNAME record in your DNS provider:
     ```
     Type: CNAME
     Name: scheduler (or @ for root domain)
     Value: cname.vercel-dns.com
     ```

3. **Update environment variables**:
   - Change `NEXTAUTH_URL` to `https://executive-secretary.yourward.org`
   - Redeploy the app

4. **Update OAuth redirect URIs**:
   - Update Google OAuth redirect URIs
   - Update Microsoft OAuth redirect URIs (if using)
   - Update Aurinko callback URLs

### SSL Certificate (Auto with Vercel)

Vercel automatically provisions SSL certificates. For self-hosted:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d executive-secretary.yourward.org

# Auto-renewal is set up automatically
```

---

## Post-Deployment Configuration

### 1. Update NextAuth URL

In Vercel dashboard → Settings → Environment Variables:
```
NEXTAUTH_URL = https://your-production-domain.com
```

Redeploy after changing.

### 2. Configure OAuth Consent Screen (Google)

For production use beyond test users:

1. Go to Google Cloud Console → OAuth consent screen
2. Change from "Testing" to "Production"
3. Fill in privacy policy URL (create a simple one)
4. Fill in terms of service URL (optional)
5. Submit for verification (Google will review)

### 3. Set Up Monitoring (Recommended)

**Vercel Analytics** (built-in):
- Automatically enabled
- View in Vercel dashboard

**Error Tracking with Sentry**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to environment variables:
```
SENTRY_DSN=your-sentry-dsn
```

### 4. Database Backups

**Neon** (automatic):
- Automatic backups included
- Point-in-time recovery available

**Manual backups**:
```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20241012.sql
```

### 5. Set Up Email Notifications (Optional)

For sending calendar invites via email:

1. **Use SendGrid** (free tier: 100 emails/day):
   - Sign up at https://sendgrid.com
   - Get API key
   - Add to environment variables:
     ```
     SENDGRID_API_KEY=your-api-key
     FROM_EMAIL=noreply@yourward.org
     ```

2. **Or use Gmail SMTP**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

---

## Security Checklist

Before going live, ensure:

- [ ] HTTPS is enabled (auto with Vercel)
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] Database connection string is secure
- [ ] All API keys are in environment variables (not in code)
- [ ] OAuth redirect URIs are restricted to your domain
- [ ] Google OAuth consent screen is configured
- [ ] Rate limiting is considered (Vercel has basic DDoS protection)
- [ ] Database backups are enabled
- [ ] Error monitoring is set up
- [ ] Test all OAuth flows in production
- [ ] Test calendar integration thoroughly
- [ ] Test AI chat with various scenarios

### Optional Security Enhancements

1. **Encrypt calendar tokens in database**:
   - Install: `npm install @aws-sdk/client-kms` or similar
   - Encrypt tokens before storing
   - Decrypt when retrieving

2. **Add rate limiting**:
   - Use Vercel Edge Config
   - Or Upstash Redis for rate limiting

3. **Add CORS restrictions**:
   - Limit API access to your domain only

4. **Enable audit logging**:
   - Log all admin actions
   - Track appointment changes

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code is pushed to GitHub
- [ ] Database is created and accessible
- [ ] All environment variables are ready
- [ ] OAuth providers are configured

### Deployment
- [ ] App deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Database schema pushed (`prisma db push`)
- [ ] First user created
- [ ] Custom domain configured (if applicable)

### Post-Deployment
- [ ] OAuth redirect URIs updated for production
- [ ] Aurinko callback URLs updated
- [ ] Test sign-in flow
- [ ] Test calendar connection
- [ ] Test appointment scheduling
- [ ] SSL certificate verified
- [ ] Error monitoring configured
- [ ] Backups verified

### Go-Live
- [ ] Create ward and users via setup script
- [ ] Test complete user flow
- [ ] Share scheduling link with ward
- [ ] Monitor logs for first few days
- [ ] Have support plan for issues

---

## Maintenance & Updates

### Updating the App

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push origin main

# Vercel auto-deploys on push to main
```

### Database Migrations

When you change the schema:

```bash
# Update schema in prisma/schema.prisma
# Then push changes
npx prisma db push

# Or use migrations for better control
npx prisma migrate dev --name description
npx prisma migrate deploy  # in production
```

### Monitoring

- Check Vercel dashboard for errors
- Monitor database usage in Neon dashboard
- Check Anthropic API usage
- Review Sentry errors (if configured)

---

## Cost Estimates

### Free Tier (Perfectly viable for one ward):
- **Vercel**: Free (hobby tier)
- **Neon Database**: Free (0.5GB storage)
- **Anthropic API**: Pay per use (~$0.01-0.05 per conversation)
- **Aurinko**: Free tier available
- **Total**: ~$5-10/month for Anthropic API only

### Paid Tier (For multiple wards or high usage):
- **Vercel Pro**: $20/month
- **Neon Scale**: $19/month (starts)
- **Anthropic API**: Based on usage
- **Aurinko Pro**: $29/month
- **Total**: ~$70-100/month

---

## Support & Troubleshooting

### Common Production Issues

**"Unauthorized" errors**:
- Check `NEXTAUTH_URL` matches your domain exactly
- Verify OAuth redirect URIs are correct
- Check that user exists in database

**Calendar not syncing**:
- Verify Aurinko callback URL is production URL
- Check calendar connection in database
- Test OAuth flow manually

**Database connection errors**:
- Check `DATABASE_URL` is correct
- Verify Neon database is active
- Check IP allowlist if configured

**Build failures**:
- Check build logs in Vercel
- Verify all dependencies are in package.json
- Check TypeScript errors

### Getting Help

- Check Vercel deployment logs
- Review browser console errors
- Check Prisma Studio for data issues
- Review API error responses
- Contact API support (Aurinko, Anthropic)

---

## Congratulations!

Your Executive Secretary is now live in production! 🎉

**Next steps**:
1. Add your ward members
2. Invite bishopric to connect calendars
3. Share scheduling link with ward
4. Monitor usage and errors
5. Gather feedback and iterate

For questions or issues, refer to the main [README.md](README.md) and [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).
