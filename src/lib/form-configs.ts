// Form configuration types and definitions for all PPI forms
// Based on Google Forms data extracted from the provided links

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "radio"
  | "checkbox"
  | "dropdown"
  | "grid"
  | "section"; // section is a visual separator / heading

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface GridConfig {
  rows: string[];
  columns: string[];
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FormFieldOption[];
  grid?: GridConfig;
  placeholder?: string;
  description?: string;
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormConfig {
  slug: string;
  title: string;
  description?: string;
  category: "surveilans" | "audit" | "monitoring" | "laporan" | "edukasi";
  icon: string; // lucide icon name
  color: string; // tailwind gradient
  sections: FormSection[];
}

// Helper to create options from simple string arrays
function opts(...labels: string[]): FormFieldOption[] {
  return labels.map((l) => ({ label: l, value: l }));
}

// ============================================================
// 1. AUDIT KEPATUHAN KEBERSIHAN TANGAN
// ============================================================
const auditKebersihanTangan: FormConfig = {
  slug: "audit-kebersihan-tangan",
  title: "Audit Kepatuhan Kebersihan Tangan",
  description: "Audit kepatuhan 5 momen kebersihan tangan WHO",
  category: "audit",
  icon: "Hand",
  color: "from-cyan-500 to-blue-500",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "dropdown",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        {
          name: "ruangan",
          label: "Ruangan",
          type: "dropdown",
          required: true,
          options: opts(
            "IRNA 1",
            "IRNA 2",
            "IRNA 2 ATAS",
            "ISOLASI",
            "ICU",
            "NICU",
            "IGD",
            "POLIKLINIK",
            "NIFAS",
            "IRNA ANAK"
          ),
        },
        {
          name: "profesi",
          label: "Profesi",
          type: "dropdown",
          required: true,
          options: opts("DOKTER", "PERAWAT", "PETUGAS LAIN"),
        },
        {
          name: "namaTindakan",
          label: "Nama Tindakan",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "Kepatuhan Kebersihan Tangan 5 Momen",
      fields: [
        {
          name: "kepatuhan5Momen",
          label: "Kepatuhan Kebersihan Tangan 5 Momen",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "1. Sebelum Kontak Pasien",
              "2. Sebelum Tindakan Aseptik",
              "3. Sesudah Kontak Cairan Pasien",
              "4. Sesudah Kontak Pasien",
              "5. Sesudah Kontak Lingkungan Pasien",
            ],
            columns: ["HANDRUB", "HANDWASH", "TIDAK", "N/A"],
          },
        },
      ],
    },
  ],
};

// ============================================================
// 2. FORM AUDIT FASILITAS KEBERSIHAN TANGAN
// ============================================================
const auditFasilitasKebersihanTangan: FormConfig = {
  slug: "audit-fasilitas-kebersihan-tangan",
  title: "Form Audit Fasilitas Kebersihan Tangan",
  description: "Audit ketersediaan fasilitas kebersihan tangan",
  category: "audit",
  icon: "Droplets",
  color: "from-teal-500 to-emerald-500",
  sections: [
    {
      title: "A. Identitas",
      fields: [
        {
          name: "tanggalAudit",
          label: "1. Tanggal Audit",
          type: "date",
          required: true,
        },
        {
          name: "auditorIpcn",
          label: "2. Auditor IPCN",
          type: "radio",
          required: true,
          options: opts(
            "Nurianto Dhama Setiawan, A.Md., Kep",
            "Ni Luh Suartini, S.Kep., Ners"
          ),
        },
        {
          name: "unitRuangan",
          label: "3. Unit/Ruangan",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "B. Ketersediaan Fasilitas (Standar SNARS/SPM)",
      fields: [
        {
          name: "handrubTersedia",
          label:
            "4. Handrub berbasis alkohol tersedia di titik pelayanan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "saranaCuciTangan",
          label:
            "5. Sarana cuci tangan (air mengalir & sabun) tersedia",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "wastafelBerfungsi",
          label: "6. Wastafel berfungsi dengan baik",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "pengeringTangan",
          label: "7. Pengering tangan (tisu/kain) tersedia",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "tempatSampah",
          label: "8. Tempat sampah tersedia & berfungsi",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "C. Penunjang Kepatuhan",
      fields: [
        {
          name: "handrubMudahDijangkau",
          label: "9. Handrub mudah dijangkau petugas",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "mediaEdukasi",
          label:
            "10. Media edukasi 5 Momen Kebersihan Tangan tersedia",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
  ],
};

// ============================================================
// 3. AUDIT KEPATUHAN APD
// ============================================================
const auditKepatuhanApd: FormConfig = {
  slug: "audit-kepatuhan-apd",
  title: "Audit Kepatuhan APD",
  description: "Audit penggunaan Alat Pelindung Diri",
  category: "audit",
  icon: "ShieldCheck",
  color: "from-emerald-500 to-green-600",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "dropdown",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        {
          name: "ruangan",
          label: "Ruangan",
          type: "dropdown",
          required: true,
          options: opts(
            "IRNA 1",
            "IRNA 2",
            "IRNA 2 ATAS",
            "ISOLASI",
            "ICU",
            "NICU",
            "IGD",
            "POLIKLINIK",
            "NIFAS",
            "IRNA ANAK",
            "BERSALIN",
            "HIPERBARIK",
            "HD",
            "VK PONEX"
          ),
        },
        {
          name: "profesi",
          label: "Profesi",
          type: "dropdown",
          required: true,
          options: opts("DOKTER", "PERAWAT", "PETUGAS LAIN"),
        },
        {
          name: "namaTindakan",
          label: "Nama Tindakan",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "Kepatuhan APD",
      fields: [
        {
          name: "kepatuhanApd",
          label: "Kepatuhan APD",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "SARUNG TANGAN",
              "MASKER MEDIS / N95",
              "GOWN",
              "TOPI",
              "SEPATU",
              "FACESHIELD",
              "GOOGLES",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
  ],
};

// ============================================================
// 4. CHEKLIST BUNDLE IDO
// ============================================================
const checklistBundleIdo: FormConfig = {
  slug: "bundle-ido",
  title: "Cheklist Bundle IDO",
  description: "Checklist bundle Infeksi Daerah Operasi",
  category: "surveilans",
  icon: "Scissors",
  color: "from-amber-500 to-orange-500",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "dropdown",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        { name: "ruangan", label: "Ruangan", type: "text", required: true },
        { name: "noRm", label: "No. RM", type: "text", required: true },
      ],
    },
    {
      title: "Pre Operasi",
      fields: [
        {
          name: "preOperasi",
          label: "Pre Operasi",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Cukur dengan E.Clipper hanya pada area operasi",
              "Waktu cukur (< 2 jam) sebelum operasi",
              "Mandi Chlorhexidine",
              "Antibiotik profilaksis (1 jam sebelum insisi)",
              "Pasien tidak sedang infeksi",
              "Gula darah < 200 gr/dl",
              "Suhu tubuh Normal",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
    {
      title: "Intra Operasi",
      fields: [
        {
          name: "intraOperasi",
          label: "Intra Operasi",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Petugas melakukan cuci tangan bedah",
              "Instrumen steril",
              "Disinfeksi permukaan kulit area operasi sesuai standar",
              "Strict Personil (pembatasan petugas)",
              "Lingkungan OK (Suhu dan Kelembaban terstandar)",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
    {
      title: "Post Operasi",
      fields: [
        {
          name: "postOperasi",
          label: "Post Operasi",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Rawat luka teknik steril dengan cairan NaCl",
              "Luka ditutup 24-48 jam atau dibuka setelah POD-2 kecuali bila ada rembesan atau infeksi",
              "Nutrisi sesuai kebutuhan",
              "Kontrol gula darah",
              "Tidak ada perpanjangan AB",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
  ],
};

// ============================================================
// 5. CHEKLIST BUNDLE VAP
// ============================================================
const checklistBundleVap: FormConfig = {
  slug: "bundle-vap",
  title: "Cheklist Bundle VAP",
  description: "Checklist bundle Ventilator-Associated Pneumonia",
  category: "surveilans",
  icon: "Activity",
  color: "from-rose-500 to-pink-600",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "dropdown",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        {
          name: "ruangan",
          label: "Ruangan",
          type: "dropdown",
          required: true,
          options: opts("NICU", "ICU", "PICU"),
        },
        { name: "noRm", label: "No. RM", type: "text", required: true },
        {
          name: "namaPasien",
          label: "Nama Pasien",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "Insersi",
      fields: [
        {
          name: "insersi",
          label: "Insersi",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Kebersihan Tangan",
              "Teknik Steril",
              "Pemakaian APD",
              "Sedasi",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
    {
      title: "Maintenance",
      fields: [
        {
          name: "maintenance",
          label: "Maintenance",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Kebersihan Tangan",
              "Posisi Pasien 30 - 40 derajat",
              "Kebersihan Mulut (setiap 4 jam k/p)",
              "Managemen Sekresi Oropharingeal",
              "Prosedur Sedasi dan Analgetik",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
  ],
};

// ============================================================
// 6. CHEKLIST BUNDLE PLABSI/CLABSI
// ============================================================
const checklistBundlePlabsi: FormConfig = {
  slug: "bundle-plabsi",
  title: "Cheklist Bundle PLABSI/CLABSI",
  description: "Checklist bundle Primary Laboratory-confirmed BSI / Central Line-Associated BSI",
  category: "surveilans",
  icon: "HeartPulse",
  color: "from-red-500 to-rose-600",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "dropdown",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        { name: "ruangan", label: "Ruangan", type: "text", required: true },
        { name: "noRm", label: "No. RM", type: "text", required: true },
        {
          name: "namaPasien",
          label: "Nama Pasien",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "Insersi",
      fields: [
        {
          name: "insersi",
          label: "Insersi",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Pemilihan Lokasi",
              "Kebersihan Tangan",
              "Preparasi Kulit : Alkohol - Chg",
              "Maximum APD",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
    {
      title: "Maintenance",
      fields: [
        {
          name: "maintenance",
          label: "Maintenance",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Review Setiap Hari",
              "Kebersihan Tangan",
              "Disenfeksi Hub",
              "Pergantian Dresing",
              "Pergantian Set Administrasi",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
  ],
};

// ============================================================
// 7. CHEKLIST BUNDLE CAUTI
// ============================================================
const checklistBundleCauti: FormConfig = {
  slug: "bundle-cauti",
  title: "Cheklist Bundle CAUTI",
  description: "Checklist bundle Catheter-Associated Urinary Tract Infection",
  category: "surveilans",
  icon: "Syringe",
  color: "from-indigo-500 to-blue-600",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "dropdown",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        { name: "ruangan", label: "Ruangan", type: "text", required: true },
        { name: "noRm", label: "No. RM", type: "text", required: true },
        {
          name: "namaPasien",
          label: "Nama Pasien",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "Insersi",
      fields: [
        {
          name: "insersi",
          label: "Insersi",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Kaji Kebutuhan",
              "Pemasangan Oleh Petugas Terlatih",
              "Kebersihan Tangan",
              "Teknik Steril",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
    {
      title: "Maintenance",
      fields: [
        {
          name: "maintenance",
          label: "Maintenance",
          type: "grid",
          required: true,
          grid: {
            rows: [
              "Kebersihan Tangan",
              "Perawatan Kateter",
              "Pemilihan Kateter",
              "Segera Lepas Jika Tidak Dibutuhkan Lagi",
            ],
            columns: ["YA", "TIDAK", "N/A"],
          },
        },
      ],
    },
  ],
};

// ============================================================
// 8. MONITORING IPAL (PPI)
// ============================================================
const monitoringIpal: FormConfig = {
  slug: "monitoring-ipal",
  title: "Monitoring IPAL (PPI)",
  description: "Form monitoring Instalasi Pengolahan Air Limbah",
  category: "monitoring",
  icon: "Waves",
  color: "from-sky-500 to-blue-500",
  sections: [
    {
      title: "Bagian A — Identitas",
      fields: [
        {
          name: "tanggalMonitoring",
          label: "1. Tanggal Monitoring",
          type: "date",
          required: true,
        },
        {
          name: "namaPetugasAudit",
          label: "2. Nama Petugas Audit",
          type: "checkbox",
          required: true,
          options: opts(
            "Nurianto Dhama Setiawan, A.Md., Kep",
            "Ni Luh Suartini, S.Kep., Ners"
          ),
        },
        {
          name: "namaPetugasIpal",
          label: "3. Nama Petugas IPAL",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "Bagian B — Checklist Monitoring IPAL (PPI)",
      fields: [
        {
          name: "lingkunganIpal",
          label:
            "4. Lingkungan IPAL bersih, aman, dan bebas barang tidak terpakai",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "bakIndikator",
          label:
            "5. Bak indikator berfungsi baik (air bersih, tidak berbau, terdapat ikan)",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "prosesBiologis",
          label:
            "6. Proses biologis IPAL berjalan baik (aerasi & pemberian mikroorganisme/EM4)",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "alatPemantau",
          label:
            "7. Alat pemantau suhu dan pH air limbah tersedia dan berfungsi",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "pengolahanAir",
          label:
            "8. Pengolahan air dilakukan menggunakan biobakteri dan dipantau secara rutin",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "sistemPembuangan",
          label:
            "9. Sistem pembuangan akhir & bak kontrol berfungsi dengan baik",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "mesinBlower",
          label: "10. Mesin blower IPAL berfungsi dengan baik",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "pemantauanDebit",
          label:
            "11. Pemantauan debit masuk dan keluar air limbah dilakukan rutin",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "pemeriksaanMutu",
          label:
            "12. Pemeriksaan mutu air limbah dilakukan sesuai jadwal (kimia/bakteriologis)",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "petugasApd",
          label:
            "13. Petugas menggunakan APD saat bekerja di area IPAL",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "saranaHigiene",
          label:
            "14. Sarana higiene petugas tersedia dan berfungsi (wastafel & eye washer)",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
  ],
};

// ============================================================
// 9. FORM PEMBUANGAN LIMBAH RUMAH SAKIT
// ============================================================
const auditPembuanganLimbah: FormConfig = {
  slug: "audit-pembuangan-limbah",
  title: "Form Pembuangan Limbah Rumah Sakit",
  description: "Audit pembuangan limbah medis & non-medis",
  category: "audit",
  icon: "Trash2",
  color: "from-yellow-500 to-amber-600",
  sections: [
    {
      title: "A. Identitas",
      fields: [
        {
          name: "tanggal",
          label: "1. Tanggal",
          type: "date",
          required: true,
        },
        {
          name: "namaPetugasAudit",
          label: "2. Nama Petugas Audit",
          type: "checkbox",
          required: true,
          options: opts(
            "Nurianto Dhama Setiawan, A.Md., Kep",
            "Ni Luh Suartini, S.Kep., Ners"
          ),
        },
        {
          name: "unitRuangan",
          label: "3. Unit / Ruangan",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "B. Checklist Pembuangan Limbah (PPI)",
      fields: [
        {
          name: "pemilahan",
          label:
            "4. Pemilahan limbah dilakukan sesuai jenis & warna kantong",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "wadahLimbah",
          label: "5. Wadah limbah tertutup dan diberi label yang jelas",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "safetyBox",
          label: "6. Safety box digunakan untuk limbah benda tajam",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "kantongLimbah",
          label: "7. Kantong limbah tidak diisi melebihi ¾ penuh",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "petugasApd",
          label:
            "8. Petugas menggunakan APD saat menangani limbah",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "pengangkutan",
          label:
            "9. Pengangkutan limbah dilakukan dengan troli khusus",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "tidakAdaTumpahan",
          label:
            "10. Tidak ada tumpahan limbah di area pelayanan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "penyimpananSementara",
          label:
            "11. Penyimpanan sementara limbah medis sesuai ketentuan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "pembuanganAkhir",
          label:
            "12. Pembuangan akhir limbah medis dilakukan melalui pihak berizin / insinerator",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
  ],
};

// ============================================================
// 10. AUDIT PENGELOLAAN LINEN KOTOR
// ============================================================
const auditLinenKotor: FormConfig = {
  slug: "audit-linen-kotor",
  title: "Audit Pengelolaan Linen Kotor",
  description: "Audit pengelolaan linen kotor di ruangan",
  category: "audit",
  icon: "Shirt",
  color: "from-fuchsia-500 to-pink-600",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "radio",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        {
          name: "ruangan",
          label: "Ruangan",
          type: "dropdown",
          required: true,
          options: opts(
            "IRNA 1",
            "IRNA 2",
            "IRNA 2 ATAS",
            "ISOLASI",
            "ICU",
            "NICU",
            "IGD",
            "POLIKLINIK",
            "NIFAS",
            "IRNA ANAK",
            "HEMODIALISA",
            "LAUNDRY",
            "CSSD"
          ),
        },
      ],
    },
    {
      title: "Checklist Pengelolaan Linen Kotor",
      fields: [
        {
          name: "segeraAmbil",
          label:
            "Petugas Ruangan segera mengambil linen kotor untuk dimasukkan ke dalam Bak setelah pasien pulang",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "laundryAmbil",
          label:
            "Petugas Laundry mengambil linen kotor untuk dimasukkan ke dalam bak linen kotor dengan cara yang benar",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "tempatSesuai",
          label:
            "Petugas ruangan menempatkan linen kotor sesuai dengan wadah yang ditentukan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "masukBakBenar",
          label:
            "Petugas memasukkan linen kotor ke dalam bak linen kotor dengan benar",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "fasilitasBak",
          label:
            "Fasilitas bak penampung linen kotor tersedia dengan baik di ruangan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "plastikTersedia",
          label:
            "Plastik untuk linen kotor tersedia dengan baik di ruangan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "ambilSesuaiJadwal",
          label:
            "Petugas linen laundry mengambil linen kotor sesuai jadwal",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "trollyKhusus",
          label:
            "Sudah tersedia trolly khusus untuk linen infeksius dan non infeksius",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
  ],
};

// ============================================================
// 11. AUDIT PEMBUANGAN BENDA TAJAM & JARUM
// ============================================================
const auditBendaTajam: FormConfig = {
  slug: "audit-benda-tajam",
  title: "Audit Pembuangan Benda Tajam & Jarum",
  description: "Audit pembuangan benda tajam dan jarum",
  category: "audit",
  icon: "Syringe",
  color: "from-zinc-500 to-zinc-700",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "radio",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        {
          name: "ruangan",
          label: "Ruangan",
          type: "dropdown",
          required: true,
          options: opts(
            "IRNA 1",
            "IRNA 2",
            "IRNA 2 ATAS",
            "ISOLASI",
            "ICU",
            "NICU",
            "IGD",
            "POLIKLINIK",
            "NIFAS",
            "IRNA ANAK",
            "HEMODIALISA",
            "LAUNDRY",
            "CSSD"
          ),
        },
      ],
    },
    {
      title: "Checklist Pembuangan Benda Tajam & Jarum",
      fields: [
        {
          name: "injeksiLangsung",
          label:
            "Setiap pemberian Injeksi, Needle langsung dimasukkan ke Safety Box",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "canulaDisimpan",
          label:
            "Setiap pemasangan IV, Canula mandrain di masukkan ke Safety Box",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "bendaTajamMasuk",
          label:
            "Setiap benda tajam/jarum di masukkan ke Safety Box",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "safetyBoxTidakLebih",
          label:
            "Safety Box tidak lebih dari 3/4 harus diganti",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "safetyBoxBersih",
          label: "Safety Box dalam keadaan bersih",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "safetyBoxTertutup",
          label:
            "Safety Box tetap dalam keadaan tertutup setelah digunakan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
  ],
};

// ============================================================
// 12. AUDIT PEMBUANGAN LIMBAH CAIR INFEKSIUS
// ============================================================
const auditLimbahCair: FormConfig = {
  slug: "audit-limbah-cair",
  title: "Audit Pembuangan Limbah Cair Infeksius",
  description: "Audit pembuangan limbah cair infeksius",
  category: "audit",
  icon: "Droplets",
  color: "from-violet-500 to-purple-600",
  sections: [
    {
      title: "Data Umum",
      fields: [
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        {
          name: "ipcn",
          label: "IPCN",
          type: "radio",
          required: true,
          options: opts(
            "NURIANTO DHAMA SETIAWAN, A.Md.KEP",
            "NI LUH SUARTINI, S.KEP., NS"
          ),
        },
        {
          name: "ruangan",
          label: "Ruangan",
          type: "dropdown",
          required: true,
          options: opts(
            "IRNA 1",
            "IRNA 2",
            "IRNA 2 ATAS",
            "ISOLASI",
            "ICU",
            "NICU",
            "IGD",
            "POLIKLINIK",
            "NIFAS",
            "IRNA ANAK",
            "HEMODIALISA",
            "LAUNDRY",
            "CSSD"
          ),
        },
      ],
    },
    {
      title: "Checklist Pembuangan Limbah Cair Infeksius",
      fields: [
        {
          name: "cuciTanganSebelum",
          label:
            "Petugas melakukan kebersihan tangan sebelum membuang limbah cair infeksius",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "apdMinimal",
          label:
            "Menggunakan APD minimal sarung tangan dan masker sebelum membuang limbah cair infeksius",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "dibuangSpoelhock",
          label:
            "Limbah cair medis infeksius dibuang dalam spoelhock atau WC di ruang perawatan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "disiramAir",
          label:
            "Limbah cair infeksius disiram menggunakan air mengalir dan banyak",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "apdDilepas",
          label:
            "APD yang sudah dipakai dilepaskan sesuai prosedur setelah pembuangan limbah cair infeksius",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "cuciTanganSesudah",
          label:
            "Melakukan kebersihan tangan sesuai prosedur setelah pembuangan limbah cair infeksius",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
  ],
};

// ============================================================
// 13. MONITORING KAMAR JENAZAH
// ============================================================
const monitoringKamarJenazah: FormConfig = {
  slug: "monitoring-kamar-jenazah",
  title: "Monitoring Kamar Jenazah",
  description: "Form monitoring kepatuhan PPI di kamar jenazah",
  category: "monitoring",
  icon: "Building",
  color: "from-stone-500 to-stone-700",
  sections: [
    {
      title: "A. Identitas Monitoring",
      fields: [
        {
          name: "tanggal",
          label: "1. Tanggal",
          type: "date",
          required: true,
        },
        { name: "waktu", label: "Waktu", type: "time", required: true },
        {
          name: "namaPetugasAuditor",
          label: "2. Nama Petugas Auditor",
          type: "checkbox",
          required: true,
          options: opts(
            "Nurianto Dhama Setiawan, A.Md., Kep",
            "Ni Luh Suartini, S.Kep., Ners"
          ),
        },
      ],
    },
    {
      title: "B. Kesesuaian Sarana & Lingkungan",
      fields: [
        {
          name: "kondisiKebersihan",
          label: "3. Kondisi kebersihan kamar jenazah",
          type: "radio",
          required: true,
          options: opts("Bersih", "Cukup", "Tidak Bersih"),
        },
        {
          name: "lantaiKering",
          label: "4. Lantai dalam kondisi kering & tidak licin",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "ventilasi",
          label: "5. Ventilasi & pencahayaan memenuhi standar",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "C. Sarana Penunjang & APD (PPI)",
      fields: [
        {
          name: "ketersediaanApd",
          label:
            "6. Ketersediaan APD sesuai risiko (masker, sarung tangan, apron, sepatu boot)",
          type: "radio",
          required: true,
          options: opts("Lengkap", "Tidak Lengkap", "Tidak Ada"),
        },
        {
          name: "petugasApd",
          label: "7. Petugas menggunakan APD sesuai SOP",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "fasilitasCuciTangan",
          label:
            "8. Fasilitas cuci tangan / handrub tersedia & berfungsi",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "D. Proses Pengelolaan Jenazah",
      fields: [
        {
          name: "penangananSop",
          label: "9. Penanganan jenazah sesuai SOP PPI",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "pembersihanDesinfeksi",
          label:
            "10. Pembersihan & desinfeksi ruangan dan alat setelah penanganan jenazah",
          type: "radio",
          required: true,
          options: opts("Dilakukan", "Tidak Dilakukan"),
        },
        {
          name: "pengelolaanLinen",
          label:
            "11. Pengelolaan linen jenazah sesuai prosedur PPI",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "E. Pengelolaan Limbah",
      fields: [
        {
          name: "tempatSampahKlasifikasi",
          label:
            "12. Tempat sampah sesuai klasifikasi limbah (infeksius & non-infeksius)",
          type: "radio",
          required: true,
          options: opts("Ada & sesuai", "Ada tapi tidak sesuai", "Tidak ada"),
        },
        {
          name: "safetyBoxTersedia",
          label:
            "13. Safety box / wadah benda tajam tersedia & digunakan",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "sopTersedia",
          label:
            "14. Tersedia SOP & alur penanganan jenazah (termasuk kasus infeksius)",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
  ],
};

// ============================================================
// 14. LAPORAN KEJADIAN TERTUSUK JARUM
// ============================================================
const laporanTertusukJarum: FormConfig = {
  slug: "laporan-tertusuk-jarum",
  title: "Laporan Kejadian Tertusuk Jarum / Pajanan Darah & Cairan Tubuh",
  description: "Form laporan kejadian tertusuk jarum / pajanan darah & cairan tubuh (PPI)",
  category: "laporan",
  icon: "AlertTriangle",
  color: "from-orange-500 to-red-500",
  sections: [
    {
      title: "Bagian A — Identitas Petugas",
      fields: [
        {
          name: "namaPetugas",
          label: "1. Nama Petugas",
          type: "text",
          required: true,
        },
        {
          name: "nipNoPegawai",
          label: "2. NIP / No. Pegawai",
          type: "text",
          required: true,
        },
        {
          name: "unitInstalasi",
          label: "3. Unit/Instalasi",
          type: "text",
          required: true,
        },
        {
          name: "jabatan",
          label: "4. Jabatan",
          type: "radio",
          required: true,
          options: opts(
            "Dokter",
            "Perawat",
            "Bidan",
            "Analis Kesehatan",
            "Petugas Kebersihan",
            "Lainnya"
          ),
        },
      ],
    },
    {
      title: "Bagian B — Waktu & Tempat Kejadian",
      fields: [
        {
          name: "tanggalKejadian",
          label: "5. Tanggal Kejadian",
          type: "date",
          required: true,
        },
        {
          name: "waktuKejadian",
          label: "6. Waktu Kejadian",
          type: "time",
          required: true,
        },
        {
          name: "lokasiKejadian",
          label: "7. Lokasi Kejadian",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "Bagian C — Kronologi Kejadian",
      fields: [
        {
          name: "jenisPajanan",
          label: "8. Jenis Pajanan",
          type: "radio",
          required: true,
          options: opts(
            "Tertusuk jarum",
            "Tergores benda tajam",
            "Percikan darah/cairan tubuh",
            "Lainnya"
          ),
        },
        {
          name: "bendaPenyebab",
          label: "9. Benda Penyebab",
          type: "radio",
          required: true,
          options: opts(
            "Jarum suntik",
            "Abocath",
            "Pisau bedah",
            "Needle insulin",
            "Lainnya"
          ),
        },
        {
          name: "bagianTubuh",
          label: "10. Bagian Tubuh yang Terpajan",
          type: "text",
          required: true,
        },
        {
          name: "kronologiSingkat",
          label: "11. Kronologi Singkat Kejadian",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      title: "Bagian D — Tindakan Awal",
      fields: [
        {
          name: "tindakanPertama",
          label: "12. Tindakan Pertama yang Dilakukan",
          type: "checkbox",
          required: true,
          options: opts(
            "Dicuci dengan air mengalir",
            "Diberi antiseptik",
            "Dilaporkan ke atasan",
            "Dilaporkan ke Komite PPI",
            "Dilaporkan ke Komite K3 RS"
          ),
        },
        {
          name: "menggunakanApd",
          label: "13. Apakah menggunakan APD saat kejadian?",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "Bagian E — Data Sumber (Jika Diketahui)",
      fields: [
        {
          name: "statusPasienSumber",
          label: "14. Status Pasien Sumber (jika diketahui)",
          type: "checkbox",
          options: opts("HBsAg", "Anti-HCV", "HIV", "Tidak diketahui"),
        },
      ],
    },
    {
      title: "Bagian F — Hasil Pemeriksaan Laboratorium",
      fields: [
        {
          name: "pemeriksaanLab",
          label:
            "15. Apakah sudah dilakukan pemeriksaan laboratorium pasca pajanan?",
          type: "radio",
          required: true,
          options: opts("Ya", "Belum"),
        },
        {
          name: "tanggalPemeriksaan",
          label: "16. Tanggal Pemeriksaan Laboratorium",
          type: "date",
          description: "Isi jika menjawab Ya pada soal 15",
        },
        {
          name: "jenisPemeriksaanPetugas",
          label: "17. Jenis Pemeriksaan Petugas Terpajan",
          type: "checkbox",
          options: opts("HBsAg", "Anti-HBs", "Anti-HCV", "HIV", "Lainnya"),
        },
        {
          name: "hasilPemeriksaanPetugas",
          label: "18. Hasil Pemeriksaan Petugas Terpajan",
          type: "text",
          placeholder: "Isi Hasil Pemeriksaannya Misalnya: HIV +",
        },
        {
          name: "jenisPemeriksaanPasien",
          label:
            "19. Jenis Pemeriksaan Pasien Sumber (jika diketahui)",
          type: "checkbox",
          options: opts(
            "HBsAg",
            "Anti-HCV",
            "HIV",
            "Tidak diperiksa / tidak diketahui"
          ),
        },
        {
          name: "hasilPemeriksaanPasien",
          label: "20. Hasil Pemeriksaan Pasien Sumber",
          type: "text",
          placeholder:
            "Contoh: HBsAg reaktif, Anti-HCV non-reaktif, HIV non-reaktif",
        },
      ],
    },
  ],
};

// ============================================================
// 15. FORM MONITORING LINEN/LAUNDRY
// ============================================================
const monitoringLinenLaundry: FormConfig = {
  slug: "monitoring-linen-laundry",
  title: "Monitoring Kepatuhan PPI Pengelolaan Linen / Laundry RS",
  description: "Form monitoring pengelolaan linen/laundry rumah sakit",
  category: "monitoring",
  icon: "ClipboardList",
  color: "from-purple-500 to-indigo-600",
  sections: [
    {
      title: "A. Bagian Identitas Monitoring",
      fields: [
        {
          name: "tanggal",
          label: "1. Tanggal",
          type: "date",
          required: true,
        },
        {
          name: "namaAuditor",
          label: "2. Nama Auditor",
          type: "checkbox",
          required: true,
          options: opts("Nurianto Dhama Setiawan", "Ni Luh Suartini"),
        },
        {
          name: "namaPetugasLaundry",
          label: "3. Nama Petugas Laundry yang Bertugas",
          type: "text",
          required: true,
        },
      ],
    },
    {
      title: "B. Pengumpulan Linen Kotor",
      fields: [
        {
          name: "b1_dipisahkan",
          label: "1. Linen kotor dipisahkan dari linen bersih",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "b2_infeksius",
          label:
            "2. Linen infeksius dipisahkan dari linen non infeksius",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "b3_kantongKhusus",
          label: "3. Linen kotor dimasukkan dalam kantong khusus",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "b4_petugasApd",
          label:
            "4. Petugas menggunakan APD saat menangani linen",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "b5_tidakDiLantai",
          label: "5. Linen tidak diletakkan di lantai",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "C. Transport Linen",
      fields: [
        {
          name: "c1_troliTersedia",
          label: "1. Troli linen kotor tersedia",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "c2_troliTertutup",
          label: "2. Troli linen kotor tertutup",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "c3_transportTerpisah",
          label:
            "3. Transport linen kotor terpisah dari linen bersih",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "D. Proses Pencucian",
      fields: [
        {
          name: "d1_areaTerpisah",
          label:
            "1. Area linen kotor terpisah dari area bersih",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "d2_mesinCuci",
          label: "2. Mesin cuci berfungsi baik",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "d3_deterjen",
          label: "3. Penggunaan deterjen sesuai standar",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "d4_desinfektan",
          label: "4. Penggunaan desinfektan sesuai standar",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "d5_petugasApd",
          label:
            "5. Petugas menggunakan APD saat pencucian",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "E. Pengeringan dan Penyetrikaan",
      fields: [
        {
          name: "e1_dryer",
          label:
            "1. Linen dikeringkan menggunakan mesin dryer",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "e2_tidakMenyentuhLantai",
          label: "2. Linen tidak menyentuh lantai",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "e3_areaBersih",
          label: "3. Area pengeringan bersih",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
    {
      title: "F. Penyimpanan dan Distribusi",
      fields: [
        {
          name: "f1_areaBersih",
          label: "1. Linen bersih disimpan di area bersih",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "f2_rakTertutup",
          label:
            "2. Rak penyimpanan linen bersih tertutup",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "f3_troliDistribusi",
          label:
            "3. Troli distribusi linen bersih terpisah dari linen kotor",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
        {
          name: "f4_terlindungDebu",
          label: "4. Linen bersih terlindung dari debu",
          type: "radio",
          required: true,
          options: opts("Ya", "Tidak"),
        },
      ],
    },
  ],
};

// ============================================================
// 16. PRE-TEST EDUKASI PPI MAHASISWA GIZI
// ============================================================
const pretestGizi: FormConfig = {
  slug: "pretest-edukasi-gizi",
  title: "Pre-Test Edukasi PPI Mahasiswa Gizi",
  description: "Pre-test edukasi PPI untuk mahasiswa gizi",
  category: "edukasi",
  icon: "GraduationCap",
  color: "from-lime-500 to-green-500",
  sections: [
    {
      title: "Bagian A — Identitas Peserta",
      fields: [
        {
          name: "namaLengkap",
          label: "Nama Lengkap",
          type: "text",
          required: true,
        },
        {
          name: "asalInstitusi",
          label: "Asal Institusi / Perguruan Tinggi",
          type: "text",
          required: true,
        },
        {
          name: "tanggalPengisian",
          label: "Tanggal Pengisian",
          type: "date",
          required: true,
        },
      ],
    },
    {
      title: "Bagian B — Soal Pilihan Ganda (Wajib Diisi)",
      fields: [
        {
          name: "soal1",
          label: "1. Apa kepanjangan dari PPI?",
          type: "radio",
          required: true,
          options: opts(
            "a. Pengendalian dan Pencegahan Infeksi",
            "b. Pencegahan dan Pengendalian Infeksi",
            "c. Perlindungan dan Pencegahan Infeksi",
            "d. Penanganan dan Pengawasan Infeksi"
          ),
        },
        {
          name: "soal2",
          label: "2. Tujuan utama PPI di rumah sakit adalah?",
          type: "radio",
          required: true,
          options: opts(
            "a. Meningkatkan kebersihan saja",
            "b. Mencegah dan mengendalikan infeksi di fasilitas kesehatan",
            "c. Membatasi pergerakan pasien",
            "d. Mengawasi kebersihan ruangan"
          ),
        },
        {
          name: "soal3",
          label:
            "3. Kapan waktu yang tepat untuk melakukan hand hygiene?",
          type: "radio",
          required: true,
          options: opts(
            "a. Sebelum makan",
            "b. Setelah kontak dengan pasien",
            "c. Sebelum dan sesudah kontak dengan pasien",
            "d. Saat tangan terasa kotor saja"
          ),
        },
        {
          name: "soal4",
          label:
            "4. APD yang wajib digunakan di ruang gizi adalah?",
          type: "radio",
          required: true,
          options: opts(
            "a. Helm",
            "b. Sarung tangan, masker, dan apron",
            "c. Sepatu safety saja",
            "d. Kacamata pelindung"
          ),
        },
        {
          name: "soal5",
          label:
            "5. Limbah makanan pasien dikategorikan sebagai?",
          type: "radio",
          required: true,
          options: opts(
            "a. Limbah medis infeksius",
            "b. Limbah non-medis organik",
            "c. Limbah bahan berbahaya",
            "d. Limbah kimia"
          ),
        },
      ],
    },
  ],
};

// ============================================================
// 17. FORM INSIDEN HAIS
// ============================================================
const insidenHais: FormConfig = {
  slug: "insiden-hais",
  title: "Form Insiden HAIs",
  description: "Form terpadu pelaporan insiden Healthcare-Associated Infections",
  category: "surveilans",
  icon: "AlertTriangle",
  color: "from-rose-500 to-red-600",
  sections: [
    {
      title: "Data Pasien & Insiden",
      fields: [
        { name: "tanggal", label: "Tanggal Insiden", type: "date", required: true },
        { name: "namaPasien", label: "Nama Pasien", type: "text", required: true },
        { name: "noRm", label: "No. Rekam Medis", type: "text", required: true },
        {
          name: "ruangan",
          label: "Ruangan",
          type: "dropdown",
          required: true,
          options: opts(
            "IRNA 1", "IRNA 2", "IRNA 2 ATAS", "ISOLASI", "ICU", "NICU", 
            "IGD", "POLIKLINIK", "NIFAS", "IRNA ANAK", "BERSALIN", "HIPERBARIK", "HD", "VK PONEX"
          ),
        },
        {
          name: "jenisInsiden",
          label: "Jenis HAIs",
          type: "dropdown",
          required: true,
          options: opts("ISK", "IDO", "VAP", "IADP", "HAP", "Phlebitis", "Lainnya"),
        },
        {
          name: "tindakanInvasif",
          label: "Tindakan Invasif yang Mendasari (Opsional)",
          type: "text",
          description: "Contoh: Pemasangan Kateter, Ventilator, dll",
        },
        {
          name: "gejala",
          label: "Gejala / Tanda Infeksi",
          type: "textarea",
          required: true,
          placeholder: "Deskripsikan gejala klinis yang muncul...",
        },
      ],
    },
  ],
};

// ============================================================
// Export all form configurations
// ============================================================
export const allFormConfigs: FormConfig[] = [
  auditKebersihanTangan,
  auditFasilitasKebersihanTangan,
  auditKepatuhanApd,
  checklistBundleIdo,
  checklistBundleVap,
  checklistBundlePlabsi,
  checklistBundleCauti,
  monitoringIpal,
  auditPembuanganLimbah,
  auditLinenKotor,
  auditBendaTajam,
  auditLimbahCair,
  monitoringKamarJenazah,
  laporanTertusukJarum,
  monitoringLinenLaundry,
  pretestGizi,
  insidenHais,
];

export function getFormConfig(slug: string): FormConfig | undefined {
  return allFormConfigs.find((f) => f.slug === slug);
}

export function getFormsByCategory(
  category: FormConfig["category"]
): FormConfig[] {
  return allFormConfigs.filter((f) => f.category === category);
}
