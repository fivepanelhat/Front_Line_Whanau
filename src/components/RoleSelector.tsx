'use client';

import { useRole } from '@/context';
import { useRouter } from 'next/navigation';

export default function RoleSelector() {
  const { setRole } = useRole();
  const router = useRouter();

  const handleSelect = (role: 'parent' | 'practitioner') => {
    setRole(role);
    router.push(`/${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Front_Line_Whanau</h1>
      <p className="text-xl text-gray-600 mb-10 max-w-md">
        Supporting whānau of preterm twins across Aotearoa New Zealand
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Parent Portal */}
        <button
          onClick={() => handleSelect('parent')}
          className="flex-1 p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-200 shadow-lg"
        >
          <div className="text-2xl font-semibold mb-2">I am a Parent / Whānau</div>
          <p className="text-blue-100">Get support, information, and guidance</p>
        </button>

        {/* Practitioner Portal */}
        <button
          onClick={() => handleSelect('practitioner')}
          className="flex-1 p-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all duration-200 shadow-lg"
        >
          <div className="text-2xl font-semibold mb-2">I am a Practitioner / Organisation</div>
          <p className="text-emerald-100">Access tools, resources, and directory management</p>
        </button>
      </div>
    </div>
  );
}
