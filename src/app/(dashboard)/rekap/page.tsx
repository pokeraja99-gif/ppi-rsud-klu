"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { allFormConfigs } from "@/lib/form-configs";

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

export default function RekapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Dashboard Rekapitulasi Data
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih form untuk melihat hasil rekapitulasi data yang telah diinputkan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allFormConfigs.map((form, i) => {
          const IconComponent = iconMap[form.icon] || ClipboardList;
          
          return (
            <Link key={form.slug} href={`/rekap/${form.slug}`}>
              <Card
                className={`card-hover border-0 shadow-md animate-fade-in-up overflow-hidden group cursor-pointer`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-5">
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
                          Lihat Data
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
