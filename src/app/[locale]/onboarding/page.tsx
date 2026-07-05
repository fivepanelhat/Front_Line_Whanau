import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  async function submitName(formData: FormData) {
    "use server";
    
    const firstName = formData.get("firstName")?.toString();
    if (!firstName) return;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Assuming a profiles table exists based on standard Supabase setups
      await supabase.from("profiles").upsert({ 
        id: user.id, 
        first_name: firstName,
        onboarding_completed: true 
      });
      redirect("/");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-bg-primary">
      <div className="w-full max-w-md bg-bg-secondary p-6 sm:p-8 rounded-xl border border-border">
        <h1 className="text-2xl font-bold mb-2 text-text-primary">Welcome to the Beta</h1>
        <p className="text-text-secondary mb-6">Let&apos;s get started. What should we call you?</p>

        <form action={submitName} className="flex flex-col gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="w-full bg-bg-primary text-text-primary border-border rounded-md focus:ring-accent-primary focus:border-accent-primary p-2 border"
              placeholder="e.g. Jane"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent-primary text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
