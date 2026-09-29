import Sidebar from "@/components/sidebar";
import LeadForm from "@/components/lead-form";

export default function NewLeadPage() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-ink tracking-wide">
              Add New Lead
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              Capture every detail — AI will analyze and score automatically
            </p>
          </div>
          <LeadForm />
        </div>
      </main>
    </>
  );
}
