import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type.toLowerCase();
    
    let data;
    switch (type) {
      case "ipcn":
        data = await prisma.ipcn.findMany({ orderBy: { createdAt: "asc" } });
        break;
      case "ruangan":
        data = await prisma.ruangan.findMany({ orderBy: { createdAt: "asc" } });
        break;
      case "profesi":
        data = await prisma.profesi.findMany({ orderBy: { createdAt: "asc" } });
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
        data = await prisma.ipcn.create({ data: { name } });
        break;
      case "ruangan":
        data = await prisma.ruangan.create({ data: { name } });
        break;
      case "profesi":
        data = await prisma.profesi.create({ data: { name } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
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
        await prisma.ipcn.delete({ where: { id: parseInt(id) } });
        break;
      case "ruangan":
        await prisma.ruangan.delete({ where: { id: parseInt(id) } });
        break;
      case "profesi":
        await prisma.profesi.delete({ where: { id: parseInt(id) } });
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
