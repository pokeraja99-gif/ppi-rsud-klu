import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormLogbookIpcn, User } from "@/db/schema";
import { desc, eq, or, like } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const isAdmin = session.user.role === "ADMIN";

    let query = db.select({
      id: FormLogbookIpcn.id,
      userId: FormLogbookIpcn.userId,
      date: FormLogbookIpcn.date,
      ipcnName: FormLogbookIpcn.ipcnName,
      room: FormLogbookIpcn.room,
      activityType: FormLogbookIpcn.activityType,
      description: FormLogbookIpcn.description,
      findings: FormLogbookIpcn.findings,
      followUp: FormLogbookIpcn.followUp,
      followUpStatus: FormLogbookIpcn.followUpStatus,
      proofUrl: FormLogbookIpcn.proofUrl,
      createdAt: FormLogbookIpcn.createdAt,
      user: {
        name: User.name
      }
    })
    .from(FormLogbookIpcn)
    .leftJoin(User, eq(FormLogbookIpcn.userId, User.id))
    .$dynamic();

    if (!isAdmin) {
      query = query.where(eq(FormLogbookIpcn.userId, Number(session.user.id)));
    }

    if (search) {
      const condition = or(
        like(FormLogbookIpcn.room, `%${search}%`),
        like(FormLogbookIpcn.description, `%${search}%`),
        like(FormLogbookIpcn.activityType, `%${search}%`),
        like(FormLogbookIpcn.ipcnName, `%${search}%`)
      );
      if (isAdmin) {
        query = query.where(condition);
      } else {
        query = query.where(eq(FormLogbookIpcn.userId, Number(session.user.id))).where(condition);
      }
    }

    const logbooks = await query.orderBy(desc(FormLogbookIpcn.date));

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

    await db.insert(FormLogbookIpcn).values({
      date: new Date(date),
      ipcnName,
      room,
      activityType,
      description,
      findings: findings || null,
      followUp: followUp || null,
      followUpStatus: followUpStatus || null,
      proofUrl: proofUrl || null,
      userId: Number(session.user.id),
      createdAt: new Date(),
    });

    const newLogbook = await db.select().from(FormLogbookIpcn).orderBy(desc(FormLogbookIpcn.id)).limit(1);

    return NextResponse.json(newLogbook[0], { status: 201 });
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

    const logbooks = await db.select().from(FormLogbookIpcn).where(eq(FormLogbookIpcn.id, Number(id))).limit(1);
    const logbook = logbooks.length > 0 ? logbooks[0] : null;

    if (!logbook) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!isAdmin && logbook.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(FormLogbookIpcn).where(eq(FormLogbookIpcn.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE logbook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
