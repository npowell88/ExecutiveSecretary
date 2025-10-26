# Executive Secretary - Quick Reference

## 📚 Documentation Map

| Document | Purpose | For Whom |
|----------|---------|----------|
| [GETTING_STARTED.md](GETTING_STARTED.md) | Choose your setup path | **Start here!** |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment | Executive Secretary deploying to production |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Step-by-step deployment checklist | Executive Secretary during deployment |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Local development setup | Developers testing locally |
| [README.md](README.md) | Complete technical documentation | Everyone |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Code architecture | Developers |

---

## 🔑 Essential Information

### URLs (Update with your actual URLs)
- **Production App**: `https://your-domain.vercel.app`
- **Public Scheduling**: `https://your-domain.vercel.app/schedule`
- **Admin Dashboard**: `https://your-domain.vercel.app/admin`
- **Sign In**: `https://your-domain.vercel.app/auth/signin`

### Environment Variables Checklist

**Required for Production**:
```bash
DATABASE_URL=                 # PostgreSQL from Neon
NEXTAUTH_URL=                # Your production domain
NEXTAUTH_SECRET=             # Generated secret
GOOGLE_CLIENT_ID=            # Google OAuth
GOOGLE_CLIENT_SECRET=        # Google OAuth
AURINKO_CLIENT_ID=           # Calendar API
AURINKO_CLIENT_SECRET=       # Calendar API
AURINKO_APP_SECRET=          # Calendar API
ANTHROPIC_API_KEY=           # AI chat
```

**Optional**:
```bash
MICROSOFT_CLIENT_ID=         # For Outlook support
MICROSOFT_CLIENT_SECRET=     # For Outlook support
```

---

## 🛠️ Common Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm run lint            # Run linter
```

### Database
```bash
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema to database
npx prisma studio       # Open database GUI
```

### Setup
```bash
npm run setup "Ward Name" "Stake" "admin@email.com"
# Creates ward and first user
```

### Deployment
```bash
git add .
git commit -m "message"
git push origin main    # Auto-deploys on Vercel
```

---

## 🔐 OAuth Redirect URIs

### Google OAuth
**Local Dev**: `http://localhost:3000/api/auth/callback/google`
**Production**: `https://your-domain.com/api/auth/callback/google`

### Microsoft OAuth (Optional)
**Local Dev**: `http://localhost:3000/api/auth/callback/azure-ad`
**Production**: `https://your-domain.com/api/auth/callback/azure-ad`

### Aurinko Calendar
**Local Dev**: `http://localhost:3000/api/calendar/callback`
**Production**: `https://your-domain.com/api/calendar/callback`

---

## 👥 User Roles

| Role | Permissions | Access |
|------|-------------|--------|
| **EXECUTIVE_SECRETARY** | Full admin access | All admin pages, ward management |
| **BISHOPRIC** | Limited admin | Calendar connection, own appointments |
| **MEMBER** | Public access | Scheduling chat only (no login needed) |

---

## 📅 How Availability Works

1. **Bishopric member** creates calendar event with special title (e.g., "INTERVIEW-AVAIL")
2. **App scans** their calendar via Aurinko API
3. **Finds availability blocks** based on the title
4. **Breaks into time slots** based on interview duration
5. **Shows top 5** optimized slots to ward member
6. **Books appointment** when member confirms

---

## 🚨 Common Issues & Fixes

### "Unauthorized" when signing in
```bash
# Check:
1. Email matches user in database
2. NEXTAUTH_URL is correct
3. OAuth redirect URIs match exactly
```

### Calendar not connecting
```bash
# Check:
1. Aurinko callback URL is correct
2. Google Calendar API is enabled
3. Calendar connection exists in database
```

### No available time slots
```bash
# Check:
1. Bishopric calendars are connected
2. Events have "INTERVIEW-AVAIL" in title
3. Interview types assigned to bishopric members
4. Date range is correct (default: next 14 days)
```

### Build/Deploy failures
```bash
# Check:
1. All env vars are set in Vercel
2. DATABASE_URL is accessible
3. No TypeScript errors (npm run build)
4. Dependencies are in package.json
```

---

## 📊 Database Schema Quick Reference

### Key Tables
- **Ward**: Each ward organization
- **User**: All users (with role: EXECUTIVE_SECRETARY, BISHOPRIC, MEMBER)
- **BishopricMember**: Leadership positions (BISHOP, FIRST_COUNSELOR, SECOND_COUNSELOR)
- **InterviewType**: Types of interviews with duration
- **Appointment**: Scheduled interviews with status
- **CalendarConnection**: OAuth tokens for calendar access

### Relationships
```
Ward → Users → BishopricMember → Appointments
              ↓
         CalendarConnection

Ward → InterviewTypes ← BishopricMembers (many-to-many)
     ↓
Appointments → InterviewType
            → BishopricMember
            → User (optional)
```

---

## 🔗 Important Links

### Hosting & Database
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Database](https://console.neon.tech)
- [Supabase](https://app.supabase.com) (alternative DB)

### OAuth & APIs
- [Google Cloud Console](https://console.cloud.google.com)
- [Azure Portal](https://portal.azure.com) (for Microsoft OAuth)
- [Aurinko Dashboard](https://app.aurinko.io)
- [Anthropic Console](https://console.anthropic.com)

### Monitoring
- Vercel Analytics (built-in)
- [Sentry](https://sentry.io) (optional error tracking)

---

## 📝 Configuration Workflow

### Initial Setup (Executive Secretary)
1. Deploy app to Vercel
2. Set up database and push schema
3. Create first ward and user
4. Sign in and configure ward settings
5. Connect calendar
6. Add interview types
7. Invite bishopric members

### Bishopric Member Setup
1. Receive invite from exec secretary
2. Sign in with Google/Microsoft
3. Connect calendar
4. Create "INTERVIEW-AVAIL" recurring events

### Ward Member Usage
1. Visit public scheduling URL
2. Chat with AI assistant
3. Provide name and email
4. Choose interview type
5. Select from available times
6. Confirm appointment
7. Receive confirmation (future: email)

---

## 🎯 Quick Troubleshooting Decision Tree

```
Issue: Can't sign in
├─ Wrong email? → Check database for user
├─ OAuth error? → Check redirect URIs
└─ "Unauthorized"? → Check NEXTAUTH_URL

Issue: No time slots
├─ Calendar connected? → Check CalendarConnection table
├─ Events exist? → Check bishopric's actual calendar
└─ Correct title? → Verify "INTERVIEW-AVAIL" code

Issue: Build fails
├─ Check Vercel logs
├─ Run 'npm run build' locally
└─ Verify all env vars are set

Issue: Database error
├─ Check DATABASE_URL
├─ Verify database is active
└─ Run 'npx prisma db push'
```

---

## 💰 Cost Breakdown

### Free Tier (Typical Ward)
| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Hobby tier |
| Neon | $0 | 0.5GB storage |
| Google OAuth | $0 | Free |
| Aurinko | $0 | Free tier available |
| Anthropic | $5-10/mo | Pay per use (~$0.01-0.05/conversation) |
| **Total** | **$5-10/mo** | Only AI API costs money |

### Paid Tier (Multiple Wards/Heavy Use)
- Vercel Pro: $20/mo
- Neon Scale: $19/mo
- Aurinko Pro: $29/mo
- Anthropic: Usage-based
- **Total: ~$70-100/mo**

---

## 🔒 Security Checklist

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Strong NEXTAUTH_SECRET
- [ ] OAuth redirect URIs restricted to your domain
- [ ] Database backups enabled
- [ ] Secrets in environment variables only
- [ ] Calendar tokens stored securely
- [ ] Error monitoring configured
- [ ] Regular security updates

---

## 📞 Support Contacts

### Platform Support
- **Vercel**: support@vercel.com
- **Neon**: support@neon.tech
- **Aurinko**: support@aurinko.io
- **Anthropic**: support@anthropic.com

### Documentation
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org

---

## 🎉 Success Metrics

After deployment, you should see:
- ✅ Ward members can schedule appointments via chat
- ✅ Appointments appear in bishopric calendars
- ✅ Executive secretary can view all appointments
- ✅ Calendar sync works both ways
- ✅ No unauthorized access to admin pages
- ✅ Mobile-friendly interface
- ✅ Fast response times (<2s for chat)

---

## 📋 Maintenance Schedule

### Weekly
- Review error logs in Vercel
- Check appointment volume
- Monitor API usage

### Monthly
- Review and optimize costs
- Update dependencies: `npm outdated`
- Check database usage

### Quarterly
- Rotate API keys/secrets
- Review user feedback
- Plan feature updates

### As Needed
- Update interview types
- Add/remove bishopric members
- Adjust availability codes

---

## 🚀 Quick Deploy (TL;DR)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial" && git push

# 2. Deploy to Vercel (via web UI)
# - Import from GitHub
# - Add env vars
# - Deploy

# 3. Set up database
DATABASE_URL="prod-url" npx prisma db push
DATABASE_URL="prod-url" npm run setup "Ward" "Stake" "email"

# 4. Update OAuth redirect URIs to production URLs

# 5. Test and go live!
```

**Done!** Share scheduling link with ward. 🎉

---

_Last updated: 2024 | For Executive Secretary v1.0_
