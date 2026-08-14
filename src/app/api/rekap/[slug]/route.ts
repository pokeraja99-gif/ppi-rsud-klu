import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toCamelCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Remove authentication block for now so it works without login (or use fallback)
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const slug = params.slug;
    const modelName = toCamelCase("form-" + slug);

    // @ts-ignore
    const model = prisma[modelName];

    if (!model) {
       return NextResponse.json(
        { success: false, error: "Tabel untuk form ini belum tersedia di database." },
        { status: 400 }
      );
    }

    // Fetch all records, optionally order by date
    const records = await model.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: records }, { status: 200 });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
