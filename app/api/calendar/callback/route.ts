import { NextRequest, NextResponse } from 'next/server';
import { aurinkoClient } from '@/lib/aurinko';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the userId
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/calendar?error=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/admin/calendar?error=missing_params', request.url)
      );
    }

    const userId = state;

    // Exchange code for access token
    const account = await aurinkoClient.exchangeCode(code);

    // Get primary calendar
    const primaryCalendarId = await aurinkoClient.getPrimaryCalendar(
      account.id
    );

    // Save calendar connection to database
    await prisma.calendarConnection.upsert({
      where: { userId },
      create: {
        userId,
        provider: account.provider === 'Google' ? 'GOOGLE' : 'MICROSOFT',
        aurinkoAccountId: account.id,
        accessToken: account.accessToken!,
        email: account.email,
        isActive: true,
      },
      update: {
        aurinkoAccountId: account.id,
        accessToken: account.accessToken!,
        email: account.email,
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.redirect(
      new URL('/admin/calendar?success=true', request.url)
    );
  } catch (error) {
    console.error('Error in calendar callback:', error);
    return NextResponse.redirect(
      new URL('/admin/calendar?error=connection_failed', request.url)
    );
  }
}
