import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aurinkoClient } from '@/lib/aurinko';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await request.json();

    if (provider !== 'Google' && provider !== 'Office365') {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Generate Aurinko OAuth URL
    const userId = (session.user as any).id;
    const authUrl = aurinkoClient.getAuthUrl(userId, provider);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error connecting calendar:', error);
    return NextResponse.json(
      { error: 'Failed to connect calendar' },
      { status: 500 }
    );
  }
}
