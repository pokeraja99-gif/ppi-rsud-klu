import { notFound } from "next/navigation";
import { getFormConfig } from "@/lib/form-configs";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function DynamicFormPage({ params }: PageProps) {
  const baseConfig = getFormConfig(params.slug);

  if (!baseConfig) {
    notFound();
  }

  // Fetch dynamic options from DB
  const [ipcns, ruangans, profesis] = await Promise.all([
    prisma.ipcn.findMany({ orderBy: { name: 'asc' } }),
    prisma.ruangan.findMany({ orderBy: { name: 'asc' } }),
    prisma.profesi.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Clone config to inject dynamic options
  const config = JSON.parse(JSON.stringify(baseConfig));
  
  config.sections.forEach((section: any) => {
    section.fields.forEach((field: any) => {
      if (field.name === "ipcn" || field.name === "auditorIpcn") {
        field.options = ipcns.map((i) => ({ label: i.name, value: i.name }));
      }
      if (field.name === "ruangan" || field.name === "unitRuangan") {
        field.options = ruangans.map((r) => ({ label: r.name, value: r.name }));
      }
      if (field.name === "profesi") {
        field.options = profesis.map((p) => ({ label: p.name, value: p.name }));
      }
    });
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <DynamicForm config={config} />
    </div>
  );
}
