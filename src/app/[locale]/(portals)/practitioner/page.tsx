export default function PractitionerPortal() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-700">Practitioner & Organisation Portal</h1>
        <p className="text-gray-600 mt-2">Tools and resources for professionals and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Directory Management</h3>
          <p className="text-sm text-gray-600">Update your organisation’s information.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Ask the AI Assistant</h3>
          <p className="text-sm text-gray-600">Get professional-grade insights and resources.</p>
        </div>
      </div>
    </div>
  );
}
