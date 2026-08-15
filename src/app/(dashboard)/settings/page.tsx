"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Loader2, Users } from "lucide-react";

type Tab = "ipcn" | "ruangan" | "profesi";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<Tab>("ipcn");
  const [dataList, setDataList] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setDataList(data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/settings/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (res.ok) {
        setNewName("");
        fetchData();
      } else {
        alert("Gagal menambahkan data.");
      }
    } catch (err) {
      console.error("Add error:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const res = await fetch(`/api/settings/${activeTab}?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (status === "loading" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
  }

  const tabLabels: Record<Tab, string> = {
    ipcn: "Petugas IPCN",
    ruangan: "Ruangan",
    profesi: "Profesi",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola opsi nama IPCN, ruangan, dan profesi untuk form.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/users")} className="gap-2">
          <Users className="w-4 h-4" />
          Manajemen Pengguna
        </Button>
      </div>

      <div className="flex space-x-2 border-b border-gray-200">
        {(Object.keys(tabLabels) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kelola {tabLabels[activeTab]}</CardTitle>
          <CardDescription>
            Data ini akan muncul sebagai opsi pada dropdown di berbagai form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAdd} className="flex items-end gap-4 max-w-md">
            <div className="space-y-2 flex-1">
              <Label htmlFor="newName">Tambah Baru</Label>
              <Input
                id="newName"
                placeholder={`Nama ${tabLabels[activeTab]}...`}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={adding} className="bg-emerald-600 hover:bg-emerald-700">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Tambah
            </Button>
          </form>

          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead className="w-full">Nama</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Belum ada data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataList.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
