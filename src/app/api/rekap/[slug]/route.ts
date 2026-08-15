import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { desc, inArray } from "drizzle-orm";

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

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const slug = params.slug;
    const model = modelMap[slug];

    if (!model) {
       return NextResponse.json(
        { success: false, error: "Tabel untuk form ini belum tersedia di database." },
        { status: 400 }
      );
    }

    const records = await db.select().from(model).orderBy(desc(model.createdAt));

    return NextResponse.json({ success: true, data: records }, { status: 200 });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const slug = params.slug;
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "No IDs provided" }, { status: 400 });
    }

    const model = modelMap[slug];

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Tabel untuk form ini belum tersedia di database." },
        { status: 400 }
      );
    }

    await db.delete(model).where(inArray(model.id, ids));

    return NextResponse.json({ success: true, message: "Berhasil menghapus data terpilih" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting records:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus data." },
      { status: 500 }
    );
  }
}
