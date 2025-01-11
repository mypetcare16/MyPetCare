export default function AboutPage() {
  return (
    <main className="flex-1 pt-16">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            About VetVaults
          </h1>
          <div className="max-w-3xl mx-auto space-y-6 text-gray-600">
            <p>
              VetVaults is a cutting-edge veterinary record management system
              designed to empower both veterinarians and pet owners.
            </p>
            <p>
              Our mission is to revolutionize pet healthcare by making
              veterinary information accessible, secure, and easy to manage for
              everyone involved in animal care.
            </p>
            <p>
              Founded in 2024, we've been at the forefront of digital veterinary
              innovation, constantly evolving our platform to meet the changing
              needs of modern animal healthcare.
            </p>
            <p>
              At VetVaults, we believe in the power of AI-driven insights to
              improve pet health outcomes. Our platform seamlessly integrates
              advanced analytics with comprehensive record-keeping, enabling
              veterinarians to provide the best possible care for their animal
              patients.
            </p>
            <p>
              We're committed to supporting the entire ecosystem of pet care,
              from individual veterinary practices to large animal hospitals,
              ensuring that every pet receives the highest standard of
              healthcare management.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
