import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * Complete ward registration after OAuth sign-in
 *
 * This endpoint is called after the user signs in with Google/Microsoft
 * during the registration process. It creates the ward and executive secretary user.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/register?error=no-session', request.url));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (existingUser) {
      // User already exists - redirect to admin
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Get pending registration from query params (passed from the OAuth callback)
    const { searchParams } = new URL(request.url);
    const wardName = searchParams.get('wardName');
    const stakeName = searchParams.get('stakeName');
    const email = searchParams.get('email');

    if (!wardName || !stakeName || !email) {
      return NextResponse.redirect(
        new URL('/register?error=missing-info', request.url)
      );
    }

    if (email !== session.user.email) {
      return NextResponse.redirect(
        new URL('/register?error=email-mismatch', request.url)
      );
    }

    // Create ward
    const ward = await prisma.ward.create({
      data: {
        name: wardName,
        stake: stakeName,
      },
    });

    // Create executive secretary user
    const user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || undefined,
        role: 'EXECUTIVE_SECRETARY',
        wardId: ward.id,
        image: session.user.image || undefined,
      },
    });

    // Create default interview types
    const interviewTypes = [
      { name: 'Temple Recommend Interview', description: 'Temple recommend interview', duration: 30 },
      { name: 'Youth Interview', description: 'Annual youth interview', duration: 20 },
      { name: 'Calling Extension', description: 'Calling extension or new calling', duration: 15 },
      { name: 'General Interview', description: 'General pastoral interview', duration: 30 },
    ];

    for (const type of interviewTypes) {
      await prisma.interviewType.create({
        data: {
          ...type,
          wardId: ward.id,
        },
      });
    }

    // Redirect to admin with success message
    return NextResponse.redirect(
      new URL('/admin?registered=true', request.url)
    );
  } catch (error) {
    console.error('Ward registration error:', error);
    return NextResponse.redirect(
      new URL('/register?error=registration-failed', request.url)
    );
  }
}
