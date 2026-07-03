import React from 'react';
import Link from 'next/link';

export default async function AdminLayout(
  props: { children: React.ReactNode, params: Promise<{ locale: string }> }
) {
  const params = await props.params;
  const locale = params.locale || 'en';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-indigo-700">Front Line Whānau</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href={`/${locale}/admin`} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Feedback Dashboard
                </Link>
                <Link href={`/${locale}/admin/review`} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Review Queue
                </Link>
                <Link href={`/${locale}/admin/system`} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  System Health
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href={`/${locale}/chat`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Back to App &rarr;</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {props.children}
      </main>
    </div>
  );
}
