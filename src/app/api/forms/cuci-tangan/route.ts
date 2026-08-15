import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormCuciTangan, User } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    let query = db.select({
      id: FormCuciTangan.id,
      userId: FormCuciTangan.userId,
      date: FormCuciTangan.date,
      officerName: FormCuciTangan.officerName,
      profession: FormCuciTangan.profession,
      room: FormCuciTangan.room,
      moment1: FormCuciTangan.moment1,
      moment2: FormCuciTangan.moment2,
      moment3: FormCuciTangan.moment3,
      moment4: FormCuciTangan.moment4,
      moment5: FormCuciTangan.moment5,
      actionDone: FormCuciTangan.actionDone,
      result: FormCuciTangan.result,
      createdAt: FormCuciTangan.createdAt,
      user: {
        name: User.name,
        unit: User.unit,
      }
    })
    .from(FormCuciTangan)
    .leftJoin(User, eq(FormCuciTangan.userId, User.id))
    .$dynamic();

    if (!isAdmin) {
      query = query.where(eq(FormCuciTangan.userId, parseInt(session.user.id)));
    }

    const forms = await query.orderBy(desc(FormCuciTangan.createdAt));

    return NextResponse.json(forms);
  } catch (error) {
    console.error("GET cuci-tangan error:", error);
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
    const {
      date,
      officerName,
      profession,
      room,
      moment1,
      moment2,
      moment3,
      moment4,
      moment5,
      actionDone,
    } = body;

    if (!date || !officerName || !profession || !room) {
      return NextResponse.json(
        { error: "Tanggal, Nama Petugas, Profesi, dan Ruangan wajib diisi" },
        { status: 400 }
      );
    }

    // Calculate result
    const totalMoments = [moment1, moment2, moment3, moment4, moment5].filter(Boolean).length;
    let result = "Tidak Patuh";
    if (totalMoments >= 4) result = "Patuh";
    else if (totalMoments >= 2) result = "Cukup";

    await db.insert(FormCuciTangan).values({
      userId: parseInt(session.user.id),
      date: new Date(date),
      officerName,
      profession,
      room,
      moment1: moment1 || false,
      moment2: moment2 || false,
      moment3: moment3 || false,
      moment4: moment4 || false,
      moment5: moment5 || false,
      actionDone: actionDone || false,
      result,
      createdAt: new Date(),
    });

    const newForm = await db.select().from(FormCuciTangan).orderBy(desc(FormCuciTangan.id)).limit(1);

    return NextResponse.json(newForm[0], { status: 201 });
  } catch (error) {
    console.error("POST cuci-tangan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
