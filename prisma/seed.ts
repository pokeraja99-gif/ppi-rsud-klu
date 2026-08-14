import { PrismaClient, Role, DocumentCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Dr. Siti Nurhaliza",
      username: "admin",
      password: adminPassword,
      role: Role.ADMIN,
      unit: "Komite PPI",
    },
  });

  const user = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      name: "Ns. Ahmad Fauzi",
      username: "user",
      password: userPassword,
      role: Role.USER,
      unit: "Ruang Rawat Inap A",
    },
  });

  console.log("✅ Users created:", { admin: admin.username, user: user.username });

  // Create SOP documents
  const sops = [
    { title: "SOP Cuci Tangan 6 Langkah", documentNumber: "SOP/PPI/001/2024", fileUrl: "/uploads/sop-cuci-tangan.pdf", uploadedBy: admin.name },
    { title: "SOP Penggunaan APD", documentNumber: "SOP/PPI/002/2024", fileUrl: "/uploads/sop-apd.pdf", uploadedBy: admin.name },
    { title: "SOP Pengelolaan Limbah Medis", documentNumber: "SOP/PPI/003/2024", fileUrl: "/uploads/sop-limbah.pdf", uploadedBy: admin.name },
    { title: "SOP Sterilisasi Alat Medis", documentNumber: "SOP/PPI/004/2024", fileUrl: "/uploads/sop-sterilisasi.pdf", uploadedBy: admin.name },
    { title: "SOP Isolasi Pasien Infeksi", documentNumber: "SOP/PPI/005/2024", fileUrl: "/uploads/sop-isolasi.pdf", uploadedBy: admin.name },
  ];

  for (const sop of sops) {
    await prisma.sopDocument.create({ data: sop });
  }
  console.log("✅ SOP documents created");

  // Create other documents
  const otherDocs = [
    { title: "SK Pembentukan Komite PPI", category: DocumentCategory.SK, fileUrl: "/uploads/sk-komite-ppi.pdf", uploadedBy: admin.name },
    { title: "SK Tim IPCN & IPCLN", category: DocumentCategory.SK, fileUrl: "/uploads/sk-tim-ipcn.pdf", uploadedBy: admin.name },
    { title: "Pedoman Pencegahan Infeksi RS", category: DocumentCategory.PEDOMAN, fileUrl: "/uploads/pedoman-ppi.pdf", uploadedBy: admin.name },
    { title: "Pedoman Surveilans HAIs", category: DocumentCategory.PEDOMAN, fileUrl: "/uploads/pedoman-surveilans.pdf", uploadedBy: admin.name },
    { title: "Laporan Triwulan PPI Q1 2024", category: DocumentCategory.LAPORAN, fileUrl: "/uploads/laporan-q1-2024.pdf", uploadedBy: admin.name },
    { title: "Laporan Triwulan PPI Q2 2024", category: DocumentCategory.LAPORAN, fileUrl: "/uploads/laporan-q2-2024.pdf", uploadedBy: admin.name },
  ];

  for (const doc of otherDocs) {
    await prisma.otherDocument.create({ data: doc });
  }
  console.log("✅ Other documents created");

  // Create mock form cuci tangan data (6 months)
  const rooms = ["Ruang Rawat Inap A", "Ruang Rawat Inap B", "IGD", "ICU", "Ruang Bersalin"];
  const professions = ["Perawat", "Dokter", "Bidan", "Analis", "Apoteker"];
  const officers = ["Ns. Ahmad Fauzi", "Dr. Budi Santoso", "Bd. Citra Dewi", "Apt. Diana Putri", "Ns. Eka Saputra"];

  for (let month = 0; month < 6; month++) {
    for (let i = 0; i < 15; i++) {
      const m1 = Math.random() > 0.2;
      const m2 = Math.random() > 0.3;
      const m3 = Math.random() > 0.25;
      const m4 = Math.random() > 0.35;
      const m5 = Math.random() > 0.3;
      const totalMoments = [m1, m2, m3, m4, m5].filter(Boolean).length;

      await prisma.formCuciTangan.create({
        data: {
          userId: i % 2 === 0 ? admin.id : user.id,
          date: new Date(2024, month, Math.floor(Math.random() * 28) + 1),
          officerName: officers[i % officers.length],
          profession: professions[i % professions.length],
          room: rooms[i % rooms.length],
          moment1: m1,
          moment2: m2,
          moment3: m3,
          moment4: m4,
          moment5: m5,
          actionDone: totalMoments >= 3,
          result: totalMoments >= 4 ? "Patuh" : totalMoments >= 2 ? "Cukup" : "Tidak Patuh",
        },
      });
    }
  }
  console.log("✅ Form Cuci Tangan mock data created (90 entries)");

  // Create mock form ISK data
  const patientNames = ["Tn. Agus", "Ny. Bunga", "Tn. Cahyo", "Ny. Dian", "Tn. Eko", "Ny. Fitri", "Tn. Gunawan"];
  const symptomList = [
    "Demam >38°C, nyeri suprapubik",
    "Urin keruh, frekuensi meningkat",
    "Disuria, hematuria",
    "Demam, menggigil",
    "Nyeri pinggang, urin berbau",
    "Tidak ada gejala",
  ];

  for (let month = 0; month < 6; month++) {
    for (let i = 0; i < 5; i++) {
      await prisma.formISK.create({
        data: {
          userId: i % 2 === 0 ? admin.id : user.id,
          date: new Date(2024, month, Math.floor(Math.random() * 28) + 1),
          patientName: patientNames[i % patientNames.length],
          medicalRecord: `RM${String(2024000 + month * 100 + i).padStart(7, "0")}`,
          catheterAction: i % 3 === 0 ? "Pemasangan Baru" : i % 3 === 1 ? "Sudah Terpasang" : "Tidak Ada",
          symptoms: symptomList[i % symptomList.length],
        },
      });
    }
  }
  console.log("✅ Form ISK mock data created (30 entries)");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
