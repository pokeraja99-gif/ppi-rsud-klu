"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFormConfig } from "@/lib/form-configs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Loader2, Calendar as CalendarIcon, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";

function toCamelCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

// Generate the exact camelCase keys expected from the DB
function getExpectedColumns(config: any) {
  const columns: { label: string; key: string }[] = [];
  
  columns.push({ label: "Tanggal Dibuat", key: "createdAt" });
  
  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.type === "section") continue;
      
      if (field.type === "grid" && field.grid && field.grid.rows) {
        for (const row of field.grid.rows) {
          columns.push({
            label: `${field.label} - ${row}`,
            key: toCamelCase(field.name + "_" + row),
          });
        }
      } else {
        columns.push({
          label: field.label,
          key: toCamelCase(field.name),
        });
      }
    }
  }
  return columns;
}

// Generate compliance stats dynamically based on form structure
function generateComplianceStats(data: any[], config: any) {
  const stats: { name: string; ya: number; tidak: number; compliance: number }[] = [];
  let totalYa = 0;
  let totalTidak = 0;

  for (const section of config.sections) {
    // Skip general info sections
    const titleLower = section.title.toLowerCase();
    if (titleLower.includes("umum") || titleLower.includes("identitas")) continue;

    let sectionYa = 0;
    let sectionTidak = 0;

    for (const field of section.fields) {
      if (field.type === "section") continue;
      
      const keysToCheck: string[] = [];
      if (field.type === "grid" && field.grid && field.grid.rows) {
        for (const row of field.grid.rows) {
          keysToCheck.push(toCamelCase(field.name + "_" + row));
        }
      } else {
        keysToCheck.push(toCamelCase(field.name));
      }

      for (const row of data) {
        for (const key of keysToCheck) {
          const val = row[key];
          if (val === "Ya" || val === "YA" || val === "Y" || val === true) {
            sectionYa++;
            totalYa++;
          } else if (val === "Tidak" || val === "TIDAK" || val === "T" || val === false) {
            sectionTidak++;
            totalTidak++;
          }
        }
      }
    }

    if (sectionYa > 0 || sectionTidak > 0) {
      stats.push({
        name: section.title.replace(/Bagian [A-Z] - |Checklist /g, ""), // clean up title
        ya: sectionYa,
        tidak: sectionTidak,
        compliance: Math.round((sectionYa / (sectionYa + sectionTidak)) * 100),
      });
    }
  }

  const overallCompliance = (totalYa + totalTidak) > 0 
    ? Math.round((totalYa / (totalYa + totalTidak)) * 100) 
    : 0;

  return { stats, totalYa, totalTidak, overallCompliance };
}

export default function RekapDataPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const config = getFormConfig(slug);

  useEffect(() => {
    if (!config) {
      router.push("/rekap");
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/rekap/${slug}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug, config, router]);

  if (!config) return null;

  const columns = getExpectedColumns(config);

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "boolean") return val ? "Ya" : "Tidak";
    if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return new Date(val).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
    return String(val);
  };

  const filteredData = data.filter((row) => {
    if (!startDate && !endDate) return true;
    
    // Fallback to createdAt if `tanggal` isn't found
    const rowDateString = row.tanggal || row.createdAt;
    if (!rowDateString) return true;
    
    const rowDate = new Date(rowDateString);
    rowDate.setHours(0, 0, 0, 0);
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (rowDate < start) return false;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      if (rowDate > end) return false;
    }
    
    return true;
  });

  const { stats, totalYa, totalTidak, overallCompliance } = generateComplianceStats(filteredData, config);

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/rekap")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Data: {config.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {/* Summary Table */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b py-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                Ringkasan {config.title.replace("Cheklist ", "").replace("Audit ", "")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-slate-100/50">
                    <TableHead>PERIODE/KATEGORI</TableHead>
                    <TableHead className="text-center">YA</TableHead>
                    <TableHead className="text-center">TIDAK</TableHead>
                    <TableHead className="text-right">% KEPATUHAN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{s.name.toUpperCase()}</TableCell>
                      <TableCell className="text-center">{s.ya}</TableCell>
                      <TableCell className="text-center">{s.tidak}</TableCell>
                      <TableCell className="text-right font-semibold">{s.compliance}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-yellow-300 hover:bg-yellow-400 font-bold text-slate-900">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-center">{totalYa}</TableCell>
                    <TableCell className="text-center">{totalTidak}</TableCell>
                    <TableCell className="text-right">{overallCompliance}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bar Chart 1 - Per Category */}
          <Card className="border-0 shadow-md">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-semibold text-center text-slate-600 uppercase">
                Angka Kepatuhan {config.title.replace("Cheklist ", "").replace("Audit ", "")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-0 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Bar dataKey="compliance" name="Angka Kepatuhan (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                    <LabelList dataKey="compliance" position="top" formatter={(val: any) => `${val}%`} style={{ fontSize: '10px', fill: '#64748b' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart 2 - Overall */}
          <Card className="border-0 shadow-md">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-semibold text-center text-slate-600 uppercase">
                Total Kepatuhan {config.title.replace("Cheklist ", "").replace("Audit ", "")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-0 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: "TOTAL", value: overallCompliance }]} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Bar dataKey="value" name="Total Kepatuhan (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={80}>
                     <LabelList dataKey="value" position="top" formatter={(val: any) => `${val}%`} style={{ fontSize: '10px', fill: '#64748b' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          <CardTitle className="text-sm font-semibold">Tabel Rekapitulasi</CardTitle>
          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
            <div className="flex items-center gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="start-date" className="text-xs text-muted-foreground">Dari Tanggal</Label>
                <div className="relative">
                  <Input 
                    type="date" 
                    id="start-date" 
                    className="h-8 text-xs w-[140px]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <span className="text-muted-foreground mt-4">-</span>
              <div className="grid gap-1.5">
                <Label htmlFor="end-date" className="text-xs text-muted-foreground">Sampai Tanggal</Label>
                <div className="relative">
                  <Input 
                    type="date" 
                    id="end-date" 
                    className="h-8 text-xs w-[140px]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Belum ada data yang sesuai dengan pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] relative">
              <Table className="w-full whitespace-nowrap">
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-[50px] text-center">No</TableHead>
                    {columns.map((col) => (
                      <TableHead key={col.key} className="min-w-[150px]">
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          {formatValue(row[col.key])}
                        </TableCell>
                      ))}
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
