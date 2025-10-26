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

    const wardId = (session.user as any).wardId;

    const ward = await prisma.ward.findUnique({
      where: { id: wardId },
    });

    if (!ward) {
      return NextResponse.json({ error: "Ward not found" }, { status: 404 });
    }

    return NextResponse.json(ward);
  } catch (error) {
    console.error("Error fetching ward:", error);
    return NextResponse.json(
      { error: "Failed to fetch ward" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "EXECUTIVE_SECRETARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, stake } = await request.json();

    // Create ward
    const ward = await prisma.ward.create({
      data: {
        name,
        stake,
      },
    });

    // Update user to associate with this ward
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { wardId: ward.id },
    });

    return NextResponse.json(ward);
  } catch (error) {
    console.error("Error creating ward:", error);
    return NextResponse.json(
      { error: "Failed to create ward" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "EXECUTIVE_SECRETARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const wardId = (session.user as any).wardId;
    const { name, stake } = await request.json();

    const ward = await prisma.ward.update({
      where: { id: wardId },
      data: {
        name,
        stake,
      },
    });

    return NextResponse.json(ward);
  } catch (error) {
    console.error("Error updating ward:", error);
    return NextResponse.json(
      { error: "Failed to update ward" },
      { status: 500 }
    );
  }
}
