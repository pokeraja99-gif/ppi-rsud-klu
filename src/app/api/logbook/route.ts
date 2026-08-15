import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const isAdmin = session.user.role === "ADMIN";

    const logbooks = await prisma.formLogbookIpcn.findMany({
      where: {
        ...(isAdmin ? {} : { userId: Number(session.user.id) }),
        OR: search ? [
          { room: { contains: search } },
          { description: { contains: search } },
          { activityType: { contains: search } },
          { ipcnName: { contains: search } }
        ] : undefined
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(logbooks);
  } catch (error) {
    console.error("GET logbook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      date, 
      ipcnName,
      room, 
      activityType,
      description,
      findings,
      followUp,
      followUpStatus,
      proofUrl 
    } = body;

    if (!date || !ipcnName || !room || !activityType || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newLogbook = await prisma.formLogbookIpcn.create({
      data: {
        date: new Date(date),
        ipcnName,
        room,
        activityType,
        description,
        findings: findings || null,
        followUp: followUp || null,
        followUpStatus: followUpStatus || null,
        proofUrl: proofUrl || null,
        userId: Number(session.user.id)
      }
    });

    return NextResponse.json(newLogbook, { status: 201 });
  } catch (error) {
    console.error("POST logbook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const isAdmin = session.user.role === "ADMIN";

    const logbook = await prisma.formLogbookIpcn.findUnique({
      where: { id: Number(id) }
    });

    if (!logbook) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!isAdmin && logbook.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.formLogbookIpcn.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE logbook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
