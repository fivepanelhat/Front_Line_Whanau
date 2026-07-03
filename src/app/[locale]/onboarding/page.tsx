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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Welcome to the Beta</h1>
        <p className="text-gray-600 mb-6">Let's get started. What should we call you?</p>
        
        <form action={submitName} className="flex flex-col gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              placeholder="e.g. Jane"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
