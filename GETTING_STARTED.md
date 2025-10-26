# Getting Started with Executive Secretary

Welcome! This guide will help you get your Executive Secretary up and running.

## What is Executive Secretary?

Executive Secretary is an intelligent appointment scheduling system for LDS ward bishopric interviews. It features:

- 🤖 **AI-powered chat interface** for ward members to schedule interviews
- 📅 **Automatic calendar integration** with Google Calendar and Outlook
- ⚡ **Smart scheduling** that optimizes for earliest and back-to-back appointments
- 👥 **Admin dashboard** for executive secretaries to manage the ward

## Choose Your Path

### 🎯 I want to register my ward on an existing deployment (Easiest)

**If someone has already deployed Executive Secretary and shared it with you:**

1. Visit the deployment URL (e.g., `https://executivesecretary.org`)
2. Click "Register Your Ward"
3. Fill in:
   - Your ward name
   - Your stake name
   - Your email (as Executive Secretary)
4. Sign in with Google or Microsoft
5. Done! You're now set up and can configure your ward

**Time**: ~2 minutes

---

### 🚀 I want to deploy this system (For System Administrators)

**👉 Start here: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

This will walk you through:
1. Creating necessary accounts (all with free tiers)
2. Deploying to Vercel (takes ~45 minutes)
3. Configuring OAuth and API integrations
4. Registering your ward through the web interface
5. Other wards can then self-register on your deployment!

**Cost**: ~$5-10/month (only for AI API, everything else is free)
**Time**: ~1 hour initial setup

---

### 💻 I want to run this locally (Development)

**👉 Start here: [SETUP_GUIDE.md](SETUP_GUIDE.md)**

This guide is for:
- Testing the app locally
- Making modifications
- Contributing to development

**Note**: Even for local development, you'll need cloud services (free tiers) for the database and APIs.

---

## Quick Links

### Documentation
- **[README.md](README.md)** - Complete technical documentation
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment (recommended)
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Local development setup
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Code architecture and structure

### Configuration
- **[.env.example](.env.example)** - Environment variables for local development
- **[.env.production.example](.env.production.example)** - Environment variables for production

### Key Features

#### For Ward Members
- Chat with AI to schedule interviews
- No login required (just name and email)
- Automatic calendar invites
- Mobile-friendly interface

#### For Executive Secretaries
- Manage ward settings
- Add/remove bishopric members
- Configure interview types
- View all appointments
- Calendar sync with bishopric schedules

#### For Bishopric Members
- Set availability via Google/Outlook calendar
- Create recurring "INTERVIEW-AVAIL" events
- Automatic appointment sync
- No manual scheduling needed

## Prerequisites

Before starting, you'll need accounts for:

1. **[Vercel](https://vercel.com)** - App hosting (free tier)
2. **[Neon](https://neon.tech)** - PostgreSQL database (free tier)
3. **[Google Cloud](https://console.cloud.google.com)** - OAuth authentication (free)
4. **[Aurinko](https://aurinko.io)** - Calendar integration (free tier available)
5. **[Anthropic](https://console.anthropic.com)** - AI chat (~$5-10/month)

All have free tiers or minimal costs!

## Support

### Common Questions

**Q: Do ward members need to create an account?**
A: No! Ward members just chat with the AI and provide their name and email.

**Q: How do bishopric members set their availability?**
A: They create recurring calendar events (like "INTERVIEW-AVAIL") in their Google/Outlook calendar. The app automatically detects these as available time slots.

**Q: Can this work for multiple wards?**
A: Yes! The system is multi-tenant - one deployment can serve multiple wards. Each ward registers through the "/register" page and gets their own isolated data, but all share the same application instance.

**Q: What if someone needs to reschedule?**
A: Currently, they would need to schedule a new appointment. A rescheduling feature is planned for a future update.

**Q: Is my data secure?**
A: Yes! The app uses industry-standard OAuth 2.0, encrypted connections (HTTPS), and secure session management. Calendar tokens are stored securely in the database.

### Need Help?

1. Check the [README.md](README.md) for technical details
2. Review the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment issues
3. Check the troubleshooting sections in each guide
4. Review the [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) to understand the codebase

### Troubleshooting Resources

**Deployment Issues**:
- [DEPLOYMENT_GUIDE.md#troubleshooting](DEPLOYMENT_GUIDE.md#support--troubleshooting)
- [DEPLOYMENT_CHECKLIST.md#troubleshooting](DEPLOYMENT_CHECKLIST.md#troubleshooting)

**Local Development Issues**:
- [SETUP_GUIDE.md#troubleshooting](SETUP_GUIDE.md#troubleshooting)

**Technical Questions**:
- [README.md#troubleshooting](README.md#troubleshooting)
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## Recommended Workflow

### First-Time Setup (Executive Secretary)

1. **Read this page** to understand the system ✅ (you're here!)

2. **Follow deployment guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Create accounts (~15 min)
   - Deploy to Vercel (~10 min)
   - Configure OAuth (~15 min)
   - Set up database (~10 min)
   - Test deployment (~5 min)

3. **Configure your ward** (via admin dashboard)
   - Update ward settings
   - Add interview types
   - Connect your calendar
   - Add bishopric members

4. **Set up availability**
   - Have bishopric members connect calendars
   - Create "INTERVIEW-AVAIL" recurring events
   - Test scheduling flow

5. **Go live!**
   - Share scheduling link with ward
   - Monitor first appointments
   - Gather feedback

**Total Time**: ~1-2 hours for complete setup

## What's Next?

Once deployed, you can:

1. **Customize interview types** for your ward's needs
2. **Adjust availability codes** (change "INTERVIEW-AVAIL" to something else)
3. **Monitor usage** through the admin dashboard
4. **Gather feedback** from bishopric and ward members
5. **Request features** or contribute improvements

## System Requirements

### For Deployment (Production)
- GitHub account
- Internet browser
- Credit card (for API accounts, but free tiers available)

### For Development (Local)
- Node.js 18+
- Git
- Text editor (VS Code recommended)
- Terminal/command line

## Architecture Overview

```
Ward Member
    ↓ (chats via web)
AI Assistant (Claude)
    ↓ (finds availability)
Calendar API (Aurinko)
    ↓ (reads Google/Outlook calendars)
Bishopric Calendar (availability blocks)
    ↓ (creates appointment)
Database (PostgreSQL)
    ↓ (syncs event)
Bishopric Calendar + Exec Secretary Calendar
```

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js (Google/Microsoft OAuth)
- **Calendar**: Aurinko API
- **AI**: Anthropic Claude
- **Hosting**: Vercel

## Future Roadmap

Planned features:
- ✅ AI-powered scheduling
- ✅ Calendar integration
- ✅ Multi-ward database support
- 📧 Email notifications with calendar invites
- 📱 SMS reminders
- 🔄 Rescheduling flow
- 📊 Analytics dashboard
- 🌐 Multi-language support
- 📱 Mobile app (React Native)

## License & Usage

This software is provided for use by LDS wards and stakes. Not for commercial distribution.

---

## Ready to Start?

Choose your path:

### → [Deploy to Production](DEPLOYMENT_GUIDE.md) (Recommended)
### → [Run Locally](SETUP_GUIDE.md) (For Development)

---

**Questions?** Review the [README.md](README.md) for complete documentation.

**Issues?** Check the troubleshooting sections in each guide.

**Happy Scheduling!** 🎉
