import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toCamelCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function convertKeysToCamelCase(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Flatten grid nested objects
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        for (const subKey in obj[key]) {
           const flatKey = key + "_" + subKey;
           newObj[toCamelCase(flatKey)] = obj[key][subKey];
        }
      } else {
        newObj[toCamelCase(key)] = obj[key];
      }
    }
  }
  return newObj;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = 1; // Default fallback for anonymous/testing

    if (session?.user?.id) {
      userId = parseInt(session.user.id);
    }

    const body = await req.json();
    const { formType, formTitle, data } = body;

    if (!formType || !data) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const parsedData = convertKeysToCamelCase(data);
    
    for (const key in parsedData) {
      if (typeof parsedData[key] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsedData[key])) {
        parsedData[key] = new Date(parsedData[key]).toISOString();
      }
    }

    const modelName = toCamelCase("form-" + formType);

    // @ts-ignore
    const model = prisma[modelName];

    if (!model) {
       return NextResponse.json(
        { success: false, error: "Tabel untuk form ini belum tersedia di database." },
        { status: 400 }
      );
    }

    const result = await model.create({
      data: {
        userId,
        ...parsedData,
      },
    });

    return NextResponse.json(
      { success: true, id: result.id, message: "Berhasil disimpan di tabel terpisah!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving form submission:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan data form ke database." },
      { status: 500 }
    );
  }
}
