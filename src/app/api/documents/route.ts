import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { OtherDocument } from "@/db/schema";
import { desc, eq, like, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let query = db.select().from(OtherDocument).$dynamic();

    let condition = undefined;

    if (search) {
      condition = like(OtherDocument.title, `%${search}%`);
    }

    if (category && category !== "ALL") {
      const catCond = eq(OtherDocument.category, category as any);
      condition = condition ? and(condition, catCond) : catCond;
    }

    if (condition) {
      query = query.where(condition);
    }

    const docs = await query.orderBy(desc(OtherDocument.createdAt));

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

    await db.insert(OtherDocument).values({
      title,
      category,
      fileUrl: fileUrl || "/uploads/placeholder.pdf",
      uploadedBy: session.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newDoc = await db.select().from(OtherDocument).orderBy(desc(OtherDocument.id)).limit(1);

    return NextResponse.json(newDoc[0], { status: 201 });
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

    await db.delete(OtherDocument).where(eq(OtherDocument.id, parseInt(id)));

    return NextResponse.json({ message: "Dokumen berhasil dihapus" });
  } catch (error) {
    console.error("DELETE documents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
