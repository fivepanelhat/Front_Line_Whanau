export default function PartnershipsPage() {
  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="bg-accent-primary px-4 py-10 text-center sm:px-6 sm:py-16">
        <h1 className="text-accent-ink mb-3 text-2xl font-bold sm:mb-4 sm:text-4xl">
          National Partnerships
        </h1>
        <p className="text-accent-ink/80 mx-auto max-w-2xl text-base sm:text-lg">
          Collaborating to provide a seamless support ecosystem for preterm whanau in Aotearoa.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:gap-12 sm:px-6 sm:py-12 md:grid-cols-2">
        <div className="bg-bg-secondary border-border rounded-xl border p-6 sm:p-8">
          <h2 className="text-text-primary mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
            Health NZ (Te Whatu Ora)
          </h2>
          <p className="text-text-secondary">
            We are working towards interoperability with national health systems. Our future FHIR
            (Fast Healthcare Interoperability Resources) integrations will allow clinical teams to
            directly recommend resources to whanau securely.
          </p>
        </div>

        <div className="bg-bg-secondary border-border rounded-xl border p-6 sm:p-8">
          <h2 className="text-text-primary mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
            The Little Miracles Trust
          </h2>
          <p className="text-text-secondary">
            As a cornerstone of neonatal support in NZ, The Little Miracles Trust's resources and
            support networks are deeply integrated into our national directory, ensuring families
            get the help they need immediately.
          </p>
        </div>

        <div className="bg-bg-secondary border-border rounded-xl border p-6 sm:p-8">
          <h2 className="text-text-primary mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
            Plunket (Whanau Awhina)
          </h2>
          <p className="text-text-secondary">
            Transitioning from NICU to home is a critical period. We collaborate with Plunket to
            ensure community nurses have access to the Practitioner Dashboard for seamless care
            handover.
          </p>
        </div>

        <div className="bg-bg-secondary border-border rounded-xl border p-6 sm:p-8">
          <h2 className="text-text-primary mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
            Iwi Health Providers
          </h2>
          <p className="text-text-secondary">
            Partnering directly with local Iwi health providers ensures that our platform accurately
            reflects the kaupapa Maori support services available in specific regions across
            Aotearoa.
          </p>
        </div>
      </div>
    </div>
  );
}
