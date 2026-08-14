import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where: any = {};

    if (search) {
      where.title = { contains: search };
    }

    if (category && category !== "ALL") {
      where.category = category as DocumentCategory;
    }

    const docs = await prisma.otherDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("GET documents error:", error);
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
    const { title, category, fileUrl } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Judul dan Kategori wajib diisi" },
        { status: 400 }
      );
    }

    const doc = await prisma.otherDocument.create({
      data: {
        title,
        category: category as DocumentCategory,
        fileUrl: fileUrl || "/uploads/placeholder.pdf",
        uploadedBy: session.user.name,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("POST documents error:", error);
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

    await prisma.otherDocument.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Dokumen berhasil dihapus" });
  } catch (error) {
    console.error("DELETE documents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
