# Executive Secretary - Local Development Setup Guide

**⚠️ For Production Deployment**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) instead

This guide is for setting up the Executive Secretary application locally for development and testing purposes.

---

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18 or higher installed on your computer
- [ ] A PostgreSQL database (we'll use a free cloud tier - Neon)
- [ ] A Google account (for Google OAuth)
- [ ] A Microsoft account (for Microsoft OAuth, optional)
- [ ] An Anthropic API key (for AI chat)

**Note**: Even for local development, we recommend using a cloud database (Neon free tier) rather than installing PostgreSQL locally.

## Step 1: Database Setup (5 minutes)

We'll use Neon (free tier) for PostgreSQL:

1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project called "executive-secretary"
4. Copy the connection string (it looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`)

## Step 2: Environment Variables (5 minutes)

1. In your project directory, copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in these values:

   ```env
   # Database - Paste your Neon connection string
   DATABASE_URL="postgresql://..."

   # NextAuth - Your app URL
   NEXTAUTH_URL="http://localhost:3000"

   # Generate a secret (run this command and paste the output):
   # openssl rand -base64 32
   NEXTAUTH_SECRET="paste-generated-secret-here"
   ```

3. Leave the other values blank for now - we'll fill them in as we go.

## Step 3: Push Database Schema (2 minutes)

Run this command to create all the database tables:

```bash
npm run db:push
```

You should see: "Your database is now in sync with your Prisma schema."

## Step 4: Google OAuth Setup (10 minutes)

1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. In the left sidebar, click "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Executive Secretary
   - User support email: your email
   - Developer contact: your email
   - Click Save and Continue through the scopes (leave default)
   - Add test users: your email address
6. Back on Create OAuth Client ID:
   - Application type: Web application
   - Name: Executive Secretary
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Click Create
7. Copy the Client ID and Client Secret to your `.env` file:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

8. Enable Google Calendar API:
   - In left sidebar, click "Library"
   - Search for "Google Calendar API"
   - Click it and click "Enable"

## Step 5: Anthropic API Setup (5 minutes)

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to API Keys
4. Create a new key
5. Copy it to your `.env` file:
   ```env
   ANTHROPIC_API_KEY="sk-ant-..."
   ```

## Step 6: Aurinko Calendar API Setup (10 minutes)

1. Go to https://aurinko.io
2. Sign up for an account
3. Create a new application
4. In the application settings:
   - Add callback URL: `http://localhost:3000/api/calendar/callback`
   - Enable Google Calendar and Office 365 Calendar
5. Copy the credentials to your `.env` file:
   ```env
   AURINKO_CLIENT_ID="your-aurinko-client-id"
   AURINKO_CLIENT_SECRET="your-aurinko-client-secret"
   AURINKO_APP_SECRET="your-aurinko-app-secret"
   ```

## Step 7: Create Your First User (2 minutes)

Run this command to create your ward and executive secretary account:

```bash
npm run setup "Oak Hills Ward" "Bountiful North Stake" "your-email@gmail.com"
```

Replace with your actual ward name, stake name, and email address.

You should see:
```
✅ Ward created
✅ Executive Secretary user created
✅ Created interview type: Temple Recommend Interview
✅ Created interview type: Youth Interview
...
```

## Step 8: Start the Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000

## Step 9: Sign In and Configure (5 minutes)

1. Click "Admin Portal"
2. Click "Sign in"
3. Click "Sign in with Google"
4. Use the same email you used in Step 7
5. You should be redirected to the admin dashboard!

## Step 10: Connect Your Calendar (2 minutes)

1. In the admin dashboard, click "Calendar" in the navigation
2. Click "Connect Google Calendar"
3. Sign in and authorize the app
4. You should see "Connected" with your email

## Step 11: Add Interview Types (Optional)

The setup script created some default interview types, but you can customize them:

1. Click "Interview Types" in the navigation
2. Add, edit, or remove interview types as needed

## Step 12: Add Bishopric Members (10 minutes)

1. Click "Bishopric" in the navigation
2. Add the Bishop:
   - Click "Add Bishopric Member"
   - Enter their email
   - Select position: Bishop
   - Select which interview types they can conduct
   - Save
3. Repeat for 1st and 2nd Counselors
4. Send them the invite link to connect their calendars

## Step 13: Set Up Availability (5 minutes per bishopric member)

Each bishopric member needs to:

1. Open their Google Calendar
2. Create a new event called "INTERVIEW-AVAIL"
3. Set it to recurring (e.g., every Tuesday 6-8 PM)
4. Save the event

The app will automatically detect these events as available time slots!

## Step 14: Test the Scheduling Flow (5 minutes)

1. Go to http://localhost:3000
2. Click "Schedule Interview"
3. Have a conversation with the AI:
   - It will ask for your name
   - It will ask for your email
   - It will ask what type of interview you need
   - It will show available times
   - Pick a time and confirm

4. Check that:
   - The appointment appears in the bishopric member's calendar (busy)
   - The appointment appears in your (executive secretary) calendar (free)
   - The appointment shows in Admin → Appointments

## Step 15: Share the Link!

1. Go to Admin → Ward Settings
2. Copy the public scheduling URL
3. Share it with your ward via:
   - Email
   - Text message
   - Ward bulletin
   - Ward website

## Optional: Microsoft OAuth (for Outlook users)

If you want to support Microsoft/Outlook calendars:

1. Go to https://portal.azure.com
2. Navigate to Azure Active Directory → App registrations
3. Create new registration
4. Add redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`
5. Go to "Certificates & secrets" and create a client secret
6. Go to "API permissions" and add:
   - Microsoft Graph → Delegated → Calendars.ReadWrite
   - Click "Grant admin consent"
7. Copy credentials to `.env`:
   ```env
   MICROSOFT_CLIENT_ID="your-app-client-id"
   MICROSOFT_CLIENT_SECRET="your-client-secret"
   ```

## Troubleshooting

### "Unauthorized" when signing in
- Make sure the email you're using matches exactly what you entered in Step 7
- Check that your user exists in the database (use `npm run db:studio` to browse)

### Calendar not connecting
- Verify Aurinko credentials are correct
- Check that callback URL is configured in Aurinko dashboard
- Make sure Google Calendar API is enabled

### AI chat not responding
- Verify your Anthropic API key is correct
- Check your API usage limits at console.anthropic.com
- Look at the browser console and terminal for error messages

### No available time slots showing
- Make sure bishopric members have connected their calendars
- Verify they have created events with "INTERVIEW-AVAIL" in the title
- Check that interview types are assigned to bishopric members

### Database connection errors
- Verify your DATABASE_URL is correct
- Make sure your Neon database is active
- Check that you ran `npm run db:push`

## Next Steps

- **Deploy to Production**: See README.md for Vercel deployment instructions
- **Customize Interview Types**: Add ward-specific interview types
- **Invite Bishopric Members**: Send them the admin URL to connect calendars
- **Customize Availability Codes**: Change "INTERVIEW-AVAIL" to something ward-specific
- **Set Up Email Notifications**: Configure SMTP settings for email confirmations

## Need Help?

- Check the main README.md for detailed documentation
- Use `npm run db:studio` to browse/edit database records
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors
- Review Prisma schema at `prisma/schema.prisma`

## Security Notes for Production

When deploying to production:

1. Change `NEXTAUTH_URL` to your production domain
2. Use a strong, unique `NEXTAUTH_SECRET`
3. Enable SSL/HTTPS
4. Update OAuth redirect URIs to production URLs
5. Consider encrypting calendar tokens in the database
6. Set up proper error logging (e.g., Sentry)
7. Add rate limiting to prevent abuse
8. Regular database backups

---

Congratulations! Your Executive Secretary is now set up and ready to use! 🎉
