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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const sops = await prisma.sopDocument.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search } },
              { documentNumber: { contains: search } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sops);
  } catch (error) {
    console.error("GET SOP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, documentNumber, fileUrl } = body;

    if (!title || !documentNumber) {
      return NextResponse.json(
        { error: "Judul dan Nomor Dokumen wajib diisi" },
        { status: 400 }
      );
    }

    const sop = await prisma.sopDocument.create({
      data: {
        title,
        documentNumber,
        fileUrl: fileUrl || "/uploads/placeholder.pdf",
        uploadedBy: session.user.name,
      },
    });

    return NextResponse.json(sop, { status: 201 });
  } catch (error) {
    console.error("POST SOP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    await prisma.sopDocument.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "SOP berhasil dihapus" });
  } catch (error) {
    console.error("DELETE SOP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
