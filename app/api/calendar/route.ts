import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const connection = await prisma.calendarConnection.findUnique({
      where: { userId },
    });

    if (!connection) {
      return NextResponse.json({ error: "Not connected" }, { status: 404 });
    }

    return NextResponse.json(connection);
  } catch (error) {
    console.error("Error fetching calendar connection:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection" },
      { status: 500 }
    );
  }
}
