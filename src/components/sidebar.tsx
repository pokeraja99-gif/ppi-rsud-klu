"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  FolderOpen,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  User,
  ChevronRight,
  Database,
  Users,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Form Surveilans & Audit",
    href: "/forms",
    icon: ClipboardList,
  },

  {
    title: "SOP PPI",
    href: "/sop",
    icon: FileText,
  },
  {
    title: "Dokumen Lain-lain",
    href: "/documents",
    icon: FolderOpen,
  },
  {
    title: "Manajemen Pengguna",
    href: "/users",
    icon: Users,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo RSUD KLU" width={40} height={40} className="object-contain drop-shadow-md" />
          <div>
            <h2 className="font-bold text-white text-sm leading-tight">SI-PPI</h2>
            <p className="text-[10px] text-emerald-200/70 leading-tight">RSUD Kab. Lombok Utara</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] font-semibold text-emerald-300/50 uppercase tracking-wider mb-3 px-3">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          
          if (item.adminOnly && session?.user?.role !== "ADMIN") {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-white/15 text-white shadow-lg shadow-black/10"
                  : "text-emerald-100/70 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  active ? "text-green-300" : "text-emerald-300/50 group-hover:text-green-300"
                )}
              />
              <span className="flex-1">{item.title}</span>
              {active && <ChevronRight className="w-4 h-4 text-green-300" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 border-0",
                session?.user?.role === "ADMIN"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-emerald-500/20 text-emerald-300"
              )}
            >
              {session?.user?.role === "ADMIN" ? "Admin / IPCN" : "User / IPCLN"}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full justify-start text-red-300/70 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out",
          "bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 z-30 h-full w-72 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 shadow-2xl">
        <SidebarContent />
      </aside>
    </>
  );
}
