import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormISK, User } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    let query = db.select({
      id: FormISK.id,
      userId: FormISK.userId,
      date: FormISK.date,
      patientName: FormISK.patientName,
      medicalRecord: FormISK.medicalRecord,
      catheterAction: FormISK.catheterAction,
      symptoms: FormISK.symptoms,
      createdAt: FormISK.createdAt,
      user: {
        name: User.name,
        unit: User.unit,
      }
    })
    .from(FormISK)
    .leftJoin(User, eq(FormISK.userId, User.id))
    .$dynamic();

    if (!isAdmin) {
      query = query.where(eq(FormISK.userId, parseInt(session.user.id)));
    }

    const forms = await query.orderBy(desc(FormISK.createdAt));

    return NextResponse.json(forms);
  } catch (error) {
    console.error("GET ISK error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { date, patientName, medicalRecord, catheterAction, symptoms } = body;

    if (!date || !patientName || !medicalRecord) {
      return NextResponse.json(
        { error: "Tanggal, Nama Pasien, dan Nomor RM wajib diisi" },
        { status: 400 }
      );
    }

    await db.insert(FormISK).values({
      userId: parseInt(session.user.id),
      date: new Date(date),
      patientName,
      medicalRecord,
      catheterAction: catheterAction || null,
      symptoms: symptoms || null,
      createdAt: new Date(),
    });

    const newForm = await db.select().from(FormISK).orderBy(desc(FormISK.id)).limit(1);

    return NextResponse.json(newForm[0], { status: 201 });
  } catch (error) {
    console.error("POST ISK error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
