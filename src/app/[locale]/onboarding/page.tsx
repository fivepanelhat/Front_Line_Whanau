import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingPage() {
  async function submitName(formData: FormData) {
    'use server';

    const firstName = formData.get('firstName')?.toString();
    if (!firstName) return;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Assuming a profiles table exists based on standard Supabase setups
      await supabase.from('profiles').upsert({
        id: user.id,
        first_name: firstName,
        onboarding_completed: true,
      });
      redirect('/');
    }
  }

  return (
    <div className="bg-bg-primary flex min-h-screen flex-col items-center justify-center p-4">
      <div className="bg-bg-secondary border-border w-full max-w-md rounded-xl border p-6 sm:p-8">
        <h1 className="text-text-primary mb-2 text-2xl font-bold">Welcome to the Beta</h1>
        <p className="text-text-secondary mb-6">Let&apos;s get started. What should we call you?</p>

        <form action={submitName} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="text-text-secondary mb-1 block text-sm font-medium"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="bg-bg-primary text-text-primary border-border focus:ring-accent-primary focus:border-accent-primary w-full rounded-md border p-2"
              placeholder="e.g. Jane"
            />
          </div>
          <button
            type="submit"
            className="bg-accent-primary text-accent-ink w-full rounded-lg py-2 font-semibold transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
