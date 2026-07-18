'use client';

import { useEffect, useMemo, useState } from 'react';
import { useEncryptedJournal } from '@/hooks/useEncryptedJournal';
import { openVault } from '@/lib/encryption';
import { assessPassphrase } from '@/lib/passphrase';

export function JournalTab() {
  const [hasJournalSalt, setHasJournalSalt] = useState(false);
  const [journalPassword, setJournalPassword] = useState('');
  const [isJournalUnlocked, setIsJournalUnlocked] = useState(false);
  const {
    entries: journalEntries,
    addEntry,
    deleteEntry,
  } = useEncryptedJournal(isJournalUnlocked ? journalPassword : null);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState('🥰 Calmed');
  const [journalTags, setJournalTags] = useState('');
  const journalAssessment = useMemo(() => assessPassphrase(journalPassword), [journalPassword]);

  useEffect(() => {
    setHasJournalSalt(!!localStorage.getItem('flw-journal-salt'));
  }, []);

  const handleUnlockJournal = async () => {
    if (!hasJournalSalt && !journalAssessment.acceptable) {
      alert(journalAssessment.message);
      return;
    }
    try {
      const saltKey = 'flw-journal-salt';
      const existingSalt = localStorage.getItem(saltKey) ?? undefined;
      const vault = await openVault('journal', journalPassword, existingSalt);
      localStorage.setItem(saltKey, vault.salt);
      setHasJournalSalt(true);
      setIsJournalUnlocked(true);
    } catch {
      alert('Failed to unlock journal. Check your password.');
    }
  };

  const handleSaveJournal = async () => {
    if (!journalText.trim()) return;
    const tagList = journalTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    await addEntry(journalText, { mood: selectedMood, tags: tagList });
    setJournalText('');
    setJournalTags('');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-heading text-text-primary text-2xl font-extrabold">
          Independent Journal
        </h2>
        <p className="text-text-secondary mt-1 text-sm">
          A secure private space for recording feelings, mental state, and decisions. Protected by
          local AES key credentials.
        </p>
      </div>

      {!isJournalUnlocked ? (
        <div className="glass-panel mx-auto max-w-md space-y-4 p-8 text-center">
          <div className="text-4xl">📝</div>
          <h3 className="text-lg font-bold">
            {hasJournalSalt ? 'Unlock Journal' : 'Create Journal'}
          </h3>
          <p className="text-text-secondary text-xs">
            {hasJournalSalt
              ? 'Enter your secure local password to load and decrypt your personal entries.'
              : 'Create a secure local password to initialize your private journal.'}
          </p>
          <input
            type="password"
            placeholder="Enter Journal Password"
            value={journalPassword}
            onChange={(e) => setJournalPassword(e.target.value)}
            className="bg-bg-secondary w-full rounded-lg border border-white/[0.08] px-4 py-2.5 text-center focus:outline-none"
          />
          {!hasJournalSalt && journalPassword && (
            <div
              className={`rounded p-2 text-xs ${journalAssessment.acceptable ? 'bg-accent-success/15 text-accent-success' : 'bg-accent-warm/15 text-accent-warm'}`}
            >
              {journalAssessment.message}
            </div>
          )}
          <p className="text-text-muted text-[11px] leading-relaxed">
            Your passphrase encrypts everything on this device. We never see it and we can&apos;t
            reset it - if it&apos;s lost, the data is gone. That&apos;s what keeps it yours.
          </p>
          <button
            type="button"
            onClick={handleUnlockJournal}
            disabled={hasJournalSalt ? journalPassword.length < 4 : !journalAssessment.acceptable}
            className="bg-accent-primary text-accent-ink hover:bg-accent-primary/80 w-full rounded-lg py-2.5 font-bold disabled:opacity-50"
          >
            {hasJournalSalt ? 'Unlock' : 'Create Journal'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <div className="glass-panel space-y-4 p-6">
              <h3 className="text-text-muted text-sm font-bold tracking-wider uppercase">
                Create Journal Entry
              </h3>
              <div className="space-y-3">
                <textarea
                  placeholder="How are you feeling today? This is completely private..."
                  rows={5}
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  className="bg-bg-secondary w-full rounded-lg border border-white/[0.08] p-4 text-sm focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="journal-mood-select"
                      className="text-text-secondary block text-xs"
                    >
                      How do you feel?
                    </label>
                    <select
                      id="journal-mood-select"
                      value={selectedMood}
                      onChange={(e) => setSelectedMood(e.target.value)}
                      className="bg-bg-secondary rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="🥰 Calmed">🥰 Calmed</option>
                      <option value="🥺 Overwhelmed">🥺 Overwhelmed</option>
                      <option value="😴 Tired">😴 Tired</option>
                      <option value="💚 Supported">💚 Supported</option>
                    </select>
                  </div>

                  <div className="max-w-[200px] flex-1">
                    <label className="text-text-secondary block text-xs">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="nicu, twins, financial"
                      value={journalTags}
                      onChange={(e) => setJournalTags(e.target.value)}
                      className="bg-bg-secondary w-full rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveJournal}
                  className="bg-accent-primary text-accent-ink hover:bg-accent-primary/80 w-full rounded-lg py-2 font-bold"
                >
                  Save Encrypted Entry
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="glass-panel space-y-2 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary rounded bg-white/10 px-2 py-0.5 text-xs">
                        {entry.mood || '🥰 Calmed'}
                      </span>
                      <span className="text-text-muted text-[10px]">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-accent-danger text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                    {entry.plaintext}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {entry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-accent-secondary bg-accent-secondary/10 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel h-fit space-y-4 p-6">
            <h3 className="text-text-primary text-sm font-bold">
              Independent Client-Side Documenter
            </h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Maintaining a private record is critical during NICU stays and WINZ discussions.
            </p>
            <p className="text-text-secondary text-xs leading-relaxed">
              This journal uses **PBKDF2** key derivation with **600,000 iterations** (OWASP
              recommended standard) to encrypt all inputs. Your password is never saved anywhere.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
