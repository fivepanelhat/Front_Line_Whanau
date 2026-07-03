export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-indigo-700 py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">National Partnerships</h1>
        <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
          Collaborating to provide a seamless support ecosystem for preterm whānau in Aotearoa.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 grid gap-12 md:grid-cols-2">
        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Health NZ (Te Whatu Ora)</h2>
          <p className="text-gray-700">
            We are working towards interoperability with national health systems. Our future FHIR (Fast Healthcare Interoperability Resources) integrations will allow clinical teams to directly recommend resources to whānau securely.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Little Miracles Trust</h2>
          <p className="text-gray-700">
            As a cornerstone of neonatal support in NZ, The Little Miracles Trust's resources and support networks are deeply integrated into our national directory, ensuring families get the help they need immediately.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plunket (Whānau Āwhina)</h2>
          <p className="text-gray-700">
            Transitioning from NICU to home is a critical period. We collaborate with Plunket to ensure community nurses have access to the Practitioner Dashboard for seamless care handover.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Iwi Health Providers</h2>
          <p className="text-gray-700">
            Partnering directly with local Iwi health providers ensures that our platform accurately reflects the kaupapa Māori support services available in specific regions across Aotearoa.
          </p>
        </div>
      </div>
    </div>
  );
}
