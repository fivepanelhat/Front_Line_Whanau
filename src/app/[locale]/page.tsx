import RoleSelector from '@/components/RoleSelector';

export default function HomePage() {
  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
      <RoleSelector />
    </main>
  );
}
