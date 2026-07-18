import React from 'react';
import Link from 'next/link';

export default async function AdminLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale || 'en';

  return (
    <div className="bg-bg-primary flex min-h-screen flex-col">
      <nav className="bg-bg-secondary/80 border-border border-b backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="flex h-14 justify-between sm:h-16">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-accent-primary hidden text-xl font-bold whitespace-nowrap sm:inline">
                Admin
              </span>
              <div className="flex space-x-4 sm:space-x-8">
                <Link
                  href={`/${locale}/admin`}
                  className="text-text-secondary hover:text-text-primary hover:border-accent-primary inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium whitespace-nowrap"
                >
                  Feedback
                </Link>
                <Link
                  href={`/${locale}/admin/review`}
                  className="text-text-secondary hover:text-text-primary hover:border-accent-primary inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium whitespace-nowrap"
                >
                  Review
                </Link>
                <Link
                  href={`/${locale}/admin/system`}
                  className="text-text-secondary hover:text-text-primary hover:border-accent-primary inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium whitespace-nowrap"
                >
                  System
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href={`/${locale}`}
                className="text-accent-primary text-sm font-medium whitespace-nowrap hover:opacity-80"
              >
                Back &rarr;
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{props.children}</main>
    </div>
  );
}
