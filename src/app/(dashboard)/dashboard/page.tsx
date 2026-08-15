"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  FileText,
  TrendingUp,
  AlertTriangle,
  Activity,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data arrays removed, data is now fetched dynamically

const PIE_COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [dashboardData, setDashboardData] = useState({
    totalForms: 0,
    totalSops: 0,
    complianceRate: 0,
    haisThisMonth: 0,
    recentActivities: [] as any[],
    chartData: {
      complianceData: [],
      haisData: [],
      momentData: [],
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setDashboardData({
            totalForms: data.totalForms || 0,
            totalSops: data.totalSops || 0,
            complianceRate: data.complianceRate || 0,
            haisThisMonth: data.haisThisMonth || 0,
            recentActivities: data.recentActivities || [],
            chartData: data.chartData || {
              complianceData: [],
              haisData: [],
              momentData: [],
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Formulir",
      value: loading ? "..." : dashboardData.totalForms.toString(),
      desc: "Total pengisian",
      icon: ClipboardCheck,
      color: "from-green-500 to-emerald-500",
      shadowColor: "shadow-green-500/20",
    },
    {
      title: "Dokumen SOP",
      value: loading ? "..." : dashboardData.totalSops.toString(),
      desc: "SOP aktif",
      icon: FileText,
      color: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/20",
    },
    {
      title: "Tingkat Kepatuhan",
      value: loading ? "..." : `${dashboardData.complianceRate}%`,
      desc: "Rata-rata kepatuhan",
      icon: TrendingUp,
      color: "from-emerald-500 to-green-600",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "Insiden HAIs",
      value: loading ? "..." : dashboardData.haisThisMonth.toString(),
      desc: "Kasus bulan ini",
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin
              ? "Ringkasan data PPI seluruh unit rumah sakit"
              : `Data PPI untuk unit ${session?.user?.unit}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Activity className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          {isAdmin && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              <Users className="w-3 h-3 mr-1" />
              Seluruh Unit
            </Badge>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.title}
            className={`card-hover border-0 shadow-lg ${stat.shadowColor} animate-fade-in-up`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mt-1 text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.desc}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - Kepatuhan Cuci Tangan */}
        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Kepatuhan Cuci Tangan</CardTitle>
            <CardDescription>
              Persentase kepatuhan per bulan (6 bulan terakhir)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.chartData.complianceData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: any) => `${value}%`}
                  />
                  <Legend />
                  <Bar
                    dataKey="patuh"
                    name="Patuh"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="tidakPatuh"
                    name="Tidak Patuh"
                    fill="#fbbf24"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                    opacity={0.7}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line chart - Insiden HAIs */}
        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Insiden HAIs</CardTitle>
            <CardDescription>
              Tren Healthcare-Associated Infections per bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.chartData.haisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ISK"
                    name="ISK"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="IDO"
                    name="IDO"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="VAP"
                    name="VAP"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="IADP"
                    name="IADP"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart */}
        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Kepatuhan 5 Momen</CardTitle>
            <CardDescription>Distribusi kepatuhan per momen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.chartData.momentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dashboardData.chartData.momentData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: any) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {dashboardData.chartData.momentData.map((m: any, i: number) => (
                <div key={m.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i] }}
                  />
                  <span className="text-muted-foreground flex-1">{m.label}</span>
                  <span className="font-semibold">{m.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card
          className="lg:col-span-2 border-0 shadow-lg animate-fade-in-up"
          style={{ animationDelay: "700ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Pengisian formulir dan unggahan terkini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {dashboardData.recentActivities.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Belum ada aktivitas terbaru
                </div>
              ) : (
                dashboardData.recentActivities.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === "form"
                        ? "bg-green-100 text-green-600"
                        : "bg-violet-100 text-violet-600"
                    }`}
                  >
                    {activity.type === "form" ? (
                      <ClipboardCheck className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">
                        {activity.user}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {activity.action}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.unit} · {activity.time}
                    </p>
                  </div>
                </div>
              )))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
