import { DirectoryListingForm } from '@/components/DirectoryListingForm';
import { OrganisationUploadForm } from '@/components/OrganisationUploadForm';

export default function OrganisationUploadPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-text-primary text-2xl font-bold sm:text-3xl">
          Organisation Self-Service
        </h1>
        <p className="text-text-secondary mt-2">
          Manage your directory listings and secure resources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
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
