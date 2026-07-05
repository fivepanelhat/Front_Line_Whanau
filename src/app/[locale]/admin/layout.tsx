import React from 'react';
import Link from 'next/link';

export default async function AdminLayout(
  props: { children: React.ReactNode, params: Promise<{ locale: string }> }
) {
  const params = await props.params;
  const locale = params.locale || 'en';

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="bg-bg-secondary/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="hidden sm:inline font-bold text-xl text-accent-primary whitespace-nowrap">Admin</span>
              <div className="flex space-x-4 sm:space-x-8">
                <Link href={`/${locale}/admin`} className="border-transparent text-text-secondary hover:text-text-primary hover:border-accent-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap">
                  Feedback
                </Link>
                <Link href={`/${locale}/admin/review`} className="border-transparent text-text-secondary hover:text-text-primary hover:border-accent-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap">
                  Review
                </Link>
                <Link href={`/${locale}/admin/system`} className="border-transparent text-text-secondary hover:text-text-primary hover:border-accent-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap">
                  System
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href={`/${locale}`} className="text-sm font-medium text-accent-primary hover:opacity-80 whitespace-nowrap">Back &rarr;</Link>
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
