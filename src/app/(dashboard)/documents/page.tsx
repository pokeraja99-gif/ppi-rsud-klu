"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  Search,
  Upload,
  Eye,
  Download,
  Trash2,
  Loader2,
  Plus,
  FileUp,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface OtherDocument {
  id: number;
  title: string;
  category: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

const categories = [
  { value: "ALL", label: "Semua Kategori" },
  { value: "SK", label: "Surat Keputusan (SK)" },
  { value: "PEDOMAN", label: "Pedoman" },
  { value: "LAPORAN", label: "Laporan" },
];

const categoryColors: Record<string, string> = {
  SK: "bg-violet-100 text-violet-700 border-violet-200",
  PEDOMAN: "bg-emerald-100 text-emerald-700 border-emerald-200",
  LAPORAN: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function DocumentsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [documents, setDocuments] = useState<OtherDocument[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    category: "",
    file: null as File | null,
  });

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category !== "ALL") params.set("category", category);
        const res = await fetch(`/api/documents?${params.toString()}`);
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [search, category]);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "ALL") params.set("category", category);
      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.category) return;
    setUploading(true);

    try {
      let fileUrl = "/uploads/placeholder.pdf";

      if (uploadForm.file) {
        const formData = new FormData();
        formData.append("file", uploadForm.file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          fileUrl = uploadData.fileUrl;
        }
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadForm.title,
          category: uploadForm.category,
          fileUrl,
        }),
      });

      if (res.ok) {
        setDialogOpen(false);
        setUploadForm({ title: "", category: "", file: null });
        fetchDocuments();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;

    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dokumen Lain-lain
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            SK, Pedoman, Laporan, dan dokumen PPI lainnya
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25">
                <Plus className="w-4 h-4 mr-2" />
                Upload Dokumen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Dokumen Baru</DialogTitle>
                <DialogDescription>
                  Unggah dokumen SK, Pedoman, atau Laporan PPI
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-title">Judul Dokumen</Label>
                  <Input
                    id="doc-title"
                    placeholder="Contoh: SK Pembentukan Komite PPI"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(v) =>
                      setUploadForm({ ...uploadForm, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SK">Surat Keputusan (SK)</SelectItem>
                      <SelectItem value="PEDOMAN">Pedoman</SelectItem>
                      <SelectItem value="LAPORAN">Laporan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-file">File Dokumen</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-violet-300 transition-colors relative">
                    <FileUp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {uploadForm.file
                        ? uploadForm.file.name
                        : "Klik untuk memilih file"}
                    </p>
                    <Input
                      id="doc-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          file: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <Button type="button" variant="outline" size="sm">
                      Pilih File
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-gradient-to-r from-violet-500 to-purple-600"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search & Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari dokumen berdasarkan judul..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-violet-500" />
              Daftar Dokumen
            </CardTitle>
            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
              {documents.length} dokumen
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted-foreground">Belum ada dokumen</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc, i) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900">{doc.title}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={categoryColors[doc.category] || ""}
                        >
                          {doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {formatDate(doc.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Lihat"
                            onClick={() => window.open(doc.fileUrl, "_blank")}
                          >
                            <Eye className="w-4 h-4 text-emerald-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Download"
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = doc.fileUrl;
                              a.download = doc.title || "document";
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}
                          >
                            <Download className="w-4 h-4 text-emerald-500" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Hapus"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
