"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on mount and check for timeout error
  useEffect(() => {
    const savedUsername = localStorage.getItem("ppi_username");
    const savedPassword = localStorage.getItem("ppi_password");
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("error") === "timeout") {
        setError("Sesi Anda telah berakhir karena tidak aktif selama 10 menit. Silakan login kembali.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        if (rememberMe) {
          localStorage.setItem("ppi_username", username);
          localStorage.setItem("ppi_password", password);
        } else {
          localStorage.removeItem("ppi_username");
          localStorage.removeItem("ppi_password");
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-200/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in-up">
        {/* Hospital branding */}
        <div className="text-center mb-5 flex flex-col items-center">
          <div className="relative mb-4 w-28 h-28 rounded-full overflow-hidden shadow-xl border-2 border-white/80 hover:scale-110 transition-transform duration-500">
            <Image src="/logo.png" alt="Logo RSUD KLU" fill className="object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Sistem Informasi PPI
          </h1>
          <p className="text-sm text-gray-500">
            RSUD Kabupaten Lombok Utara
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Pencegahan dan Pengendalian Infeksi
          </p>
        </div>

        <Card className="glass shadow-xl border-white/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Masuk ke Akun</CardTitle>
            <CardDescription className="text-center">
              Gunakan kredensial yang telah diberikan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center animate-fade-in-up">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/80 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Ingat saya
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-800 hover:from-green-700 hover:to-emerald-900 shadow-lg shadow-green-700/25 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Komite PPI — RSUD Kab. Lombok Utara
        </p>
      </div>
    </div>
  );
}
