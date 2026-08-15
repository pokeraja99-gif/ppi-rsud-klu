# Sistem Informasi Form PPI - RSUD KLU

Sistem Informasi Pencatatan dan Pelaporan Infeksi (PPI) untuk RSUD Kabupaten Lombok Utara (KLU). Aplikasi ini dibangun menggunakan Next.js untuk memudahkan pengisian form (Cuci Tangan, APD, HAIs, Log Book Harian IPCN) dan pelaporan data secara digital.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** MySQL
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **File Storage:** Vercel Blob

## 📋 Prasyarat (Prerequisites)

Sebelum menjalankan proyek ini di lokal, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/en) (versi 18.x atau lebih baru)
- MySQL Server (berjalan di lokal atau remote)

## ⚙️ Environment Variables

Buat file `.env` di root direktori (selevel dengan `package.json`) dan isi dengan variabel berikut:

```env
# Database Configuration (Sesuaikan dengan kredensial MySQL lokal Anda)
DATABASE_URL="mysql://root:@localhost:3306/ppi_rsud_klu"

# Jika mendeploy ke Vercel dengan TiDB Cloud Serverless, WAJIB tambahkan ?sslaccept=strict
# Contoh: DATABASE_URL="mysql://user:pass@gateway01.tidbcloud.com:4000/db?sslaccept=strict"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-for-development"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob (Untuk upload file/gambar)
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token_here"
```

## 🛠️ Cara Menjalankan di Lokal (Development)

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer Anda:

1. **Install dependensi (Library)**
   ```bash
   npm install
   ```

2. **Migrasi Database Drizzle**
   Perintah ini akan melakukan sinkronisasi skema ke database MySQL Anda sesuai dengan definisi di `src/db/schema.ts`.
   ```bash
   npx drizzle-kit push
   ```

3. **Jalankan Server Development**
   ```bash
   npm run dev
   ```

4. Buka browser dan akses [http://localhost:3000](http://localhost:3000). Aplikasi sudah siap digunakan!
