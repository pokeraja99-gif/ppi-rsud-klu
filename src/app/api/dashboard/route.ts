import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const unitFilter = isAdmin ? {} : { user: { unit: session.user.unit || undefined } };

    // Total form submissions
    const totalAuditTangan = await prisma.formAuditKebersihanTangan.count({
      where: isAdmin ? undefined : unitFilter,
    });
    const totalInsidenHais = await prisma.formInsidenHais.count({
      where: isAdmin ? undefined : unitFilter,
    });

    const totalForms = totalAuditTangan + totalInsidenHais;
    const totalSops = await prisma.sopDocument.count();

    // Compliance rate (from audit kebersihan tangan forms)
    const allAudits = await prisma.formAuditKebersihanTangan.findMany({
      where: isAdmin ? undefined : unitFilter,
      select: {
        kepatuhan5Momen1SebelumKontakPasien: true,
        kepatuhan5Momen2SebelumTindakanAseptik: true,
        kepatuhan5Momen3SesudahKontakCairanPasien: true,
        kepatuhan5Momen4SesudahKontakPasien: true,
        kepatuhan5Momen5SesudahKontakLingkunganPasien: true,
      }
    });

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
      countCompliance(audit.kepatuhan5Momen1SebelumKontakPasien);
      countCompliance(audit.kepatuhan5Momen2SebelumTindakanAseptik);
      countCompliance(audit.kepatuhan5Momen3SesudahKontakCairanPasien);
      countCompliance(audit.kepatuhan5Momen4SesudahKontakPasien);
      countCompliance(audit.kepatuhan5Momen5SesudahKontakLingkunganPasien);
    });

    const complianceRate = totalOpportunities > 0
      ? Math.round((totalCompliant / totalOpportunities) * 100)
      : 0;

    // HAIs this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const haisThisMonth = await prisma.formInsidenHais.count({
      where: {
        tanggal: { gte: firstOfMonth },
        ...(isAdmin ? {} : unitFilter),
      },
    });

    // Chart Data calculations
    const complianceData = [];
    const haisData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endD = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthLabel = monthNames[d.getMonth()];
      
      // Compliance
      const monthlyAudits = await prisma.formAuditKebersihanTangan.findMany({
        where: { tanggal: { gte: d, lte: endD }, ...(isAdmin ? {} : unitFilter) },
        select: {
          kepatuhan5Momen1SebelumKontakPasien: true,
          kepatuhan5Momen2SebelumTindakanAseptik: true,
          kepatuhan5Momen3SesudahKontakCairanPasien: true,
          kepatuhan5Momen4SesudahKontakPasien: true,
          kepatuhan5Momen5SesudahKontakLingkunganPasien: true,
        }
      });

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
      
      // HAIs
      const incidences = await prisma.formInsidenHais.findMany({
        where: { tanggal: { gte: d, lte: endD }, ...(isAdmin ? {} : unitFilter) },
        select: { jenisInsiden: true }
      });

      let ISK = 0, IDO = 0, VAP = 0, IADP = 0;
      incidences.forEach(inc => {
        if (inc.jenisInsiden === "ISK") ISK++;
        else if (inc.jenisInsiden === "IDO") IDO++;
        else if (inc.jenisInsiden === "VAP") VAP++;
        else if (inc.jenisInsiden === "IADP") IADP++;
      });
      
      haisData.push({ month: monthLabel, ISK, IDO, VAP, IADP });
    }

    // Moments Pie Chart
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

      let r1 = { ops: m1Ops, comp: m1Comp }; check(audit.kepatuhan5Momen1SebelumKontakPasien, r1); m1Ops = r1.ops; m1Comp = r1.comp;
      let r2 = { ops: m2Ops, comp: m2Comp }; check(audit.kepatuhan5Momen2SebelumTindakanAseptik, r2); m2Ops = r2.ops; m2Comp = r2.comp;
      let r3 = { ops: m3Ops, comp: m3Comp }; check(audit.kepatuhan5Momen3SesudahKontakCairanPasien, r3); m3Ops = r3.ops; m3Comp = r3.comp;
      let r4 = { ops: m4Ops, comp: m4Comp }; check(audit.kepatuhan5Momen4SesudahKontakPasien, r4); m4Ops = r4.ops; m4Comp = r4.comp;
      let r5 = { ops: m5Ops, comp: m5Comp }; check(audit.kepatuhan5Momen5SesudahKontakLingkunganPasien, r5); m5Ops = r5.ops; m5Comp = r5.comp;
    });

    const momentData = [
      { name: "Momen 1", value: m1Ops > 0 ? Math.round((m1Comp/m1Ops)*100) : 0, label: "Sebelum Kontak Pasien" },
      { name: "Momen 2", value: m2Ops > 0 ? Math.round((m2Comp/m2Ops)*100) : 0, label: "Sebelum Tindakan Aseptik" },
      { name: "Momen 3", value: m3Ops > 0 ? Math.round((m3Comp/m3Ops)*100) : 0, label: "Setelah Terpapar Cairan" },
      { name: "Momen 4", value: m4Ops > 0 ? Math.round((m4Comp/m4Ops)*100) : 0, label: "Setelah Kontak Pasien" },
      { name: "Momen 5", value: m5Ops > 0 ? Math.round((m5Comp/m5Ops)*100) : 0, label: "Setelah Kontak Lingkungan" },
    ];

    // Fetch recent activities
    const recentLogs = await prisma.formLogbookIpcn.findMany({
      where: isAdmin ? {} : unitFilter,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } }
    });

    const recentSops = await prisma.sopDocument.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const activities = [
      ...recentLogs.map(log => ({
        user: log.user?.name || log.ipcnName,
        action: `mengisi Logbook: ${log.activityType}`,
        unit: log.room,
        time: log.createdAt,
        type: 'form'
      })),
      ...recentSops.map(sop => ({
        user: sop.uploadedBy,
        action: `mengunggah dokumen SOP: ${sop.title}`,
        unit: 'Komite PPI',
        time: sop.createdAt,
        type: 'upload'
      }))
    ];

    activities.sort((a, b) => b.time.getTime() - a.time.getTime());
    const recentActivities = activities.slice(0, 5).map(act => ({
      ...act,
      time: act.time.toLocaleString('id-ID', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      }) + ' WIB'
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
