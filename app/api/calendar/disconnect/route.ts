import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await prisma.calendarConnection.delete({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting calendar:", error);
    return NextResponse.json(
      { error: "Failed to disconnect calendar" },
      { status: 500 }
    );
  }
}
