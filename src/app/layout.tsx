import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Sistem Informasi PPI — RSUD Kab. Lombok Utara",
  description:
    "Sistem Informasi Pencegahan dan Pengendalian Infeksi (PPI) RSUD Kabupaten Lombok Utara. Manajemen surveilans, audit kepatuhan, dan dokumen PPI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
