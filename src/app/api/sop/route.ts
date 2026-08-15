import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { SopDocument } from "@/db/schema";
import { desc, like, or, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    let query = db.select().from(SopDocument).$dynamic();
    
    if (search) {
      query = query.where(
        or(
          like(SopDocument.title, `%${search}%`),
          like(SopDocument.documentNumber, `%${search}%`)
        )
      );
    }

    const sops = await query.orderBy(desc(SopDocument.createdAt));

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

    const existingSop = await db.select().from(SopDocument).where(eq(SopDocument.documentNumber, documentNumber)).limit(1);
    if (existingSop.length > 0) {
      return NextResponse.json(
        { error: "Nomor Dokumen sudah digunakan. Silakan gunakan nomor yang berbeda." },
        { status: 400 }
      );
    }

    await db.insert(SopDocument).values({
      title,
      documentNumber,
      fileUrl: fileUrl || "/uploads/placeholder.pdf",
      uploadedBy: session.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newSop = await db.select().from(SopDocument).orderBy(desc(SopDocument.id)).limit(1);

    return NextResponse.json(newSop[0], { status: 201 });
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

    await db.delete(SopDocument).where(eq(SopDocument.id, parseInt(id)));

    return NextResponse.json({ message: "SOP berhasil dihapus" });
  } catch (error) {
    console.error("DELETE SOP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
