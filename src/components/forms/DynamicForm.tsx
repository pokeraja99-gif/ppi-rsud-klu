"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { FormConfig, FormField, FormSection } from "@/lib/form-configs";

interface DynamicFormProps {
  config: FormConfig;
  backHref?: string;
}

export function DynamicForm({ config, backHref = "/forms" }: DynamicFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const updateField = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: config.slug,
          formTitle: config.title,
          data: formData,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(backHref);
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan data");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Berhasil Disimpan!
          </h2>
          <p className="text-muted-foreground">
            Data {config.title} telah tersimpan.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Mengalihkan ke halaman form...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {config.sections.map((section, sIdx) => (
          <SectionCard
            key={sIdx}
            section={section}
            sectionIndex={sIdx}
            color={config.color}
            formData={formData}
            updateField={updateField}
          />
        ))}

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link href={backHref}>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className={`bg-gradient-to-r ${config.color} hover:opacity-90 shadow-lg min-w-[140px]`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Data"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// Section Card Component
// ============================================================
function SectionCard({
  section,
  sectionIndex,
  color,
  formData,
  updateField,
}: {
  section: FormSection;
  sectionIndex: number;
  color: string;
  formData: Record<string, unknown>;
  updateField: (name: string, value: unknown) => void;
}) {
  return (
    <Card
      className="border-0 shadow-lg animate-fade-in-up overflow-hidden"
      style={{ animationDelay: `${sectionIndex * 80}ms` }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${color}`} />
          {section.title}
        </CardTitle>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {section.fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={(val) => updateField(field.name, val)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Field Renderer Component
// ============================================================
function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  switch (field.type) {
    case "text":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.name}
            placeholder={field.placeholder || `Masukkan ${field.label.replace(/^\d+\.\s*/, "")}`}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <Textarea
            id={field.name}
            placeholder={field.placeholder || "Tuliskan di sini..."}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            rows={4}
          />
        </div>
      );

    case "date":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.name}
            type="date"
            value={(value as string) || new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case "time":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            type="time"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case "radio":
      return (
        <div className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                  ${
                    value === opt.value
                      ? "border-green-300 bg-green-50/50 ring-1 ring-green-200"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  required={field.required}
                  className="w-4 h-4 text-green-500 focus:ring-green-400"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "checkbox":
      return <CheckboxField field={field} value={value} onChange={onChange} />;

    case "dropdown":
      return (
        <div className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={(value as string) || ""}
            onValueChange={(v) => onChange(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Pilih ${field.label.replace(/^\d+\.\s*/, "")}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "grid":
      return <GridField field={field} value={value} onChange={onChange} />;

    default:
      return null;
  }
}

// ============================================================
// Checkbox Field Component
// ============================================================
function CheckboxField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const selected = (value as string[]) || [];

  const toggle = (optValue: string) => {
    if (selected.includes(optValue)) {
      onChange(selected.filter((v) => v !== optValue));
    } else {
      onChange([...selected, optValue]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      <div className="space-y-2">
        {field.options?.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
              ${
                selected.includes(opt.value)
                  ? "border-green-300 bg-green-50/50 ring-1 ring-green-200"
                  : "border-gray-100 hover:bg-gray-50"
              }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="w-4 h-4 rounded text-green-500 focus:ring-green-400"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Grid Field Component (Multiple Choice Grid)
// ============================================================
function GridField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const gridData = (value as Record<string, string>) || {};

  const handleGridChange = (row: string, col: string) => {
    onChange({ ...gridData, [row]: col });
  };

  if (!field.grid) return null;

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              <th className="text-left p-3 font-semibold text-gray-700 min-w-[200px] border-b border-gray-200">
                Item
              </th>
              {field.grid.columns.map((col) => (
                <th
                  key={col}
                  className="text-center p-3 font-semibold text-gray-700 min-w-[80px] border-b border-gray-200"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {field.grid.rows.map((row, rowIdx) => (
              <tr
                key={row}
                className={`transition-colors ${
                  rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                } hover:bg-green-50/30`}
              >
                <td className="p-3 text-gray-700 border-b border-gray-100">
                  {row}
                </td>
                {field.grid!.columns.map((col) => (
                  <td
                    key={col}
                    className="text-center p-3 border-b border-gray-100"
                  >
                    <input
                      type="radio"
                      name={`${field.name}__${row}`}
                      checked={gridData[row] === col}
                      onChange={() => handleGridChange(row, col)}
                      className="w-4 h-4 text-green-500 focus:ring-green-400 cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
