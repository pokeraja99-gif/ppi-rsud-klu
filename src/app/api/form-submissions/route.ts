import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { desc } from "drizzle-orm";

const modelMap: Record<string, any> = {
  "cuci-tangan": schema.FormCuciTangan,
  "isk": schema.FormISK,
  "audit-kebersihan-tangan": schema.FormAuditKebersihanTangan,
  "audit-fasilitas-kebersihan-tangan": schema.FormAuditFasilitasKebersihanTangan,
  "audit-kepatuhan-apd": schema.FormAuditKepatuhanApd,
  "bundle-ido": schema.FormBundleIdo,
  "bundle-vap": schema.FormBundleVap,
  "bundle-plabsi": schema.FormBundlePlabsi,
  "bundle-cauti": schema.FormBundleCauti,
  "monitoring-ipal": schema.FormMonitoringIpal,
  "audit-pembuangan-limbah": schema.FormAuditPembuanganLimbah,
  "audit-linen-kotor": schema.FormAuditLinenKotor,
  "audit-benda-tajam": schema.FormAuditBendaTajam,
  "audit-limbah-cair": schema.FormAuditLimbahCair,
  "monitoring-kamar-jenazah": schema.FormMonitoringKamarJenazah,
  "laporan-tertusuk-jarum": schema.FormLaporanTertusukJarum,
  "monitoring-linen-laundry": schema.FormMonitoringLinenLaundry,
  "pretest-edukasi-gizi": schema.FormPretestEdukasiGizi,
  "insiden-hais": schema.FormInsidenHais,
  "logbook-ipcn": schema.FormLogbookIpcn
};

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
        // Drizzle datetime doesn't need to be ISOString necessarily, JS Date is fine.
        parsedData[key] = new Date(parsedData[key]);
      } else if (Array.isArray(parsedData[key])) {
        parsedData[key] = parsedData[key].join(", ");
      }
    }

    const model = modelMap[formType];

    if (!model) {
       return NextResponse.json(
        { success: false, error: "Tabel untuk form ini belum tersedia di database." },
        { status: 400 }
      );
    }

    await db.insert(model).values({
      userId,
      ...parsedData,
      createdAt: new Date(),
    });

    const result = await db.select().from(model).orderBy(desc(model.id)).limit(1);

    return NextResponse.json(
      { success: true, id: result[0]?.id, message: "Berhasil disimpan di tabel terpisah!" },
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
