# Sistem Informasi Form PPI - RSUD KLU

Sistem Informasi Pencatatan dan Pelaporan Infeksi (PPI) untuk RSUD Kabupaten Lombok Utara (KLU). Aplikasi ini dibangun menggunakan Next.js untuk memudahkan pengisian form dan pelaporan data secara digital.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database ORM:** [Prisma](https://www.prisma.io/)
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

2. **Migrasi Database Prisma**
   Perintah ini akan membuat tabel di database MySQL Anda sesuai dengan skema yang ada di `prisma/schema.prisma`.
   ```bash
   npx prisma db push
   ```
   *(Opsional) Jika Anda ingin melihat/mengelola data database via browser:*
   ```bash
   npx prisma studio
   ```

3. **Jalankan Server Development**
   ```bash
   npm run dev
   ```

4. Buka browser dan akses [http://localhost:3000](http://localhost:3000). Aplikasi sudah siap digunakan!

## 🌍 Deployment & Domain

Proyek ini dikonfigurasi untuk di-deploy ke **Vercel** dengan domain custom dari **IDCloudHost**. 
Untuk informasi detail mengenai konfigurasi domain (`rsudklu.web.id` dan `ppi.rsudklu.web.id`), silakan baca file **[`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)**.
