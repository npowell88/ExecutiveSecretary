# Production Deployment Checklist

Use this checklist to ensure a smooth deployment of the Executive Secretary application.

## Pre-Deployment

### Code Preparation
- [ ] Code is committed to Git
- [ ] Repository is pushed to GitHub
- [ ] `.env` files are in `.gitignore` (never commit secrets!)
- [ ] All dependencies are in `package.json`
- [ ] Build succeeds locally (`npm run build`)

### Account Setup
- [ ] Vercel account created
- [ ] Neon (or other) database account created
- [ ] Google Cloud Console project created
- [ ] Aurinko account created and app configured
- [ ] Anthropic account created with API key
- [ ] (Optional) Microsoft Azure account for Outlook support

### Database
- [ ] Production database created on Neon/Supabase
- [ ] Connection string saved securely
- [ ] Database is accessible from Vercel (no IP restrictions)

### OAuth Configuration
- [ ] Google OAuth Client ID created
- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] Test users added (or app verified for production)
- [ ] (Optional) Microsoft OAuth app registered

## Deployment

### Vercel Setup
- [ ] Project imported to Vercel from GitHub
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Build settings are default (no changes needed)
- [ ] All environment variables added from [.env.production.example](.env.production.example):
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL` (set to Vercel URL initially)
  - [ ] `NEXTAUTH_SECRET` (generated with `openssl rand -base64 32`)
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `AURINKO_CLIENT_ID`
  - [ ] `AURINKO_CLIENT_SECRET`
  - [ ] `AURINKO_APP_SECRET`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] (Optional) `MICROSOFT_CLIENT_ID`
  - [ ] (Optional) `MICROSOFT_CLIENT_SECRET`

### Initial Deployment
- [ ] Deployment triggered (takes 2-3 minutes)
- [ ] Build succeeds without errors
- [ ] App is accessible at Vercel URL
- [ ] Deployment URL noted (e.g., `https://executive-secretary-abc123.vercel.app`)

## Post-Deployment

### Database Setup
- [ ] Schema pushed to production database:
  ```bash
  DATABASE_URL="production-url" npx prisma db push
  ```
- [ ] First ward and user created:
  ```bash
  DATABASE_URL="production-url" npm run setup "Ward Name" "Stake" "admin@email.com"
  ```
- [ ] Database verified using Prisma Studio or Neon console

### OAuth Configuration Updates
- [ ] Google OAuth redirect URI updated to production URL:
  - `https://your-vercel-url.vercel.app/api/auth/callback/google`
- [ ] Aurinko callback URL updated to production URL:
  - `https://your-vercel-url.vercel.app/api/calendar/callback`
- [ ] (Optional) Microsoft OAuth redirect URI updated:
  - `https://your-vercel-url.vercel.app/api/auth/callback/azure-ad`

### Testing
- [ ] Can access homepage at production URL
- [ ] Can access `/auth/signin` page
- [ ] Can sign in with Google OAuth
- [ ] Redirected to admin dashboard after sign in
- [ ] Can access ward settings
- [ ] Can connect calendar via Aurinko
- [ ] Can access `/schedule` page
- [ ] AI chat responds properly
- [ ] Test complete scheduling flow:
  - [ ] Chat asks for name
  - [ ] Chat asks for email
  - [ ] Chat asks for interview type
  - [ ] Chat shows available times
  - [ ] Can select and confirm appointment
  - [ ] Appointment appears in database
  - [ ] Appointment appears in calendar (if bishopric calendar connected)

## Custom Domain (Optional)

If using a custom domain:

### Domain Configuration
- [ ] Domain purchased/available (e.g., executive-secretary.yourward.org)
- [ ] Domain added in Vercel project settings
- [ ] DNS CNAME record added:
  - Type: `CNAME`
  - Name: `scheduler` (or `@` for root)
  - Value: `cname.vercel-dns.com`
- [ ] SSL certificate provisioned (automatic with Vercel)
- [ ] Domain is accessible via HTTPS

### Update Environment Variables
- [ ] `NEXTAUTH_URL` updated to custom domain in Vercel
- [ ] App redeployed after variable change

### Update OAuth Settings
- [ ] Google OAuth redirect URI updated to custom domain:
  - `https://executive-secretary.yourward.org/api/auth/callback/google`
- [ ] Aurinko callback URL updated to custom domain:
  - `https://executive-secretary.yourward.org/api/calendar/callback`
- [ ] (Optional) Microsoft OAuth redirect URI updated to custom domain

### Test with Custom Domain
- [ ] Can access app at custom domain
- [ ] OAuth flows work with custom domain
- [ ] Calendar connection works with custom domain

## Security Verification

### Access Control
- [ ] Only authorized users can access `/admin/*` routes
- [ ] Public scheduling page (`/schedule`) is accessible
- [ ] OAuth flows require proper authentication
- [ ] Calendar tokens are stored securely

### HTTPS/SSL
- [ ] App is accessible via HTTPS only
- [ ] SSL certificate is valid (check with browser)
- [ ] No mixed content warnings

### Environment Variables
- [ ] All secrets are in environment variables (not in code)
- [ ] `.env` files are not committed to Git
- [ ] Production secrets are different from development

### API Security
- [ ] Google OAuth is restricted to authorized redirect URIs
- [ ] Microsoft OAuth (if used) is restricted to authorized URIs
- [ ] Aurinko callbacks are restricted to your domain
- [ ] Anthropic API key is secure and usage monitored

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] Vercel Analytics reviewed (automatic)
- [ ] (Optional) Sentry configured for error tracking
- [ ] (Optional) Database monitoring enabled (Neon dashboard)
- [ ] (Optional) API usage monitoring configured

### Backups
- [ ] Database backups enabled (automatic with Neon)
- [ ] Backup restoration process tested
- [ ] Calendar data sync verified

### Documentation
- [ ] Admin credentials documented securely
- [ ] Deployment process documented for team
- [ ] Support contact information set up

## Go-Live

### Final Checks
- [ ] All checklist items above completed
- [ ] Admin account accessible
- [ ] Test user flow end-to-end
- [ ] Error pages display correctly (test 404, 500)
- [ ] Mobile responsiveness verified

### Ward Configuration
- [ ] Ward information updated (name, stake)
- [ ] Interview types configured
- [ ] Bishopric members invited and calendars connected
- [ ] Availability blocks created in bishopric calendars
- [ ] Test appointment created and verified

### Communication
- [ ] Public scheduling URL obtained from ward settings
- [ ] URL shared with bishopric for testing
- [ ] Instructions prepared for ward members
- [ ] Support process established for issues

### Launch
- [ ] Scheduling link shared with ward via:
  - [ ] Email to ward list
  - [ ] Text to ward members
  - [ ] Ward bulletin announcement
  - [ ] Ward website/Facebook page
  - [ ] Bishopric announcements
- [ ] Monitor for first appointments
- [ ] Be ready to provide support

## Post-Launch

### First 24 Hours
- [ ] Monitor Vercel deployment logs
- [ ] Check for error reports
- [ ] Verify appointments are being created
- [ ] Ensure calendar sync is working
- [ ] Respond to user questions/issues

### First Week
- [ ] Review appointment volume
- [ ] Check Anthropic API usage and costs
- [ ] Gather feedback from bishopric
- [ ] Gather feedback from ward members
- [ ] Make any needed adjustments

### Ongoing Maintenance
- [ ] Weekly: Review error logs
- [ ] Weekly: Check database usage
- [ ] Monthly: Review API costs
- [ ] Monthly: Update dependencies (`npm outdated`)
- [ ] Quarterly: Rotate API keys/secrets
- [ ] As needed: Update interview types
- [ ] As needed: Update bishopric members

## Troubleshooting

Common issues and solutions:

### "Unauthorized" on sign in
- Verify OAuth redirect URIs match exactly
- Check that user exists in database
- Verify `NEXTAUTH_URL` is correct

### Calendar not connecting
- Check Aurinko callback URL is correct
- Verify calendar API is enabled (Google)
- Test OAuth flow manually

### No available time slots
- Verify bishopric calendars are connected
- Check for events with "INTERVIEW-AVAIL" title
- Verify interview types are assigned to bishopric members

### Build failures
- Check Vercel build logs
- Verify all dependencies in package.json
- Test build locally: `npm run build`

### Database connection errors
- Verify DATABASE_URL is correct
- Check database is active (Neon dashboard)
- Verify no IP restrictions blocking Vercel

## Support Resources

- **Documentation**: [README.md](README.md), [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Vercel Support**: https://vercel.com/help
- **Neon Support**: https://neon.tech/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org
- **Aurinko Docs**: https://docs.aurinko.io

---

## Summary

Once all items are checked:

✅ **Your Executive Secretary is successfully deployed and ready for production use!**

**Next Steps**:
1. Share scheduling link with ward
2. Monitor usage and gather feedback
3. Provide support as needed
4. Iterate and improve based on user needs

Good luck with your deployment! 🎉
