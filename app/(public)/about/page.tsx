export default function AboutPage() {
  return (
    <main className="flex-1 pt-16">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            About MyMedirecords
          </h1>
          <div className="max-w-3xl mx-auto space-y-6 text-gray-600">
            <p>
              MyMedirecords is a comprehensive medical record management system
              designed to empower both patients and healthcare providers.
            </p>
            <p>
              Our mission is to make healthcare information accessible, secure,
              and easy to manage for everyone involved in the healthcare
              journey.
            </p>
            <p>
              Founded in 2024, we've been at the forefront of digital healthcare
              innovation, constantly evolving our platform to meet the changing
              needs of modern healthcare.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
