import { ExpertsSection } from "@/components/sections/experts-section";

export default function MedicalTeamPage() {
  return (
    <main className="flex-1 pt-16">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            Our Medical Team
          </h1>
          <ExpertsSection />
        </div>
      </section>
    </main>
  );
}
