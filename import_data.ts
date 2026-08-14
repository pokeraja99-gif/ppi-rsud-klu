import * as xlsx from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseExcelDate(excelDate: number | string | undefined): Date | null {
  if (!excelDate) return null;
  if (typeof excelDate === "number") {
    // Excel dates are days since 1900-01-01. 
    // 25569 is the offset for 1970-01-01.
    return new Date((excelDate - (25567 + 2)) * 86400 * 1000);
  }
  return new Date(excelDate);
}

async function main() {
  const filePath = "C:\\Users\\mhafi\\Downloads\\REKAP DATABASE.xlsx";
  const workbook = xlsx.readFile(filePath);
  
  const USER_ID = 1; // Assuming default user id 1
  
  // 1. HH
  if (false && workbook.Sheets["HH"]) {
    console.log("Importing HH...");
    const hhData: any[] = xlsx.utils.sheet_to_json(workbook.Sheets["HH"]);
    let imported = 0;
    for (const row of hhData) {
      const date = parseExcelDate(row["TANGGAL"]);
      await prisma.formAuditKebersihanTangan.create({
        data: {
          userId: USER_ID,
          tanggal: date || new Date(),
          ipcn: row["IPCN"] || "",
          ruangan: row["RUANGAN"] || "",
          profesi: row["PROFESI"] || "",
          kepatuhan5Momen1SebelumKontakPasien: row["KEPATUHAN KEBERSIHAN TANGAN 5 MOMEN  [1. Sebelum Kontak Pasien]"] || "",
          kepatuhan5Momen2SebelumTindakanAseptik: row["KEPATUHAN KEBERSIHAN TANGAN 5 MOMEN  [2. Sebelum Tindakan Aseptik]"] || "",
          kepatuhan5Momen3SesudahKontakCairanPasien: row["KEPATUHAN KEBERSIHAN TANGAN 5 MOMEN  [3. Sesudah Kontak Cairan Pasien]"] || "",
          kepatuhan5Momen4SesudahKontakPasien: row["KEPATUHAN KEBERSIHAN TANGAN 5 MOMEN  [4. Sesudah Kontak Pasien]"] || "",
          kepatuhan5Momen5SesudahKontakLingkunganPasien: row["KEPATUHAN KEBERSIHAN TANGAN 5 MOMEN  [5. Sesudah Kontak Lingkungan Pasien]"] || "",
        }
      });
      imported++;
    }
    console.log(`Imported ${imported} rows into HH.`);
  }

  // 2. APD
  if (false && workbook.Sheets["APD"]) {
    console.log("Importing APD...");
    const apdData: any[] = xlsx.utils.sheet_to_json(workbook.Sheets["APD"]);
    let imported = 0;
    for (const row of apdData) {
      const date = parseExcelDate(row["TANGGAL"]);
      await prisma.formAuditKepatuhanApd.create({
        data: {
          userId: USER_ID,
          tanggal: date || new Date(),
          ipcn: row["IPCN"] || "",
          ruangan: row["RUANGAN"] || "",
          profesi: row["PROFESI"] || "",
          namaTindakan: "", // Optional since we just added it
          kepatuhanApdSARUNGTANGAN: row["KEPATUHAN APD  [SARUNG TANGAN]"] || "",
          kepatuhanApdMASKERMEDISN95: row["KEPATUHAN APD  [MASKER MEDIS / N95]"] || "",
          kepatuhanApdGOWN: row["KEPATUHAN APD  [GOWN]"] || "",
          kepatuhanApdTOPI: row["KEPATUHAN APD  [TOPI]"] || "",
          kepatuhanApdSEPATU: row["KEPATUHAN APD  [SEPATU]"] || "",
          kepatuhanApdFACESHIELD: row["KEPATUHAN APD  [FACESHIELD]"] || "",
          kepatuhanApdGOOGLES: row["KEPATUHAN APD  [GOOGLES]"] || "",
        }
      });
      imported++;
    }
    console.log(`Imported ${imported} rows into APD.`);
  }

  // 3. IDO
  if (false && workbook.Sheets["IDO"]) {
    console.log("Importing IDO...");
    const idoData: any[] = xlsx.utils.sheet_to_json(workbook.Sheets["IDO"]);
    let imported = 0;
    for (const row of idoData) {
      const date = parseExcelDate(row["TANGGAL"]);
      await prisma.formBundleIdo.create({
        data: {
          userId: USER_ID,
          tanggal: date || new Date(),
          ipcn: row["IPCN"] || "",
          ruangan: row["RUANGAN"] || "",
          noRm: String(row["NO. RM"] || ""),
          preOperasiCukurDenganEClipperHanyaPadaAreaOperasi: row["PRE OPERASI [Cukur dengan E.Clipper hanya pada area operasi]"] || "",
          preOperasiWaktuCukur2JamSebelumOperasi: row["PRE OPERASI [Waktu cukur (< 2 jam) sebelum operasi]"] || "",
          preOperasiMandiChlorhexidine: row["PRE OPERASI [Mandi Chlorhexidine]"] || "",
          preOperasiAntibiotikProfilaksis1JamSebelumInsisi: row["PRE OPERASI [Antibiotik profilaksis (1 jam sebelum insisi)]"] || "",
          preOperasiPasienTidakSedangInfeksi: row["PRE OPERASI [Pasien tidak sedang infeksi]"] || "",
          preOperasiGulaDarah200GrDl: row["PRE OPERASI [Gula darah < 200 gr/dl]"] || "",
          preOperasiSuhuTubuhNormal: row["PRE OPERASI [Suhu tubuh Normal]"] || "",
          intraOperasiPetugasMelakukanCuciTanganBedah: row["INTRA OPERASI [Petugas melakukan cuci tangan bedah]"] || "",
          intraOperasiInstrumenSteril: row["INTRA OPERASI [Instrumen steril]"] || "",
          intraOperasiDisinfeksiPermukaanKulitAreaOperasiSesuaiStandar: row["INTRA OPERASI [Disinfeksi permukaan kulit area operasi sesuai standar]"] || "",
          intraOperasiStrictPersonilPembatasanPetugas: row["INTRA OPERASI [Strict Personil (pembatasan petugas)]"] || "",
          intraOperasiLingkunganOKSuhuDanKelembabanTerstandar: row["INTRA OPERASI [Lingkungan OK (Suhu dan Kelembaba terstandar)]"] || "",
          postOperasiRawatLukaTeknikSterilDenganCairanNaCl: row["POST OPERASI [Rawat luka teknik steril dengan cairan NaCl,]"] || "",
          postOperasiLukaDitutup2448JamAtauDibukaSetelahPOD2KecualiBilaAdaRembesanAtauInfeksi: row["POST OPERASI [Luka ditutup 24-48 jam atau dibuka setelah POD-2 keculai bila ada rembesan atau infeksi]"] || "",
          postOperasiNutrisiSesuaiKebutuhan: row["POST OPERASI [Nutrisi sesuai kebutuhan]"] || "",
          postOperasiKontrolGulaDarah: row["POST OPERASI [Kontrol gula darah]"] || "",
          postOperasiTidakAdaPerpanjanganAB: row["POST OPERASI [Tidak ada perpanjangan AB]"] || "",
        }
      });
      imported++;
    }
    console.log(`Imported ${imported} rows into IDO.`);
  }

  // 4. CHKVAP
  if (workbook.Sheets["CHKVAP"]) {
    console.log("Importing CHKVAP...");
    const vapData: any[] = xlsx.utils.sheet_to_json(workbook.Sheets["CHKVAP"]);
    let imported = 0;
    for (const row of vapData) {
      const date = parseExcelDate(row["TANGGAL"]);
      await prisma.formBundleVap.create({
        data: {
          userId: USER_ID,
          tanggal: date || new Date(),
          ipcn: row["IPCN"] || "",
          ruangan: row["RUANGAN"] || "",
          noRm: String(row["NO. RM"] || ""),
          namaPasien: row["NAMA PASIEN"] || "",
          insersiKebersihanTangan: row["INSERSI [Kebersihan Tangan]"] || "",
          insersiTeknikSteril: row["INSERSI [Teknik Steril]"] || "",
          insersiPemakaianAPD: row["INSERSI [Pemakaian APD]"] || "",
          insersiSedasi: row["INSERSI [Sedasi]"] || "",
          maintenanceKebersihanTangan: row["MAINTENANCE [Kebersihan Tangan]"] || "",
          maintenancePosisiPasien3040Derajat: row["MAINTENANCE [Posisi Pasien 30 - 40 derajat]"] || "",
          maintenanceKebersihanMulutSetiap4JamKP: row["MAINTENANCE [Kebersihan Mulut (setiap 4 jam k/p)]"] || "",
          maintenanceManagemenSekresiOropharingeal: row["MAINTENANCE [Managemen Sekresi Oropharingeal]"] || "",
          maintenanceProsedurSedasiDanAnalgetik: row["MAINTENANCE [Prosedur Sedasi dan Analgetik]"] || "",
        }
      });
      imported++;
    }
    console.log(`Imported ${imported} rows into CHKVAP.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
