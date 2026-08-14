import { notFound } from "next/navigation";
import { getFormConfig } from "@/lib/form-configs";
import { DynamicForm } from "@/components/forms/DynamicForm";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function DynamicFormPage({ params }: PageProps) {
  const config = getFormConfig(params.slug);

  if (!config) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <DynamicForm config={config} />
    </div>
  );
}
