export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-accent-primary py-10 sm:py-16 px-4 sm:px-6 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold text-accent-ink mb-3 sm:mb-4">National Partnerships</h1>
        <p className="text-accent-ink/80 text-base sm:text-lg max-w-2xl mx-auto">
          Collaborating to provide a seamless support ecosystem for preterm whanau in Aotearoa.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid gap-6 sm:gap-12 md:grid-cols-2">
        <div className="bg-bg-secondary p-6 sm:p-8 rounded-xl border border-border">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">Health NZ (Te Whatu Ora)</h2>
          <p className="text-text-secondary">
            We are working towards interoperability with national health systems. Our future FHIR (Fast Healthcare Interoperability Resources) integrations will allow clinical teams to directly recommend resources to whanau securely.
          </p>
        </div>

        <div className="bg-bg-secondary p-6 sm:p-8 rounded-xl border border-border">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">The Little Miracles Trust</h2>
          <p className="text-text-secondary">
            As a cornerstone of neonatal support in NZ, The Little Miracles Trust's resources and support networks are deeply integrated into our national directory, ensuring families get the help they need immediately.
          </p>
        </div>

        <div className="bg-bg-secondary p-6 sm:p-8 rounded-xl border border-border">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">Plunket (Whanau Awhina)</h2>
          <p className="text-text-secondary">
            Transitioning from NICU to home is a critical period. We collaborate with Plunket to ensure community nurses have access to the Practitioner Dashboard for seamless care handover.
          </p>
        </div>

        <div className="bg-bg-secondary p-6 sm:p-8 rounded-xl border border-border">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">Iwi Health Providers</h2>
          <p className="text-text-secondary">
            Partnering directly with local Iwi health providers ensures that our platform accurately reflects the kaupapa Maori support services available in specific regions across Aotearoa.
          </p>
        </div>
      </div>
    </div>
  );
}
