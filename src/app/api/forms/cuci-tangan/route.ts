import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    const forms = await prisma.formCuciTangan.findMany({
      where: isAdmin ? {} : { userId: parseInt(session.user.id) },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, unit: true } } },
    });

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

    const form = await prisma.formCuciTangan.create({
      data: {
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
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error("POST cuci-tangan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
