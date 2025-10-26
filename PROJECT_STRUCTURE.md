# Executive Secretary - Project Structure

## Overview

This document provides a comprehensive overview of the project's file structure and how each component fits together.

## Directory Structure

```
SchedulerApp/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard (protected routes)
│   │   ├── layout.tsx           # Admin layout with navigation
│   │   ├── page.tsx             # Dashboard home page
│   │   ├── ward/                # Ward settings
│   │   │   └── page.tsx
│   │   ├── bishopric/           # Bishopric member management
│   │   │   └── page.tsx
│   │   ├── interviews/          # Interview types management
│   │   │   └── page.tsx
│   │   ├── appointments/        # Appointment management
│   │   │   └── page.tsx
│   │   └── calendar/            # Calendar connection
│   │       └── page.tsx
│   │
│   ├── api/                     # API Routes
│   │   ├── auth/               # NextAuth endpoints
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts    # NextAuth handler
│   │   ├── calendar/           # Calendar integration
│   │   │   ├── route.ts        # Get connection status
│   │   │   ├── connect/
│   │   │   │   └── route.ts    # Initiate OAuth
│   │   │   ├── callback/
│   │   │   │   └── route.ts    # OAuth callback
│   │   │   └── disconnect/
│   │   │       └── route.ts    # Disconnect calendar
│   │   ├── chat/               # AI chat endpoint
│   │   │   └── route.ts        # Claude API integration
│   │   └── ward/               # Ward management
│   │       └── route.ts        # CRUD operations
│   │
│   ├── schedule/               # Public scheduling interface
│   │   └── page.tsx           # Chat interface for members
│   │
│   ├── auth/                   # Authentication pages
│   │   └── signin/
│   │       └── page.tsx       # Sign in page
│   │
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   └── providers.tsx           # Client-side providers
│
├── components/                  # Reusable components
│   └── ui/                     # UI primitives
│       ├── button.tsx          # Button component
│       ├── card.tsx            # Card components
│       └── input.tsx           # Input component
│
├── lib/                        # Core utilities and logic
│   ├── auth.ts                # NextAuth configuration
│   ├── aurinko.ts             # Aurinko Calendar API client
│   ├── prisma.ts              # Prisma database client
│   └── scheduler.ts           # Scheduling algorithms
│
├── prisma/                     # Database
│   └── schema.prisma          # Database schema
│
├── scripts/                    # Utility scripts
│   └── setup-first-user.ts   # Initial setup script
│
├── public/                     # Static assets
│
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── README.md                  # Main documentation
├── SETUP_GUIDE.md            # Step-by-step setup
└── PROJECT_STRUCTURE.md      # This file
```

## Key Files Explained

### Database Schema (`prisma/schema.prisma`)

Defines the database structure with these key models:

- **Ward**: Each ward organization
- **User**: All users (exec secretary, bishopric, members)
- **BishopricMember**: Leadership positions
- **InterviewType**: Types of interviews
- **Appointment**: Scheduled interviews
- **CalendarConnection**: OAuth tokens for calendars

### Authentication (`lib/auth.ts`)

- Configures NextAuth.js
- Sets up Google and Microsoft OAuth providers
- Defines session strategy and callbacks
- Handles calendar scope requests

### Calendar Integration (`lib/aurinko.ts`)

Aurinko API client with methods for:
- Getting OAuth URLs
- Exchanging authorization codes
- Fetching calendar events
- Creating/updating/deleting events
- Finding availability blocks

### Scheduling Logic (`lib/scheduler.ts`)

Core scheduling functions:
- `getAvailableSlots()` - Finds available time slots
- `optimizeSlots()` - Prioritizes earlier and back-to-back slots
- `formatTimeSlots()` - Formats slots for display
- `createAppointment()` - Books an appointment

### AI Chat API (`app/api/chat/route.ts`)

- Integrates with Anthropic Claude API
- Guides users through scheduling conversation
- Extracts information (name, email, preferences)
- Coordinates with scheduler to show available times
- Books appointments based on user selection

## Data Flow

### 1. Member Scheduling Flow

```
User visits /schedule
  ↓
Chat with AI assistant
  ↓
AI extracts: name, email, interview type
  ↓
/api/chat calls scheduler.getAvailableSlots()
  ↓
scheduler queries database for interview type
  ↓
scheduler calls Aurinko API to get calendar events
  ↓
scheduler filters for availability code (INTERVIEW-AVAIL)
  ↓
scheduler optimizes slots (earlier + back-to-back)
  ↓
AI presents top 5 options to user
  ↓
User selects a time
  ↓
scheduler.createAppointment() creates:
  - Database record
  - Calendar event in bishopric member's calendar
  - Calendar event in exec secretary's calendar
  ↓
Confirmation sent to user
```

### 2. Bishopric Availability Flow

```
Bishopric member signs in
  ↓
Connects calendar via /admin/calendar
  ↓
OAuth flow to Aurinko
  ↓
CalendarConnection stored in database
  ↓
Member creates recurring events in their calendar
  (with title "INTERVIEW-AVAIL")
  ↓
When members schedule, app reads these events
  ↓
App breaks availability blocks into appointment slots
  ↓
Booked appointments appear as busy events in their calendar
```

### 3. Admin Management Flow

```
Executive secretary signs in
  ↓
/admin dashboard shows overview
  ↓
Can manage:
  - Ward settings (/admin/ward)
  - Bishopric members (/admin/bishopric)
  - Interview types (/admin/interviews)
  - Appointments (/admin/appointments)
  - Calendar connection (/admin/calendar)
  ↓
All appointments sync to exec secretary's calendar
```

## Authentication & Authorization

### User Roles

1. **EXECUTIVE_SECRETARY**
   - Full admin access
   - Can manage ward settings
   - Can add/remove bishopric members
   - Can configure interview types
   - Views all appointments

2. **BISHOPRIC**
   - Can connect calendar
   - Views their own appointments
   - Sets availability via calendar events

3. **MEMBER**
   - Optional (for future features)
   - Could allow checking personal calendar for conflicts

### Protected Routes

- `/admin/*` - Requires authentication
- `/api/ward/*` - Requires EXECUTIVE_SECRETARY role
- `/api/calendar/*` - Requires authentication
- `/schedule` - Public (no auth required)

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Ward Management
- `GET /api/ward` - Get current ward
- `POST /api/ward` - Create ward (EXECUTIVE_SECRETARY only)
- `PUT /api/ward` - Update ward (EXECUTIVE_SECRETARY only)

### Calendar
- `GET /api/calendar` - Get connection status
- `POST /api/calendar/connect` - Initiate OAuth
- `GET /api/calendar/callback` - Handle OAuth callback
- `POST /api/calendar/disconnect` - Remove connection

### Chat
- `POST /api/chat` - AI scheduling conversation

## Component Architecture

### Reusable UI Components (`components/ui/`)

Simple, composable components styled with Tailwind:
- **Button**: Variants for primary, outline, ghost, destructive
- **Card**: Container with header, title, description, content
- **Input**: Form input with consistent styling

These can be extended with more components as needed (Select, Dialog, etc.)

### Page Components (`app/*/page.tsx`)

Each page is a React Server Component by default, allowing:
- Direct database queries
- Server-side rendering
- Reduced client-side JavaScript

Client components (marked with `"use client"`) are used when:
- Need browser APIs
- Need state management
- Need event handlers

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - App URL
- `NEXTAUTH_SECRET` - Random secret for sessions
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `AURINKO_CLIENT_ID` - Calendar API
- `AURINKO_CLIENT_SECRET` - Calendar API
- `ANTHROPIC_API_KEY` - AI chat

### Optional
- `MICROSOFT_CLIENT_ID` - For Outlook support
- `MICROSOFT_CLIENT_SECRET` - For Outlook support
- `SMTP_*` - For email notifications (future)

## Database Relationships

```
Ward
  ├── Users (1:many)
  ├── BishopricMembers (1:many)
  ├── InterviewTypes (1:many)
  └── Appointments (1:many)

User
  ├── BishopricMember (1:1, optional)
  ├── CalendarConnection (1:1, optional)
  └── Appointments (1:many, as member)

BishopricMember
  ├── InterviewTypes (many:many)
  └── Appointments (1:many, as conductor)

InterviewType
  ├── BishopricMembers (many:many)
  └── Appointments (1:many)
```

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Colors**: Defined in `tailwind.config.ts`
- **Dark Mode**: Supported via Tailwind (not currently enabled)
- **Responsive**: Mobile-first design

## TypeScript

- Strict mode enabled
- Types generated from Prisma schema
- NextAuth types extended for custom user properties
- Aurinko API types defined in `lib/aurinko.ts`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run setup` - Run first-time setup script

## Future Enhancements

### Planned Features
- Email notifications with calendar invites
- SMS reminders via Twilio
- Rescheduling/cancellation flow
- Analytics dashboard
- Multi-ward support with subdomains
- Mobile app

### Potential Pages to Add
- `/admin/bishopric/[id]` - Individual bishopric member page
- `/admin/appointments/[id]` - Appointment details
- `/admin/analytics` - Usage statistics
- `/admin/settings` - App-wide settings
- `/appointment/[id]` - Public appointment confirmation

### Potential API Endpoints
- `/api/appointments` - List/manage appointments
- `/api/bishopric` - Manage bishopric members
- `/api/interviews` - Manage interview types
- `/api/availability` - Get availability for a member
- `/api/sync` - Manual calendar sync trigger
- `/api/webhooks/calendar` - Calendar webhook handler

## Security Considerations

### Current
- OAuth 2.0 for authentication
- JWT sessions with NextAuth
- Role-based access control
- HTTPS required (in production)

### Needed for Production
- Encrypt calendar tokens in database
- Rate limiting on public endpoints
- CSRF protection
- Input validation with Zod
- SQL injection prevention (Prisma handles this)
- XSS prevention (React handles this)
- Regular security audits
- Error logging and monitoring

## Performance Optimization

### Current
- Server Components for reduced JS bundle
- Static generation where possible
- Prisma query optimization
- Efficient calendar sync

### Future
- Redis caching for calendar data
- Background jobs for sync operations
- Webhook-based calendar updates
- CDN for static assets
- Database query optimization
- Load balancing

---

This structure provides a solid foundation for a production-ready ward scheduling application while remaining maintainable and extensible.
