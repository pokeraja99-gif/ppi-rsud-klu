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

    const forms = await prisma.formISK.findMany({
      where: isAdmin ? {} : { userId: parseInt(session.user.id) },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, unit: true } } },
    });

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

    const form = await prisma.formISK.create({
      data: {
        userId: parseInt(session.user.id),
        date: new Date(date),
        patientName,
        medicalRecord,
        catheterAction: catheterAction || null,
        symptoms: symptoms || null,
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error("POST ISK error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
