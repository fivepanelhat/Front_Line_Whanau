'use client';

import { useState, useEffect } from 'react';

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [gestationalAge, setGestationalAge] = useState('');
  const [hospital, setHospital] = useState('');

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('front_line_onboarded');
    if (!hasOnboarded) {
      setIsOpen(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleComplete = async () => {
    if (!agreed) return;
    localStorage.setItem('front_line_onboarded', 'true');
    setIsOpen(false);
    
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'beta_consent_given',
          path: window.location.pathname,
          metadata: { 
            agreed: true,
            gestationalAge,
            hospital
          }
        })
      });
    } catch (e) {
      console.error('Failed to log beta consent', e);
    }
    
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="space-y-4 mt-4 animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to the Beta 👋</h2>
            <p className="text-gray-600 text-lg">
              You are among the first to test the <strong>Front Line Whānau AI</strong>, an intelligent assistant specifically designed to help Aotearoa parents navigate the NICU journey.
            </p>
            <p className="text-gray-600 text-lg">
              We are so grateful for your help in shaping this tool.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="mt-6 w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
            >
              Next: What to expect
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-gray-900">Setting Expectations ⚖️</h2>
            <div className="space-y-3 mt-4 text-gray-700">
              <div className="flex gap-3 items-start bg-blue-50 p-4 rounded-lg">
                <span className="text-xl">✅</span>
                <p><strong>It CAN</strong> help you find local resources, translate complex medical jargon into plain English, and draft emails to hospitals or MSD.</p>
              </div>
              <div className="flex gap-3 items-start bg-red-50 p-4 rounded-lg">
                <span className="text-xl">❌</span>
                <p><strong>It CANNOT</strong> provide medical diagnoses, override your doctor's advice, or access your official hospital health records.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setStep(1)}
                className="w-1/3 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="w-2/3 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
              >
                Next: Your Context
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 mt-4 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-gray-900">Your Context (Optional) 🍼</h2>
            <p className="text-gray-600">
              Sharing a bit about your journey helps our AI agents give you more relevant and localized advice.
            </p>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baby's Gestational Age</label>
                <select 
                  value={gestationalAge}
                  onChange={(e) => setGestationalAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="" disabled>Select Gestational Age...</option>
                  <option value="< 24 weeks">Under 24 weeks (Extremely Preterm)</option>
                  <option value="24-27 weeks">24 - 27 weeks (Extremely Preterm)</option>
                  <option value="28-31 weeks">28 - 31 weeks (Very Preterm)</option>
                  <option value="32-36 weeks">32 - 36 weeks (Moderate to Late Preterm)</option>
                  <option value="37+ weeks">37+ weeks (Term)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / NICU Location</label>
                <select 
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="" disabled>Select Hospital...</option>
                  <option value="Auckland City Hospital (ACH)">Auckland City Hospital (ACH)</option>
                  <option value="Middlemore Hospital">Middlemore Hospital</option>
                  <option value="Waitakere Hospital">Waitakere Hospital</option>
                  <option value="Waikato Hospital">Waikato Hospital</option>
                  <option value="Wellington Regional Hospital">Wellington Regional Hospital</option>
                  <option value="Christchurch Women's Hospital">Christchurch Women's Hospital</option>
                  <option value="Dunedin Hospital">Dunedin Hospital</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setStep(2)}
                className="w-1/3 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(4)}
                className="w-2/3 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
              >
                Next: Data & Privacy
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 mt-4 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-gray-900">Data & Consent 🔒</h2>
            <p className="text-gray-600">
              Because this is a beta, our clinical moderation team will be reading some of the transcripts to ensure the AI is giving safe, accurate advice.
            </p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl my-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm text-amber-900 font-medium">
                  I understand this is an experimental AI, not a doctor. I consent to my anonymized chat data being reviewed by the Front Line Whānau clinical team for safety improvements.
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep(3)}
                className="w-1/3 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                disabled={!agreed}
                className="w-2/3 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
              >
                Enter the Beta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
