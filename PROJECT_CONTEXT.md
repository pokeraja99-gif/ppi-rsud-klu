# Project Context & Deployment Info

**Untuk AI Agent Selanjutnya:**
File ini berisi informasi penting terkait infrastruktur dan deployment proyek ini. Harap baca ini sebelum melakukan perubahan besar yang terkait dengan environment atau domain.

## 1. Informasi Proyek
- **Nama Proyek:** Sistem Informasi Form PPI - RSUD KLU
- **Framework/Stack:** Next.js (berdasarkan struktur folder), Prisma ORM
- **Deployment Platform:** Vercel

## 2. Konfigurasi Domain & DNS (per Agustus 2026)
Aplikasi ini sudah di-deploy ke Vercel dan dihubungkan ke custom domain yang dikelola melalui **IDCloudHost**.

*   **Penyedia Domain:** IDCloudHost
*   **Domain Utama:** `rsudklu.web.id`
*   **Subdomain Aplikasi:** `ppi.rsudklu.web.id` (Direkomendasikan untuk aplikasi ini)

### Konfigurasi Vercel:
Proyek Vercel disetting untuk mendengarkan domain:
- `rsudklu.web.id`
- `www.rsudklu.web.id`
- `ppi.rsudklu.web.id` (Subdomain spesifik untuk aplikasi PPI ini)

### Konfigurasi DNS di IDCloudHost:
Jika AI agent diminta untuk melakukan troubleshooting DNS, ini adalah state terakhir yang dikonfigurasi:
1. **Untuk Subdomain (Rekomendasi Utama):**
   - Type: `CNAME`
   - Name: `ppi`
   - Value: `cname.vercel-dns.com`
2. **Untuk Domain Utama (Jika dipakai untuk aplikasi ini):**
   - Type: `A`
   - Name: `@`
   - Value: `216.198.79.1` (IP Vercel)
   - Type: `CNAME`
   - Name: `www`
   - Value: `92e8f33ebff7fcee.vercel-dns-017.com` (atau `cname.vercel-dns.com`)

*Catatan Penting: Jika RSUD KLU nantinya ingin menggunakan `rsudklu.web.id` untuk website Company Profile rumah sakit (bukan aplikasi PPI ini), maka A record (`@`) di IDCloudHost HARUS dikembalikan ke IP hosting bawaan mereka (misal: `103.15.226.115`), dan biarkan aplikasi PPI ini murni berjalan hanya di `ppi.rsudklu.web.id`.*

## 3. Database
* Terdapat skema Prisma (`prisma/schema.prisma`). Pastikan string koneksi database (`.env`) dikonfigurasi dengan benar di environment variables Vercel agar aplikasi production berjalan lancar.
