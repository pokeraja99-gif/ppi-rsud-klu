import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { desc, eq, gte, and, lte, sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

function getRelativeTime(date: Date): string {
  if (!date) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return 'kemarin';
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const countTable = async (model: any, isAdmin: boolean, sessionUserUnit: string) => {
  let query = db.select({ count: sql<number>`count(*)` }).from(model).$dynamic();
  if (!isAdmin) {
      query = query.leftJoin(schema.User, eq(model.userId, schema.User.id)).where(eq(schema.User.unit, sessionUserUnit || ''));
  }
  const res = await query;
  return Number(res[0].count);
};

const fetchRecent = async (model: any) => {
  if (model === schema.SopDocument || model === schema.OtherDocument) {
      const res = await db.select().from(model).orderBy(desc(model.createdAt)).limit(5);
      return res.map((r: any) => ({ ...r, user: null }));
  }
  const res = await db.select({ item: model, user: { name: schema.User.name, unit: schema.User.unit } })
    .from(model)
    .leftJoin(schema.User, eq(model.userId, schema.User.id))
    .orderBy(desc(model.createdAt))
    .limit(5);
  return res.map(r => ({ ...r.item, user: r.user }));
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const sessionUserUnit = session.user.unit || '';

    const totalAuditTangan = await countTable(schema.FormAuditKebersihanTangan, isAdmin, sessionUserUnit);
    const totalInsidenHais = await countTable(schema.FormInsidenHais, isAdmin, sessionUserUnit);
    const totalForms = totalAuditTangan + totalInsidenHais;
    
    const sopsCount = await db.select({ count: sql<number>`count(*)` }).from(schema.SopDocument);
    const totalSops = Number(sopsCount[0].count);

    // Compliance rate
    let auditQuery = db.select({
      kepatuhan5Momen1SebelumKontakPasien: schema.FormAuditKebersihanTangan.kepatuhan5Momen1SebelumKontakPasien,
      kepatuhan5Momen2SebelumTindakanAseptik: schema.FormAuditKebersihanTangan.kepatuhan5Momen2SebelumTindakanAseptik,
      kepatuhan5Momen3SesudahKontakCairanPasien: schema.FormAuditKebersihanTangan.kepatuhan5Momen3SesudahKontakCairanPasien,
      kepatuhan5Momen4SesudahKontakPasien: schema.FormAuditKebersihanTangan.kepatuhan5Momen4SesudahKontakPasien,
      kepatuhan5Momen5SesudahKontakLingkunganPasien: schema.FormAuditKebersihanTangan.kepatuhan5Momen5SesudahKontakLingkunganPasien,
    }).from(schema.FormAuditKebersihanTangan).$dynamic();

    if (!isAdmin) {
      auditQuery = auditQuery.leftJoin(schema.User, eq(schema.FormAuditKebersihanTangan.userId, schema.User.id)).where(eq(schema.User.unit, sessionUserUnit));
    }

    const allAudits = await auditQuery;

    let totalOpportunities = 0;
    let totalCompliant = 0;

    const countCompliance = (val: string | null) => {
      if (val === "HANDRUB" || val === "HANDWASH") {
        totalOpportunities++;
        totalCompliant++;
      } else if (val === "TIDAK") {
        totalOpportunities++;
      }
    };

    allAudits.forEach(audit => {
      countCompliance(audit.kepatuhan5Momen1SebelumKontakPasien as string | null);
      countCompliance(audit.kepatuhan5Momen2SebelumTindakanAseptik as string | null);
      countCompliance(audit.kepatuhan5Momen3SesudahKontakCairanPasien as string | null);
      countCompliance(audit.kepatuhan5Momen4SesudahKontakPasien as string | null);
      countCompliance(audit.kepatuhan5Momen5SesudahKontakLingkunganPasien as string | null);
    });

    const complianceRate = totalOpportunities > 0
      ? Math.round((totalCompliant / totalOpportunities) * 100)
      : 0;

    // HAIs this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let haisCountQuery = db.select({ count: sql<number>`count(*)` }).from(schema.FormInsidenHais).$dynamic();
    if (isAdmin) {
      haisCountQuery = haisCountQuery.where(gte(schema.FormInsidenHais.tanggal, firstOfMonth));
    } else {
      haisCountQuery = haisCountQuery.leftJoin(schema.User, eq(schema.FormInsidenHais.userId, schema.User.id)).where(and(gte(schema.FormInsidenHais.tanggal, firstOfMonth), eq(schema.User.unit, sessionUserUnit)));
    }
    const haisThisMonthRes = await haisCountQuery;
    const haisThisMonth = Number(haisThisMonthRes[0].count);

    const complianceData = [];
    const haisData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endD = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthLabel = monthNames[d.getMonth()];
      
      let mAuditsQuery = db.select({
        kepatuhan5Momen1SebelumKontakPasien: schema.FormAuditKebersihanTangan.kepatuhan5Momen1SebelumKontakPasien,
        kepatuhan5Momen2SebelumTindakanAseptik: schema.FormAuditKebersihanTangan.kepatuhan5Momen2SebelumTindakanAseptik,
        kepatuhan5Momen3SesudahKontakCairanPasien: schema.FormAuditKebersihanTangan.kepatuhan5Momen3SesudahKontakCairanPasien,
        kepatuhan5Momen4SesudahKontakPasien: schema.FormAuditKebersihanTangan.kepatuhan5Momen4SesudahKontakPasien,
        kepatuhan5Momen5SesudahKontakLingkunganPasien: schema.FormAuditKebersihanTangan.kepatuhan5Momen5SesudahKontakLingkunganPasien,
      }).from(schema.FormAuditKebersihanTangan).$dynamic();
      
      let condition = and(gte(schema.FormAuditKebersihanTangan.tanggal, d), lte(schema.FormAuditKebersihanTangan.tanggal, endD));
      if (!isAdmin) {
        mAuditsQuery = mAuditsQuery.leftJoin(schema.User, eq(schema.FormAuditKebersihanTangan.userId, schema.User.id));
        condition = and(condition, eq(schema.User.unit, sessionUserUnit));
      }
      mAuditsQuery = mAuditsQuery.where(condition);
      
      const monthlyAudits = await mAuditsQuery;

      let mTotalOps = 0;
      let mTotalComp = 0;
      monthlyAudits.forEach(audit => {
        const vals = [
          audit.kepatuhan5Momen1SebelumKontakPasien,
          audit.kepatuhan5Momen2SebelumTindakanAseptik,
          audit.kepatuhan5Momen3SesudahKontakCairanPasien,
          audit.kepatuhan5Momen4SesudahKontakPasien,
          audit.kepatuhan5Momen5SesudahKontakLingkunganPasien
        ];
        vals.forEach(v => {
          if (v === "HANDRUB" || v === "HANDWASH") {
            mTotalOps++;
            mTotalComp++;
          } else if (v === "TIDAK") {
            mTotalOps++;
          }
        });
      });

      const patuh = mTotalOps > 0 ? Math.round((mTotalComp / mTotalOps) * 100) : 0;
      const tidakPatuh = mTotalOps > 0 ? 100 - patuh : 0;
      complianceData.push({ month: monthLabel, patuh, tidakPatuh });
      
      let incidencesQuery = db.select({ jenisInsiden: schema.FormInsidenHais.jenisInsiden }).from(schema.FormInsidenHais).$dynamic();
      let incCond = and(gte(schema.FormInsidenHais.tanggal, d), lte(schema.FormInsidenHais.tanggal, endD));
      if (!isAdmin) {
        incidencesQuery = incidencesQuery.leftJoin(schema.User, eq(schema.FormInsidenHais.userId, schema.User.id));
        incCond = and(incCond, eq(schema.User.unit, sessionUserUnit));
      }
      incidencesQuery = incidencesQuery.where(incCond);
      
      const incidences = await incidencesQuery;
      let ISK = 0, IDO = 0, VAP = 0, IADP = 0;
      incidences.forEach(inc => {
        if (inc.jenisInsiden === "ISK") ISK++;
        else if (inc.jenisInsiden === "IDO") IDO++;
        else if (inc.jenisInsiden === "VAP") VAP++;
        else if (inc.jenisInsiden === "IADP") IADP++;
      });
      haisData.push({ month: monthLabel, ISK, IDO, VAP, IADP });
    }

    let m1Ops = 0, m1Comp = 0;
    let m2Ops = 0, m2Comp = 0;
    let m3Ops = 0, m3Comp = 0;
    let m4Ops = 0, m4Comp = 0;
    let m5Ops = 0, m5Comp = 0;

    allAudits.forEach(audit => {
      const check = (val: string | null, opsRef: { ops: number, comp: number }) => {
        if (val === "HANDRUB" || val === "HANDWASH") {
          opsRef.ops++;
          opsRef.comp++;
        } else if (val === "TIDAK") {
          opsRef.ops++;
        }
      };
      let r1 = { ops: m1Ops, comp: m1Comp }; check(audit.kepatuhan5Momen1SebelumKontakPasien as string|null, r1); m1Ops = r1.ops; m1Comp = r1.comp;
      let r2 = { ops: m2Ops, comp: m2Comp }; check(audit.kepatuhan5Momen2SebelumTindakanAseptik as string|null, r2); m2Ops = r2.ops; m2Comp = r2.comp;
      let r3 = { ops: m3Ops, comp: m3Comp }; check(audit.kepatuhan5Momen3SesudahKontakCairanPasien as string|null, r3); m3Ops = r3.ops; m3Comp = r3.comp;
      let r4 = { ops: m4Ops, comp: m4Comp }; check(audit.kepatuhan5Momen4SesudahKontakPasien as string|null, r4); m4Ops = r4.ops; m4Comp = r4.comp;
      let r5 = { ops: m5Ops, comp: m5Comp }; check(audit.kepatuhan5Momen5SesudahKontakLingkunganPasien as string|null, r5); m5Ops = r5.ops; m5Comp = r5.comp;
    });

    const momentData = [
      { name: "Momen 1", value: m1Ops > 0 ? Math.round((m1Comp/m1Ops)*100) : 0, label: "Sebelum Kontak Pasien" },
      { name: "Momen 2", value: m2Ops > 0 ? Math.round((m2Comp/m2Ops)*100) : 0, label: "Sebelum Tindakan Aseptik" },
      { name: "Momen 3", value: m3Ops > 0 ? Math.round((m3Comp/m3Ops)*100) : 0, label: "Setelah Terpapar Cairan" },
      { name: "Momen 4", value: m4Ops > 0 ? Math.round((m4Comp/m4Ops)*100) : 0, label: "Setelah Kontak Pasien" },
      { name: "Momen 5", value: m5Ops > 0 ? Math.round((m5Comp/m5Ops)*100) : 0, label: "Setelah Kontak Lingkungan" },
    ];

    const [
      recentAuditTangan, recentAuditFasilitas, recentAuditApd, recentBundleIdo, recentBundleVap,
      recentBundlePlabsi, recentBundleCauti, recentMonitoringIpal, recentLimbah, recentLinenKotor,
      recentBendaTajam, recentLimbahCair, recentKamarJenazah, recentTertusukJarum, recentLinenLaundry,
      recentPretestGizi, recentInsidenHais, recentLogbook, recentCuciTangan, recentIsk,
      recentSops, recentOtherDocs,
    ] = await Promise.all([
      fetchRecent(schema.FormAuditKebersihanTangan),
      fetchRecent(schema.FormAuditFasilitasKebersihanTangan),
      fetchRecent(schema.FormAuditKepatuhanApd),
      fetchRecent(schema.FormBundleIdo),
      fetchRecent(schema.FormBundleVap),
      fetchRecent(schema.FormBundlePlabsi),
      fetchRecent(schema.FormBundleCauti),
      fetchRecent(schema.FormMonitoringIpal),
      fetchRecent(schema.FormAuditPembuanganLimbah),
      fetchRecent(schema.FormAuditLinenKotor),
      fetchRecent(schema.FormAuditBendaTajam),
      fetchRecent(schema.FormAuditLimbahCair),
      fetchRecent(schema.FormMonitoringKamarJenazah),
      fetchRecent(schema.FormLaporanTertusukJarum),
      fetchRecent(schema.FormMonitoringLinenLaundry),
      fetchRecent(schema.FormPretestEdukasiGizi),
      fetchRecent(schema.FormInsidenHais),
      fetchRecent(schema.FormLogbookIpcn),
      fetchRecent(schema.FormCuciTangan),
      fetchRecent(schema.FormISK),
      fetchRecent(schema.SopDocument),
      fetchRecent(schema.OtherDocument),
    ]);

    type ActivityItem = { user: string; action: string; unit: string; time: Date; type: string };

    const mapForm = (items: any[], formLabel: string, unitField?: string): ActivityItem[] =>
      items.map(item => ({
        user: item.user?.name || '-',
        action: `mengisi ${formLabel}`,
        unit: item[unitField || 'ruangan'] || item.user?.unit || '-',
        time: item.createdAt,
        type: 'form',
      }));

    const activities: ActivityItem[] = [
      ...mapForm(recentAuditTangan, 'Form Audit Kebersihan Tangan'),
      ...mapForm(recentAuditFasilitas, 'Form Audit Fasilitas Kebersihan Tangan', 'unitRuangan'),
      ...mapForm(recentAuditApd, 'Form Audit Kepatuhan APD'),
      ...mapForm(recentBundleIdo, 'Checklist Bundle IDO'),
      ...mapForm(recentBundleVap, 'Checklist Bundle VAP'),
      ...mapForm(recentBundlePlabsi, 'Checklist Bundle PLABSI/CLABSI'),
      ...mapForm(recentBundleCauti, 'Checklist Bundle CAUTI'),
      ...mapForm(recentMonitoringIpal, 'Form Monitoring IPAL'),
      ...mapForm(recentLimbah, 'Form Audit Pembuangan Limbah', 'unitRuangan'),
      ...mapForm(recentLinenKotor, 'Form Audit Linen Kotor'),
      ...mapForm(recentBendaTajam, 'Form Audit Benda Tajam'),
      ...mapForm(recentLimbahCair, 'Form Audit Limbah Cair'),
      ...mapForm(recentKamarJenazah, 'Form Monitoring Kamar Jenazah'),
      ...mapForm(recentTertusukJarum, 'Laporan Tertusuk Jarum', 'unitInstalasi'),
      ...mapForm(recentLinenLaundry, 'Form Monitoring Linen/Laundry'),
      ...mapForm(recentPretestGizi, 'Pre-Test Edukasi PPI Gizi'),
      ...mapForm(recentInsidenHais, 'Laporan Insiden HAIs'),
      ...recentLogbook.map(log => ({
        user: log.user?.name || log.ipcnName,
        action: `mengisi Logbook IPCN: ${log.activityType}`,
        unit: log.room,
        time: log.createdAt,
        type: 'form',
      })),
      ...mapForm(recentCuciTangan, 'Form Audit Cuci Tangan', 'room'),
      ...mapForm(recentIsk, 'Form Surveilans ISK'),
      ...recentSops.map(sop => ({
        user: sop.uploadedBy,
        action: `mengunggah SOP: ${sop.title}`,
        unit: 'Komite PPI',
        time: sop.createdAt,
        type: 'upload',
      })),
      ...recentOtherDocs.map(doc => ({
        user: doc.uploadedBy,
        action: `mengunggah Dokumen ${doc.category}: ${doc.title}`,
        unit: 'Komite PPI',
        time: doc.createdAt,
        type: 'upload',
      })),
    ];

    activities.sort((a, b) => b.time.getTime() - a.time.getTime());
    const recentActivities = activities.slice(0, 10).map(act => ({
      ...act,
      time: getRelativeTime(act.time),
    }));

    return NextResponse.json({
      totalForms,
      totalSops,
      complianceRate,
      haisThisMonth,
      recentActivities,
      chartData: {
        complianceData,
        haisData,
        momentData,
      }
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
