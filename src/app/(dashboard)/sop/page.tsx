"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Search,
  Upload,
  Eye,
  Download,
  Trash2,
  Loader2,
  Plus,
  FileUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SopDocument {
  id: number;
  title: string;
  documentNumber: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export default function SopPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [documents, setDocuments] = useState<SopDocument[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    documentNumber: "",
    file: null as File | null,
  });

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`/api/sop?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error("Failed to fetch SOPs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [search]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/sop?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch SOPs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.documentNumber) return;
    setUploading(true);

    try {
      let fileUrl = "/uploads/placeholder.pdf";

      // Upload file if provided
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

      const res = await fetch("/api/sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadForm.title,
          documentNumber: uploadForm.documentNumber,
          fileUrl,
        }),
      });

      if (res.ok) {
        setDialogOpen(false);
        setUploadForm({ title: "", documentNumber: "", file: null });
        fetchDocuments();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus SOP ini?")) return;

    try {
      const res = await fetch(`/api/sop?id=${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">SOP PPI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Standar Operasional Prosedur Pencegahan dan Pengendalian Infeksi
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25">
                <Plus className="w-4 h-4 mr-2" />
                Upload SOP
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload SOP Baru</DialogTitle>
                <DialogDescription>
                  Unggah dokumen SOP PPI baru ke sistem
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sop-title">Judul SOP</Label>
                  <Input
                    id="sop-title"
                    placeholder="Contoh: SOP Cuci Tangan 6 Langkah"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sop-number">Nomor Dokumen</Label>
                  <Input
                    id="sop-number"
                    placeholder="Contoh: SOP/PPI/001/2024"
                    value={uploadForm.documentNumber}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        documentNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sop-file">File Dokumen</Label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-green-300 transition-colors">
                    <FileUp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {uploadForm.file
                        ? uploadForm.file.name
                        : "Klik untuk memilih file atau drag & drop"}
                    </p>
                    <Input
                      id="sop-file"
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
                    className="bg-gradient-to-r from-green-500 to-emerald-600"
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

      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari SOP berdasarkan judul atau nomor dokumen..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Daftar SOP
            </CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {documents.length} dokumen
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-green-500" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted-foreground">Belum ada dokumen SOP</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead className="hidden sm:table-cell">No. Dokumen</TableHead>
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
                        <div>
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {doc.documentNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="font-mono text-xs">
                          {doc.documentNumber}
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
