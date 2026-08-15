import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Ipcn, Ruangan, Profesi } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type.toLowerCase();
    
    let data;
    switch (type) {
      case "ipcn":
        data = await db.select().from(Ipcn).orderBy(asc(Ipcn.name));
        break;
      case "ruangan":
        data = await db.select().from(Ruangan).orderBy(asc(Ruangan.name));
        break;
      case "profesi":
        data = await db.select().from(Profesi).orderBy(asc(Profesi.name));
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching ${params.type}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type.toLowerCase();
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let data;
    switch (type) {
      case "ipcn":
        await db.insert(Ipcn).values({ name, createdAt: new Date(), updatedAt: new Date() });
        data = await db.select().from(Ipcn).where(eq(Ipcn.name, name)).limit(1);
        break;
      case "ruangan":
        await db.insert(Ruangan).values({ name, createdAt: new Date(), updatedAt: new Date() });
        data = await db.select().from(Ruangan).where(eq(Ruangan.name, name)).limit(1);
        break;
      case "profesi":
        await db.insert(Profesi).values({ name, createdAt: new Date(), updatedAt: new Date() });
        data = await db.select().from(Profesi).where(eq(Profesi.name, name)).limit(1);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error(`Error creating ${params.type}:`, error);
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = params.type.toLowerCase();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    switch (type) {
      case "ipcn":
        await db.delete(Ipcn).where(eq(Ipcn.id, parseInt(id)));
        break;
      case "ruangan":
        await db.delete(Ruangan).where(eq(Ruangan.id, parseInt(id)));
        break;
      case "profesi":
        await db.delete(Profesi).where(eq(Profesi.id, parseInt(id)));
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${params.type}:`, error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
