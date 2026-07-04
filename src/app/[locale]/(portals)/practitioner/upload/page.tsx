import { DirectoryListingForm } from '@/components/DirectoryListingForm';
import { OrganisationUploadForm } from '@/components/OrganisationUploadForm';

export default function OrganisationUploadPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Organisation Self-Service</h1>
        <p className="text-text-secondary mt-2">Manage your directory listings and secure resources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
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
