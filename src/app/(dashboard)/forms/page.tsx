"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Hand,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Droplets,
  Bug,
  Scissors,
  Thermometer,
  Activity,
  ClipboardList,
  HeartPulse,
  Pill,
  Microscope,
  Bed,
  Baby,
  Bone,
  Eye,
  Ear,
  Smile,
  Zap,
  LucideIcon,
  FileQuestion,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Waves,
  Trash2,
  Shirt,
  Building,
  GraduationCap,
  PenSquare,
  BarChart2,
} from "lucide-react";
import { allFormConfigs } from "@/lib/form-configs";

// Map string icon names from config to actual Lucide components
const iconMap: Record<string, LucideIcon> = {
  Hand,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Droplets,
  Bug,
  Scissors,
  Thermometer,
  Activity,
  ClipboardList,
  HeartPulse,
  Pill,
  Microscope,
  Bed,
  Baby,
  Bone,
  Eye,
  Ear,
  Smile,
  Zap,
  FileQuestion,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Waves,
  Trash2,
  Shirt,
  Building,
  GraduationCap,
};

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Form Surveilans & Audit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih formulir yang akan diisi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allFormConfigs.map((form, i) => {
          const IconComponent = iconMap[form.icon] || ClipboardList;
          
          return (
            <Card
              key={form.slug}
              className={`card-hover border-0 shadow-md animate-fade-in-up overflow-hidden group flex flex-col`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="p-5 flex-1">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${form.color} shadow-lg transition-transform group-hover:scale-110 duration-300`}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {form.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {form.description || form.title}
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                        Aktif
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-2 bg-slate-50/50">
                <Link href={`/forms/${form.slug}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                    <PenSquare className="w-3.5 h-3.5" />
                    Isi Form
                  </Button>
                </Link>
                <Link href={`/rekap/${form.slug}`} className="w-full">
                  <Button variant="default" size="sm" className="w-full text-xs gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700">
                    <BarChart2 className="w-3.5 h-3.5" />
                    Lihat Rekap
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
