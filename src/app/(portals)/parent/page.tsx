'use client';

import { useRoleAwareAgent } from '@/hooks/useRoleAwareAgent';

export default function ParentPortal() {
  const { ask } = useRoleAwareAgent();

  const handleAsk = async () => {
    console.log("Asking AI...");
    const response = await ask("What financial support is available?");
    console.log("AI Response:", response);
    alert(response);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-700">Parent & Whānau Portal</h1>
        <p className="text-gray-600 mt-2">Support and information for families of preterm twins</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Financial Support</h3>
          <p className="text-sm text-gray-600">Preterm Baby Payment, Best Start, and more.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-start">
          <h3 className="font-semibold mb-2">Ask the AI Assistant</h3>
          <p className="text-sm text-gray-600 mb-4">Get clear answers tailored for parents.</p>
          <button 
            onClick={handleAsk}
            className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ask AI Assistant (Test)
          </button>
        </div>
      </div>
    </div>
  );
}
