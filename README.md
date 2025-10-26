# Executive Secretary App

An intelligent scheduling application for LDS ward bishopric interviews, featuring an AI-powered chat interface for members and a comprehensive admin dashboard for executive secretaries.

---

## 🚀 New to Executive Secretary?

**👉 Start here: [GETTING_STARTED.md](GETTING_STARTED.md)**

This guide will help you choose the right setup path and get your Executive Secretary app deployed in ~45 minutes!

---

## Features

### For Ward Members
- **Chat Interface**: Natural conversation with AI assistant to schedule interviews
- **No Login Required**: Members can schedule by simply providing name and email
- **Optional OAuth**: Members can optionally login with Google/Microsoft to check calendar availability
- **Smart Scheduling**: AI optimizes for earliest appointments and back-to-back scheduling

### For Executive Secretaries (Admins)
- **Ward Management**: Configure ward details and settings
- **Bishopric Management**: Add/remove bishopric members and assign interview types
- **Interview Types**: Define different types of interviews with durations
- **Calendar Integration**: Connect Google/Outlook calendars via Aurinko API
- **Appointment Tracking**: View and manage all scheduled appointments
- **Multi-Ward Support**: Architecture supports multiple wards (future feature)

### For Bishopric Members
- **Calendar-Based Availability**: Set availability by creating recurring events in Google/Outlook calendar
- **Automatic Sync**: Appointments automatically sync to their calendar
- **OAuth Login**: Secure authentication with Google or Microsoft

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google & Microsoft OAuth
- **Calendar Integration**: Aurinko Calendar API
- **AI Chat**: Anthropic Claude API
- **Deployment**: Vercel (recommended)

## Quick Start

### For Production Deployment (Recommended)

**👉 See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete production setup instructions**

The recommended approach is to deploy directly to production using Vercel:

1. **Create accounts** (all have free tiers):
   - [Vercel](https://vercel.com) - App hosting
   - [Neon](https://neon.tech) - PostgreSQL database
   - [Google Cloud](https://console.cloud.google.com) - OAuth
   - [Aurinko](https://aurinko.io) - Calendar API
   - [Anthropic](https://console.anthropic.com) - AI Chat

2. **Deploy to Vercel**:
   - Push code to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy (takes 2-3 minutes)

3. **Initialize Database**:
   ```bash
   DATABASE_URL="your-production-url" npx prisma db push
   DATABASE_URL="your-production-url" npm run setup "Ward Name" "Stake" "email@gmail.com"
   ```

4. **Configure OAuth redirect URIs** to use your production URL

5. **Go live!** Share your scheduling link with the ward

**Total setup time: ~45 minutes** | **Monthly cost: $5-10** (Anthropic API only, everything else is free tier)

---

### For Local Development (Optional)

If you want to run locally for development:

#### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (free tier from Neon or Supabase)
- API accounts (Google, Aurinko, Anthropic)

#### Quick Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. Create first user
npm run setup "Ward Name" "Stake Name" "your-email@gmail.com"

# 5. Start dev server
npm run dev
```

**Note**: For local development, use `http://localhost:3000` in your OAuth redirect URIs and `NEXTAUTH_URL`.

For detailed local setup instructions, see the [Local Development](#local-development) section below.

## How It Works

### Availability Detection
- Bishopric members create calendar events with a specific title (e.g., "INTERVIEW-AVAIL")
- The app scans their calendar for these events and treats them as available time slots
- Appointments are automatically created in those time slots when members book

### Smart Scheduling
- The AI assistant prioritizes:
  1. **Earlier appointments** - Suggests soonest available times
  2. **Back-to-back scheduling** - Groups appointments together to optimize bishopric time
- Members can choose from the top 5 suggested times

### Calendar Sync
- When an appointment is booked:
  - Creates a busy event in the bishopric member's calendar
  - Creates a free (visible) event in executive secretary's calendar
  - Sends email confirmation to ward member
  - Optionally creates event in member's calendar (if they logged in)

## Project Structure

```
├── app/
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── calendar/       # Calendar integration
│   │   ├── chat/           # AI chat endpoint
│   │   └── ward/           # Ward management
│   ├── schedule/           # Public scheduling interface
│   └── auth/               # Authentication pages
├── components/
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── auth.ts             # Authentication configuration
│   ├── aurinko.ts          # Aurinko API client
│   ├── prisma.ts           # Database client
│   └── scheduler.ts        # Scheduling logic
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## Database Schema

Key models:
- **Ward**: Represents each ward organization
- **User**: Executive secretaries, bishopric members, and ward members
- **BishopricMember**: Leadership calling details
- **InterviewType**: Different types of interviews (temple recommend, youth, etc.)
- **Appointment**: Scheduled interviews
- **CalendarConnection**: OAuth tokens for calendar integration

## Multi-Ward Support

The app is designed to support multiple wards in the future:
- Each ward is completely isolated
- Users belong to one ward
- Data is partitioned by ward ID
- To add multi-ward support, implement:
  - Ward subdomain routing (e.g., `oakills.executive-secretary.app`)
  - Ward-specific signup flow
  - Super admin role for cross-ward management

## Deployment

### Production Deployment

**📖 Complete guide: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

#### Recommended: Vercel + Neon (Free Tier)

1. **Prepare**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main  # Push to GitHub
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables (see [.env.example](.env.example))
   - Deploy

3. **Set up database**:
   - Create PostgreSQL database on [Neon](https://neon.tech)
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations:
     ```bash
     DATABASE_URL="production-url" npx prisma db push
     ```

4. **Initialize ward**:
   ```bash
   DATABASE_URL="production-url" npm run setup "Ward Name" "Stake" "admin@email.com"
   ```

5. **Update OAuth settings**:
   - Google Cloud Console: Add production redirect URI
   - Aurinko Dashboard: Add production callback URL
   - Update `NEXTAUTH_URL` in Vercel to production domain

#### Other Hosting Options

- **Railway**: Includes PostgreSQL, auto-deploys from GitHub
- **DigitalOcean App Platform**: Managed hosting with database
- **Self-hosted**: VPS with Node.js, PostgreSQL, and Nginx

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

### Cost Breakdown

**Free Tier (Suitable for most wards)**:
- Vercel: Free (Hobby tier)
- Neon Database: Free (0.5GB)
- Aurinko: Free tier available
- Anthropic API: ~$5-10/month based on usage
- **Total: $5-10/month**

**Paid Tier (Multiple wards or heavy usage)**:
- ~$70-100/month with pro features

---

## Local Development

For contributing or testing locally:

### Initial Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with:
   - `DATABASE_URL`: Local PostgreSQL or Neon connection string
   - `NEXTAUTH_URL`: `http://localhost:3000`
   - `NEXTAUTH_SECRET`: Run `openssl rand -base64 32`
   - OAuth credentials (use localhost redirect URIs)
   - API keys (Aurinko, Anthropic)

3. **Set up database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Create initial data**:
   ```bash
   npm run setup "Test Ward" "Test Stake" "your-email@gmail.com"
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

   Open http://localhost:3000

### OAuth Configuration for Local Development

**Google OAuth**:
- Redirect URI: `http://localhost:3000/api/auth/callback/google`

**Microsoft OAuth** (optional):
- Redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`

**Aurinko**:
- Callback URL: `http://localhost:3000/api/calendar/callback`

### Development Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run setup        # Run first-time setup script
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| NEXTAUTH_URL | App URL (e.g., http://localhost:3000) | Yes |
| NEXTAUTH_SECRET | Random secret for NextAuth | Yes |
| GOOGLE_CLIENT_ID | Google OAuth client ID | Yes |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | Yes |
| MICROSOFT_CLIENT_ID | Microsoft OAuth client ID | Yes |
| MICROSOFT_CLIENT_SECRET | Microsoft OAuth client secret | Yes |
| AURINKO_CLIENT_ID | Aurinko API client ID | Yes |
| AURINKO_CLIENT_SECRET | Aurinko API client secret | Yes |
| ANTHROPIC_API_KEY | Anthropic API key for Claude | Yes |

## Troubleshooting

### Calendar not syncing
- Check that the Aurinko connection is active in the database
- Verify the availability code matches what's in calendar events
- Check API logs for errors

### OAuth errors
- Verify redirect URIs match exactly in OAuth provider settings
- Check that all required scopes are granted
- Ensure environment variables are set correctly

### Appointments not appearing
- Check that interview types are assigned to bishopric members
- Verify calendar connection is active
- Check that availability events exist in the date range

## Security Considerations

- All OAuth tokens should be encrypted in production
- Use HTTPS in production
- Implement rate limiting on public endpoints
- Add CSRF protection for state-changing operations
- Validate all user inputs
- Implement proper role-based access control

## Future Enhancements

- SMS notifications via Twilio
- Email notifications with calendar invites
- Rescheduling/cancellation flow
- Multi-language support
- Mobile app (React Native)
- Appointment reminders
- Analytics dashboard
- Waiting list management
- Custom availability rules
- Integration with LDS.org calendar

## Documentation

### Quick Access
- 📖 **[GETTING_STARTED.md](GETTING_STARTED.md)** - Start here! Choose your setup path
- 🚀 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete production deployment guide
- ✅ **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist
- 💻 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Local development setup
- 🏗️ **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Code architecture and structure
- ⚡ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick commands and troubleshooting

### Configuration Files
- [.env.example](.env.example) - Environment variables for local development
- [.env.production.example](.env.production.example) - Environment variables for production

## Support

For issues or questions:
1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common issues
2. Review the troubleshooting sections in relevant guides
3. Check the code comments and documentation
4. Refer to [GETTING_STARTED.md](GETTING_STARTED.md) for help choosing the right guide

## License

Private use only. Not for commercial distribution.

---

Built with love for LDS ward administration. 💙
