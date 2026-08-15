"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  BookOpen,
  Search,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  FileUp,
  Link as LinkIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Logbook {
  id: number;
  userId: number;
  date: string;
  ipcnName: string;
  room: string;
  activityType: string;
  description: string;
  findings: string | null;
  followUp: string | null;
  followUpStatus: string | null;
  proofUrl: string | null;
  createdAt: string;
  user?: {
    name: string;
  };
}

const IPCN_NAMES = [
  "Nurianto Dhama Setiawan",
  "Ni Luh Suartini",
];

const ACTIVITY_TYPES = [
  "Surveilans HAIs/kunjungan pasien berisiko",
  "Supervisi dan monitoring PPI",
  "Audit kepatuhan atau audit bundle",
  "Edukasi/sosialisasi/konsultasi PPI",
  "Investigasi dugaan HAIs atau KLB",
  "Pemantauan pajanan petugas",
  "Koordinasi/rapat PPI",
  "Pengolahan data dan penyusunan laporan",
  "Lainnya",
];

const FOLLOWUP_STATUSES = [
  "Selesai",
  "Dalam proses",
  "Diteruskan kepada unit/Komite PPI",
  "Tidak memerlukan tindak lanjut",
];

export default function LogbookPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    ipcnName: "",
    room: "",
    activityType: "",
    description: "",
    findings: "",
    followUp: "",
    followUpStatus: "",
  });

  const fetchLogbooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logbook?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setLogbooks(data);
    } catch (err) {
      console.error("Failed to fetch logbooks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("Anda harus menyetujui pernyataan terlebih dahulu.");
      return;
    }
    if (!formData.date || !formData.ipcnName || !formData.room || !formData.activityType || !formData.description) {
      alert("Mohon lengkapi semua field yang wajib diisi (*).");
      return;
    }
    
    setSubmitting(true);

    try {
      let proofUrl = "";
      if (uploadFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", uploadFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileFormData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          alert(`Gagal mengunggah file bukti: ${uploadData.error || 'Unknown error'}`);
          setSubmitting(false);
          return;
        }
        proofUrl = uploadData.fileUrl;
      }

      const res = await fetch("/api/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, proofUrl }),
      });

      if (res.ok) {
        setDialogOpen(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          ipcnName: "",
          room: "",
          activityType: "",
          description: "",
          findings: "",
          followUp: "",
          followUpStatus: "",
        });
        setUploadFile(null);
        setAgreed(false);
        fetchLogbooks();
      } else {
        const error = await res.json();
        alert(`Gagal menyimpan: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data logbook ini?")) return;

    try {
      const res = await fetch(`/api/logbook?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchLogbooks();
      } else {
        alert("Gagal menghapus data.");
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Log Book IPCN</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catatan Kegiatan Harian Pencegahan dan Pengendalian Infeksi
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Formulir Kegiatan Log Book</DialogTitle>
              <DialogDescription>
                Silakan isi seluruh data sesuai format kegiatan harian. Field bertanda (*) wajib diisi.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">1. Tanggal kegiatan <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipcnName">2. Nama IPCN <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.ipcnName}
                    onValueChange={(val) => setFormData({ ...formData, ipcnName: val })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Nama IPCN" />
                    </SelectTrigger>
                    <SelectContent>
                      {IPCN_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">3. Unit/lokasi kegiatan <span className="text-red-500">*</span></Label>
                <Input
                  id="room"
                  placeholder="Jawaban Anda"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityType">4. Jenis kegiatan <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.activityType}
                  onValueChange={(val) => setFormData({ ...formData, activityType: val })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Kegiatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">5. Uraian singkat kegiatan <span className="text-red-500">*</span></Label>
                <p className="text-xs text-muted-foreground">Contoh: Melakukan surveilans pasien terpasang kateter urine di ruang ICU.</p>
                <Textarea
                  id="description"
                  placeholder="Jawaban Anda"
                  className="min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="findings">6. Hasil atau temuan</Label>
                <p className="text-xs text-muted-foreground">Contoh: Ditemukan satu pasien dengan pemasangan kateter lebih dari tujuh hari.</p>
                <Textarea
                  id="findings"
                  placeholder="Jawaban Anda"
                  className="min-h-[80px]"
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUp">7. Tindakan atau tindak lanjut</Label>
                <p className="text-xs text-muted-foreground">Contoh: Berkoordinasi dengan kepala ruangan dan menyarankan evaluasi indikasi kateter.</p>
                <Textarea
                  id="followUp"
                  placeholder="Jawaban Anda"
                  className="min-h-[80px]"
                  value={formData.followUp}
                  onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>8. Status tindak lanjut</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {FOLLOWUP_STATUSES.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`status-${status}`} 
                        checked={formData.followUpStatus === status}
                        onCheckedChange={(checked) => {
                          if (checked) setFormData({ ...formData, followUpStatus: status });
                          else setFormData({ ...formData, followUpStatus: "" });
                        }}
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="proofFile">9. Unggah bukti kegiatan (Opsional)</Label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors bg-gray-50/50">
                  <FileUp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {uploadFile
                      ? uploadFile.name
                      : "Pilih file untuk diunggah (Maks 100 MB)"}
                  </p>
                  <Input
                    id="proofFile"
                    type="file"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <Button type="button" variant="outline" size="sm">
                    Tambahkan File
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label className="text-red-500">10. Pernyataan *</Label>
                <div className="flex items-start space-x-3 mt-2 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <Checkbox 
                    id="agreement" 
                    checked={agreed}
                    onCheckedChange={(val) => setAgreed(!!val)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="agreement"
                      className="text-sm font-medium leading-relaxed text-gray-700 cursor-pointer"
                    >
                      Saya menyatakan bahwa seluruh kegiatan IPCN yang dicatat dalam formulir ini benar-benar telah dilaksanakan, diisi secara benar, lengkap, dan dapat dipertanggungjawabkan, serta tetap menjaga kerahasiaan data pasien dan rumah sakit sesuai ketentuan yang berlaku.
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={submitting || !agreed}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Kirim Formulir"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan ruangan, kegiatan, atau IPCN..."
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
              <BookOpen className="w-5 h-5 text-emerald-500" />
              Daftar Riwayat Kegiatan
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {logbooks.length} catatan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : logbooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted-foreground">Belum ada catatan kegiatan log book</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Tanggal</TableHead>
                    <TableHead className="w-[140px]">IPCN & Unit</TableHead>
                    <TableHead>Jenis Kegiatan</TableHead>
                    <TableHead>Uraian / Temuan</TableHead>
                    <TableHead className="w-[150px]">Tindak Lanjut</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logbooks.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium align-top pt-4">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Date(log.date).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium text-sm text-gray-900">{log.ipcnName}</span>
                          <Badge variant="secondary" className="w-fit font-normal text-xs">
                            {log.room}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <p className="text-sm text-gray-700 line-clamp-2" title={log.activityType}>
                          {log.activityType}
                        </p>
                        {log.proofUrl && (
                          <a 
                            href={log.proofUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex mt-2 items-center text-xs text-blue-600 hover:underline gap-1 bg-blue-50 px-2 py-0.5 rounded-full"
                          >
                            <LinkIcon className="w-3 h-3" /> Bukti Terlampir
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Uraian:</span>
                            <p className="text-sm text-gray-800 line-clamp-2" title={log.description}>{log.description}</p>
                          </div>
                          {log.findings && (
                            <div>
                              <span className="text-xs font-semibold text-amber-600/80 uppercase">Temuan:</span>
                              <p className="text-sm text-gray-600 line-clamp-2" title={log.findings}>{log.findings}</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        {log.followUpStatus && (
                          <Badge variant="outline" className={`mb-1.5 whitespace-nowrap ${
                            log.followUpStatus === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : 
                            log.followUpStatus === 'Dalam proses' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {log.followUpStatus}
                          </Badge>
                        )}
                        {log.followUp && (
                          <p className="text-xs text-muted-foreground line-clamp-2" title={log.followUp}>
                            {log.followUp}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                            title="Hapus"
                            onClick={() => handleDelete(log.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
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
