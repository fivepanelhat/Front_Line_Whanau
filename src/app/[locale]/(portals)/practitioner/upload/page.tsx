import { DirectoryListingForm } from '@/components/DirectoryListingForm';
import { OrganisationUploadForm } from '@/components/OrganisationUploadForm';

export default function OrganisationUploadPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-700">Organisation Self-Service</h1>
        <p className="text-gray-600 mt-2">Manage your directory listings and secure resources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <DirectoryListingForm />
        </div>
        <div>
          <OrganisationUploadForm />
        </div>
      </div>
    </div>
  );
}
