'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useConsent, useConsentManager } from '@/hooks/useConsent';
import { useEncryptedJournal, type DecryptedJournalEntry } from '@/hooks/useEncryptedJournal';
import { encrypt, decrypt, openVault, encryptWithKey, decryptWithKey, type EncryptedPayload } from '@/lib/encryption';
import { ConsentScope } from '@/lib/consent';
import { assessPassphrase } from '@/lib/passphrase';
import { SERVICES } from '@/data/directory';
import { CATEGORY_LABELS } from '@/data/types';
import { CareTimers } from './CareTimers';
import { useLocale } from 'next-intl';

// Static directory data imported directly from the markdown spec
// Active pathway template checklists
const PATHWAY_DATA = {
  financial: {
    title: '💰 Financial Support Pathway',
    steps: [
      { id: 'fin-1', title: 'Apply for Preterm Baby Payment', desc: 'Contact WINZ (0800 559 009) to apply for Preterm Baby Payment. Need proof of gestational age and bank details.' },
      { id: 'fin-2', title: 'Register Birth & Apply for Best Start', desc: 'Register twins births with DIA. Apply for Best Start tax credit ($73.86/week per child) via IRD.' },
      { id: 'fin-3', title: 'Request Needs Assessment at WINZ', desc: 'Ask for a full needs assessment. Covers Accommodation Supplement, Childcare assistance, and Disability allowance.' },
      { id: 'fin-4', title: 'Apply for Working for Families', desc: 'Contact IRD for Working for Families credits. Twin rates are substantially higher.' }
    ]
  },
  housing: {
    title: '🏠 Housing & Tenancy Pathway',
    steps: [
      { id: 'h-1', title: 'Assess Home for Preterm Baby Safety', desc: 'Check if house meets Healthy Homes standards. Preterm babies are highly vulnerable to cold/damp.' },
      { id: 'h-2', title: 'Request Repairs from Landlord', desc: 'Submit a 14-day notice to remedy in writing for any broken heating, dampness, or drafty windows.' },
      { id: 'h-3', title: 'Apply for Accommodation Supplement', desc: 'If renting or board is high, request Accommodation Supplement via MyMSD.' }
    ]
  },
  mental: {
    title: '💚 Perinatal Wellbeing Pathway',
    steps: [
      { id: 'mh-1', title: 'Set Up Immediate Support Resources', desc: 'Save 1737 (counselling) and 0800 933 922 (PlunketLine) to your mobile contacts.' },
      { id: 'mh-2', title: 'Start a Privacy-First Journal', desc: 'Write down thoughts in the Independent Journal tab to process stress and NICU stay emotions.' },
      { id: 'mh-3', title: 'Connect with Twin Peer Networks', desc: 'Join NZ Multiple Birth Association local parent support network.' }
    ]
  }
};

function cleanAsterisks(text: string): string {
  if (!text) return '';
  // Remove **bold**
  let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1');
  // Convert bullet point style "* " or " * " to "- "
  cleaned = cleaned.replace(/^(\s*)\*\s+/gm, '$1- ');
  // Remove any remaining *italic*
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  return cleaned;
}

export function Dashboard({ onClose, initialTab = 'ai' }: { onClose: () => void; initialTab?: 'ai' | 'pathways' | 'vault' | 'journal' | 'directory' | 'timers' }) {
  const [activeTab, setActiveTab] = useState<'ai' | 'pathways' | 'vault' | 'journal' | 'directory' | 'timers'>(initialTab);
  const [hasVaultSalt, setHasVaultSalt] = useState(false);
  const [hasJournalSalt, setHasJournalSalt] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasVaultSalt(!!localStorage.getItem('flw-vault-salt'));
      setHasJournalSalt(!!localStorage.getItem('flw-journal-salt'));
    }
  }, []);
  
  // Consent Scopes
  const { hasConsent: aiProcessGranted, grantConsent: grantAiProcess, revokeConsent: revokeAiProcess } = useConsent('ai.process');
  const { hasConsent: aiExecuteGranted, grantConsent: grantAiExecute, revokeConsent: revokeAiExecute } = useConsent('ai.execute');

  // --- AI Assistant Tab State ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; agent?: string; sources?: any[]; suggestedActions?: any[] }>>([
    {
      sender: 'agent',
      agent: 'aether-summit',
      text: `Kia ora! Welcome to your private, sovereign support hub dashboard. 💛\n\nI can help you look up NZ health and financial services, design pathways, and draft WINZ or tenancy templates. All interactions are protected under NZ Privacy policies.`,
      suggestedActions: [
        { label: 'Explore Financial Support', type: 'info', target: 'preterm baby payment' },
        { label: 'Get Housing Help', type: 'info', target: 'healthy homes' },
        { label: 'Browse Directory', type: 'navigate_tab', target: 'directory' }
      ]
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    
    // Add user message
    setChatMessages((prev) => [...prev, { sender: 'user', text: queryText }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      // Collect currently granted scopes
      const scopes: ConsentScope[] = [];
      if (aiProcessGranted) scopes.push('ai.process');
      if (aiExecuteGranted) scopes.push('ai.execute');

      const response = await fetch('/api/summit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText,
          scopes,
          locale,
        }),
      });
      if (!response.ok) throw new Error('API call failed');
      const res = await response.json();
      
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: cleanAsterisks(res.content),
          agent: res.agent,
          sources: res.sources,
          suggestedActions: res.suggestedActions
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'agent', agent: 'aether-summit', text: 'Sorry, I encountered an error routing your request. Please try again.' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- Pathways Tab State ---
  const [selectedPathway, setSelectedPathway] = useState<'financial' | 'housing' | 'mental'>('financial');
  const [pathwayProgress, setPathwayProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('flw-pathway-progress');
    if (saved) {
      try { setPathwayProgress(JSON.parse(saved)); } catch (e) { /* ignore parser error */ }
    }
  }, []);

  const toggleStep = (stepId: string) => {
    const updated = { ...pathwayProgress, [stepId]: !pathwayProgress[stepId] };
    setPathwayProgress(updated);
    localStorage.setItem('flw-pathway-progress', JSON.stringify(updated));
  };

  // --- Taonga Vault Tab State ---
  const [vaultPassword, setVaultPassword] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<Array<{ id: string; name: string; description: string; payload: EncryptedPayload; timestamp: string }>>([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [vaultLog, setVaultLog] = useState<string[]>([]);
  const [decryptedFileText, setDecryptedFileText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isVaultUnlocked) {
      const saved = localStorage.getItem('flw-vault-files');
      if (saved) {
        try { setVaultFiles(JSON.parse(saved)); } catch (e) { /* ignore parser error */ }
      }
    }
  }, [isVaultUnlocked]);

  const handleUnlockVault = async () => {
    const assessment = assessPassphrase(vaultPassword);
    if (!hasVaultSalt && !assessment.acceptable) {
      alert(assessment.message);
      return;
    }
    try {
      const saltKey = `flw-vault-salt`;
      const existingSalt = localStorage.getItem(saltKey) ?? undefined;
      const vault = await openVault('vault', vaultPassword, existingSalt);
      localStorage.setItem(saltKey, vault.salt);
      setHasVaultSalt(true);
      setIsVaultUnlocked(true);
      setVaultLog([`[Vault] Unlocked using Web Crypto derived key.`]);
    } catch (err) {
      alert('Failed to unlock vault. Check your passphrase.');
    }
  };

  const handleEncryptFile = async () => {
    if (!newFileName || !newFileContent) return;
    setVaultLog((prev) => [...prev, `[Encrypt] Initializing AES-256-GCM encryption...`]);
    try {
      const saltKey = `flw-vault-salt`;
      const existingSalt = localStorage.getItem(saltKey) ?? undefined;
      const vault = await openVault('vault', vaultPassword, existingSalt);
      const payload = await encryptWithKey(newFileContent, vault);
      const newFile = {
        id: `file-${Date.now()}`,
        name: newFileName,
        description: 'Client-side Encrypted Document',
        payload: {
          ciphertext: payload.ciphertext,
          iv: payload.iv,
          salt: vault.salt
        },
        timestamp: new Date().toLocaleDateString()
      };

      const updated = [...vaultFiles, newFile];
      setVaultFiles(updated);
      localStorage.setItem('flw-vault-files', JSON.stringify(updated));
      
      setVaultLog((prev) => [
        ...prev,
        `[Derive] Derived key from passphrase. Iterations: 600,000.`,
        `[Salt] Generated unique base64 salt: ${vault.salt.substring(0, 10)}...`,
        `[IV] Generated 96-bit base64 IV: ${payload.iv}`,
        `[Ciphertext] Encrypted ciphertext generated: ${payload.ciphertext.substring(0, 16)}...`,
        `[Success] Saved to encrypted local storage successfully.`
      ]);

      setNewFileName('');
      setNewFileContent('');
    } catch (err) {
      setVaultLog((prev) => [...prev, `[Error] Encryption failed: ${err}`]);
    }
  };

  const handleDecryptFile = async (fileId: string, payload: EncryptedPayload) => {
    try {
      const saltKey = `flw-vault-salt`;
      const existingSalt = localStorage.getItem(saltKey) ?? undefined;
      const vault = await openVault('vault', vaultPassword, existingSalt);
      const decrypted = await decryptWithKey({
        ciphertext: payload.ciphertext,
        iv: payload.iv
      }, vault);
      setDecryptedFileText((prev) => ({ ...prev, [fileId]: decrypted }));
      setVaultLog((prev) => [...prev, `[Decrypt] Successfully decrypted file '${fileId}'`]);
    } catch (err) {
      setVaultLog((prev) => [...prev, `[Error] Decryption failed. Incorrect passphrase or corrupted payload.`]);
    }
  };

  const handleDeleteVaultFile = (fileId: string) => {
    const updated = vaultFiles.filter((f) => f.id !== fileId);
    setVaultFiles(updated);
    localStorage.setItem('flw-vault-files', JSON.stringify(updated));
  };

  // --- Independent Journal Tab State ---
  const [journalPassword, setJournalPassword] = useState('');
  const [isJournalUnlocked, setIsJournalUnlocked] = useState(false);
  const { entries: journalEntries, addEntry, deleteEntry } = useEncryptedJournal(isJournalUnlocked ? journalPassword : null);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState('🥰 Calmed');
  const [journalTags, setJournalTags] = useState('');

  const handleUnlockJournal = async () => {
    const assessment = assessPassphrase(journalPassword);
    if (!hasJournalSalt && !assessment.acceptable) {
      alert(assessment.message);
      return;
    }
    try {
      const saltKey = `flw-journal-salt`;
      const existingSalt = localStorage.getItem(saltKey) ?? undefined;
      const vault = await openVault('journal', journalPassword, existingSalt);
      localStorage.setItem(saltKey, vault.salt);
      setHasJournalSalt(true);
      setIsJournalUnlocked(true);
    } catch (err) {
      alert('Failed to unlock journal. Check your password.');
    }
  };

  const handleSaveJournal = async () => {
    if (!journalText.trim()) return;
    const tagList = journalTags.split(',').map((t) => t.trim()).filter(Boolean);
    await addEntry(journalText, { mood: selectedMood, tags: tagList });
    setJournalText('');
    setJournalTags('');
  };

  // --- Services Directory State ---
  const [searchDir, setSearchDir] = useState('');
  const [selectedDirCategory, setSelectedDirCategory] = useState<string>('All');

  const filteredServices = SERVICES.filter((srv) => {
    const matchCat = selectedDirCategory === 'All' || srv.categories.some(c => c.replace('-', ' ').toLowerCase() === selectedDirCategory.toLowerCase());
    const matchSearch = srv.name.toLowerCase().includes(searchDir.toLowerCase()) ||
                        srv.description.toLowerCase().includes(searchDir.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Dashboard Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-white/[0.08] bg-bg-secondary px-6">
        <div className="flex items-center gap-3">
          <span className="text-xl font-heading font-extrabold text-gradient">Whānau Hub</span>
          <span className="rounded bg-accent-secondary/15 px-2.5 py-0.5 text-xs font-semibold text-accent-secondary">Sovereign Space</span>
        </div>
        <button 
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          title="Exit Hub"
        >
          ✕
        </button>
      </header>

      {/* Main Grid: Left Side Navigation, Center Active View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-white/[0.08] bg-bg-secondary/40 p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'ai' ? 'bg-accent-primary text-white' : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
              }`}
            >
              💬 AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('pathways')}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'pathways' ? 'bg-accent-primary text-white' : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
              }`}
            >
              📋 Support Pathways
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'vault' ? 'bg-accent-primary text-white' : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
              }`}
            >
              🔒 Taonga Vault
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'journal' ? 'bg-accent-primary text-white' : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
              }`}
            >
              📝 Private Journal
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'directory' ? 'bg-accent-primary text-white' : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
              }`}
            >
              🗺️ Services Directory
            </button>
            <button
              onClick={() => setActiveTab('timers')}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'timers' ? 'bg-accent-primary text-white' : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
              }`}
            >
              ⏱️ Care Timers
            </button>
          </div>

          {/* Privacy status & Consent overview */}
          <div className="rounded-lg border border-white/[0.08] bg-bg-primary/50 p-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Consent Settings</h4>
            <div className="flex items-center justify-between text-xs">
              <span>AI Processing:</span>
              <button 
                onClick={() => aiProcessGranted ? revokeAiProcess() : grantAiProcess()}
                className={`rounded px-1.5 py-0.5 font-bold ${aiProcessGranted ? 'bg-accent-success/20 text-accent-success' : 'bg-white/10 text-text-secondary'}`}
              >
                {aiProcessGranted ? 'Active' : 'Disabled'}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Form Generation:</span>
              <button 
                onClick={() => aiExecuteGranted ? revokeAiExecute() : grantAiExecute()}
                className={`rounded px-1.5 py-0.5 font-bold ${aiExecuteGranted ? 'bg-accent-success/20 text-accent-success' : 'bg-white/10 text-text-secondary'}`}
              >
                {aiExecuteGranted ? 'Active' : 'Disabled'}
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1 pt-1 border-t border-white/[0.08]">
              Consent Log: a private log only you can verify with your passphrase — kept on your device.
            </p>
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-subtle">
          
          {/* TAB 1: AI Assistant */}
          {activeTab === 'ai' && (
            <div className="mx-auto max-w-3xl flex flex-col h-full">
              {/* Message List */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-6">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-xl p-4 leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-accent-primary text-white' 
                        : 'border border-white/[0.08] bg-bg-secondary'
                    }`}>
                      {msg.agent && (
                        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-accent-secondary">
                          {msg.agent.replace('-', ' ')}
                        </div>
                      )}
                      <p className="whitespace-pre-line text-sm">{msg.text}</p>

                      {/* Source references */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 border-t border-white/[0.08] pt-2">
                          <span className="text-[11px] font-bold text-text-muted uppercase">Sources:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {msg.sources.map((s, idx) => (
                              <a 
                                key={idx} 
                                href={s.reference} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[11px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-accent-secondary flex items-center gap-1"
                              >
                                {s.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Suggested actions */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (action.type === 'navigate_tab') {
                                setActiveTab(action.target);
                              } else if (action.type === 'info' || action.type === 'form') {
                                handleSendQuery(action.target);
                              } else if (action.type === 'call') {
                                alert(`Calling ${action.target} (Simulated)`);
                              } else if (action.type === 'navigate') {
                                window.open(action.target, '_blank');
                              }
                            }}
                            className="rounded-full border border-accent-secondary/20 bg-accent-secondary/5 px-3 py-1 text-xs text-accent-secondary hover:bg-accent-secondary hover:text-white transition-all"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary italic">
                    <span className="animate-pulse">●</span> Orchestrator matching inputs...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Consent check banners */}
              {(!aiProcessGranted || !aiExecuteGranted) && (
                <div className="mb-4 rounded-xl border border-accent-warm/20 bg-accent-warm/5 p-4 flex items-center justify-between gap-4">
                  <div className="text-xs text-text-secondary">
                    💡 Informed Consent Notice: Some AI pathways or document generation capabilities require active consent scopes for local processing.
                  </div>
                  <button 
                    onClick={() => {
                      if (!aiProcessGranted) grantAiProcess();
                      if (!aiExecuteGranted) grantAiExecute();
                    }}
                    className="rounded bg-accent-warm/15 px-3 py-1.5 text-xs font-bold text-accent-warm hover:bg-accent-warm/25"
                  >
                    Quick Enable All
                  </button>
                </div>
              )}

              {/* Input field */}
              <div className="border-t border-white/[0.08] pt-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendQuery(chatInput);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask about financial support, healthy homes, WINZ/IRD applications, or local services..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-bg-secondary px-4 py-3 text-sm focus:outline-none focus:border-accent-primary"
                  />
                  <button 
                    type="submit"
                    className="rounded-lg bg-accent-primary px-6 py-3 font-semibold text-white hover:bg-accent-primary/80 transition-colors"
                  >
                    Send
                  </button>
                </form>
                <p className="mt-3 text-center text-[11px] text-text-muted/80">
                  <span className="font-semibold text-accent-warm">Disclaimer:</span> Whilst our AI is a trained guidance tool that navigates this space to tautoko whānau, remember to practice discernment and due diligence. It is <strong>not a registered medical, financial or cultural advisor</strong>. Always consult a registered practitioner for professional advice.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Support Pathways */}
          {activeTab === 'pathways' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-text-primary">Personalised Pathways</h2>
                <p className="text-sm text-text-secondary mt-1">Select and track your support journey checklists. All checklist updates are saved directly to your local browser storage.</p>
              </div>

              {/* Pathway selectors */}
              <div className="flex gap-2 border-b border-white/[0.08] pb-4">
                <button
                  onClick={() => setSelectedPathway('financial')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    selectedPathway === 'financial' ? 'bg-accent-secondary text-white' : 'bg-white/5 hover:bg-white/10 text-text-secondary'
                  }`}
                >
                  💰 Financial Entitlements
                </button>
                <button
                  onClick={() => setSelectedPathway('housing')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    selectedPathway === 'housing' ? 'bg-accent-secondary text-white' : 'bg-white/5 hover:bg-white/10 text-text-secondary'
                  }`}
                >
                  🏠 Rental & Tenancy
                </button>
                <button
                  onClick={() => setSelectedPathway('mental')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    selectedPathway === 'mental' ? 'bg-accent-secondary text-white' : 'bg-white/5 hover:bg-white/10 text-text-secondary'
                  }`}
                >
                  💚 Perinatal Wellbeing
                </button>
              </div>

              {/* Checklist rendering */}
              <div className="glass-panel p-6 space-y-6">
                <h3 className="text-lg font-bold text-text-primary">{PATHWAY_DATA[selectedPathway].title}</h3>
                <div className="space-y-4">
                  {PATHWAY_DATA[selectedPathway].steps.map((step, idx) => {
                    const checked = !!pathwayProgress[step.id];
                    return (
                      <div 
                        key={step.id} 
                        onClick={() => toggleStep(step.id)}
                        className={`flex gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                          checked 
                            ? 'border-accent-success/20 bg-accent-success/[0.03]' 
                            : 'border-white/[0.08] hover:border-white/20 bg-bg-secondary/40'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={checked} 
                            onChange={() => {}} // toggled on card click
                            className="h-5 w-5 accent-accent-success rounded cursor-pointer"
                            aria-label={`Mark step ${idx + 1} as completed`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${checked ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                            Step {idx + 1}: {step.title}
                          </h4>
                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Taonga Vault */}
          {activeTab === 'vault' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-text-primary">Taonga Vault</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Secure multi-modal document storage. Files are encrypted client-side using **AES-256-GCM** before saving to local storage. Plaintext files never reach the cloud.
                </p>
              </div>

              {!isVaultUnlocked ? (
                <div className="glass-panel p-8 max-w-md mx-auto text-center space-y-4">
                  <div className="text-4xl">🔒</div>
                  <h3 className="text-lg font-bold">{hasVaultSalt ? 'Unlock Taonga Vault' : 'Create Taonga Vault'}</h3>
                  <p className="text-xs text-text-secondary">
                    {hasVaultSalt 
                      ? 'Enter your secure local passphrase to unlock your documents.'
                      : 'Create a secure local passphrase to initialize your sovereign vault.'}
                  </p>
                  <input
                    type="password"
                    placeholder="Enter Passphrase"
                    value={vaultPassword}
                    onChange={(e) => setVaultPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary px-4 py-2.5 text-center focus:outline-none"
                  />
                  {!hasVaultSalt && vaultPassword && (
                    <div className={`text-xs p-2 rounded ${assessPassphrase(vaultPassword).acceptable ? 'bg-accent-success/15 text-accent-success' : 'bg-accent-warm/15 text-accent-warm'}`}>
                      {assessPassphrase(vaultPassword).message}
                    </div>
                  )}
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Your passphrase encrypts everything on this device. We never see it and we
                    can't reset it — if it's lost, the data is gone. That's what keeps it yours.
                  </p>
                  <button
                    onClick={handleUnlockVault}
                    disabled={hasVaultSalt ? vaultPassword.length < 4 : !assessPassphrase(vaultPassword).acceptable}
                    className="w-full rounded-lg bg-accent-primary py-2.5 font-bold text-white hover:bg-accent-primary/80 disabled:opacity-50"
                  >
                    {hasVaultSalt ? 'Unlock' : 'Create Vault'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* File Encrypter Form */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="glass-panel p-6 space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Encrypt New Document</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Document Name (e.g. WINZ-Preterm-Application.txt)"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary px-4 py-2 text-sm focus:outline-none"
                        />
                        <textarea
                          placeholder="Paste document details, sensitive notes, birth records or WINZ correspondence..."
                          rows={6}
                          value={newFileContent}
                          onChange={(e) => setNewFileContent(e.target.value)}
                          className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary p-4 text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleEncryptFile}
                          className="w-full rounded-lg bg-accent-primary py-2 font-bold text-white hover:bg-accent-primary/80"
                        >
                          Encrypt & Save Locally
                        </button>
                      </div>
                    </div>

                    {/* Saved Documents */}
                    <div className="glass-panel p-6 space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Encrypted Documents in Vault</h3>
                      {vaultFiles.length === 0 ? (
                        <p className="text-xs text-text-secondary italic">No documents saved in this vault yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {vaultFiles.map((file) => (
                            <div key={file.id} className="border border-white/[0.08] rounded-lg p-4 bg-bg-secondary/40 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-sm text-text-primary">{file.name}</h4>
                                  <p className="text-[10px] text-text-muted">Added {file.timestamp}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDecryptFile(file.id, file.payload)}
                                    className="rounded bg-accent-secondary/15 px-2.5 py-1 text-xs font-semibold text-accent-secondary hover:bg-accent-secondary/25"
                                  >
                                    Decrypt
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVaultFile(file.id)}
                                    className="rounded bg-accent-danger/15 px-2.5 py-1 text-xs font-semibold text-accent-danger hover:bg-accent-danger/25"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              {decryptedFileText[file.id] && (
                                <div className="rounded border border-accent-success/20 bg-accent-success/[0.03] p-3 text-xs mt-2">
                                  <span className="font-bold text-accent-success uppercase text-[10px]">Plaintext Decrypted:</span>
                                  <p className="mt-1 whitespace-pre-wrap text-text-primary">{decryptedFileText[file.id]}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cryptographic Verification Logs */}
                  <div className="space-y-4">
                    <div className="glass-panel p-6 bg-slate-900/80 border border-indigo-500/20 rounded-xl space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-accent-secondary">Sovereign Crypto Logs</h3>
                      <div className="font-mono text-[10px] text-text-secondary h-96 overflow-y-auto space-y-2 pr-1">
                        {vaultLog.map((log, idx) => (
                          <div key={idx} className="border-b border-white/5 pb-1">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Independent Journal */}
          {activeTab === 'journal' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-text-primary">Independent Journal</h2>
                <p className="text-sm text-text-secondary mt-1">A secure private space for recording feelings, mental state, and decisions. Protected by local AES key credentials.</p>
              </div>

              {!isJournalUnlocked ? (
                <div className="glass-panel p-8 max-w-md mx-auto text-center space-y-4">
                  <div className="text-4xl">📝</div>
                  <h3 className="text-lg font-bold">{hasJournalSalt ? 'Unlock Journal' : 'Create Journal'}</h3>
                  <p className="text-xs text-text-secondary">
                    {hasJournalSalt 
                      ? 'Enter your secure local password to load and decrypt your personal entries.'
                      : 'Create a secure local password to initialize your private journal.'}
                  </p>
                  <input
                    type="password"
                    placeholder="Enter Journal Password"
                    value={journalPassword}
                    onChange={(e) => setJournalPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary px-4 py-2.5 text-center focus:outline-none"
                  />
                  {!hasJournalSalt && journalPassword && (
                    <div className={`text-xs p-2 rounded ${assessPassphrase(journalPassword).acceptable ? 'bg-accent-success/15 text-accent-success' : 'bg-accent-warm/15 text-accent-warm'}`}>
                      {assessPassphrase(journalPassword).message}
                    </div>
                  )}
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Your passphrase encrypts everything on this device. We never see it and we
                    can't reset it — if it's lost, the data is gone. That's what keeps it yours.
                  </p>
                  <button
                    onClick={handleUnlockJournal}
                    disabled={hasJournalSalt ? journalPassword.length < 4 : !assessPassphrase(journalPassword).acceptable}
                    className="w-full rounded-lg bg-accent-primary py-2.5 font-bold text-white hover:bg-accent-primary/80 disabled:opacity-50"
                  >
                    {hasJournalSalt ? 'Unlock' : 'Create Journal'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Journal Input Editor */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="glass-panel p-6 space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Create Journal Entry</h3>
                      <div className="space-y-3">
                        <textarea
                          placeholder="How are you feeling today? This is completely private..."
                          rows={5}
                          value={journalText}
                          onChange={(e) => setJournalText(e.target.value)}
                          className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary p-4 text-sm focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-4 justify-between items-center">
                          <div className="space-y-1">
                            <label htmlFor="journal-mood-select" className="text-xs text-text-secondary block">How do you feel?</label>
                            <select
                              id="journal-mood-select"
                              value={selectedMood}
                              onChange={(e) => setSelectedMood(e.target.value)}
                              className="rounded-lg bg-bg-secondary border border-white/[0.08] px-3 py-1.5 text-xs focus:outline-none"
                            >
                              <option value="🥰 Calmed">🥰 Calmed</option>
                              <option value="🥺 Overwhelmed">🥺 Overwhelmed</option>
                              <option value="😴 Tired">😴 Tired</option>
                              <option value="💚 Supported">💚 Supported</option>
                            </select>
                          </div>

                          <div className="flex-1 max-w-[200px]">
                            <label className="text-xs text-text-secondary block">Tags (comma-separated)</label>
                            <input
                              type="text"
                              placeholder="nicu, twins, financial"
                              value={journalTags}
                              onChange={(e) => setJournalTags(e.target.value)}
                              className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleSaveJournal}
                          className="w-full rounded-lg bg-accent-primary py-2 font-bold text-white hover:bg-accent-primary/80"
                        >
                          Save Encrypted Entry
                        </button>
                      </div>
                    </div>

                    {/* Journal Logs list */}
                    <div className="space-y-3">
                      {journalEntries.map((entry) => (
                        <div key={entry.id} className="glass-panel p-5 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2 items-center">
                              <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-text-secondary">{entry.mood || '🥰 Calmed'}</span>
                              <span className="text-[10px] text-text-muted">{new Date(entry.createdAt).toLocaleDateString()}</span>
                            </div>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="text-xs text-accent-danger hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                          <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap">{entry.plaintext}</p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap pt-1">
                              {entry.tags.map((tag, idx) => (
                                <span key={idx} className="text-[9px] font-bold text-accent-secondary bg-accent-secondary/10 px-2 py-0.5 rounded-full uppercase">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Info card */}
                  <div className="glass-panel p-6 space-y-4 h-fit">
                    <h3 className="text-sm font-bold text-text-primary">Independent Client-Side Documenter</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Maintaining a private record is critical during NICU stays and WINZ discussions. 
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      This journal uses **PBKDF2** key derivation with **600,000 iterations** (OWASP recommended standard) to encrypt all inputs. Your password is never saved anywhere.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Services Directory */}
          {activeTab === 'directory' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-text-primary">Services Directory</h2>
                  <p className="text-sm text-text-secondary mt-1">Find local Taranaki and national support agencies. No usage metrics are tracked.</p>
                </div>
              </div>

              {/* Filters / Search */}
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search agency by name, phone or description..."
                  value={searchDir}
                  onChange={(e) => setSearchDir(e.target.value)}
                  className="flex-1 min-w-[240px] rounded-lg border border-white/[0.08] bg-bg-secondary px-4 py-2.5 text-sm focus:outline-none"
                />

                <select
                  value={selectedDirCategory}
                  onChange={(e) => setSelectedDirCategory(e.target.value)}
                  className="rounded-lg bg-bg-secondary border border-white/[0.08] px-4 py-2.5 text-sm focus:outline-none"
                  aria-label="Filter by category"
                >
                  <option value="All">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Services List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map((srv, idx) => (
                  <div key={idx} className="glass-panel p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm text-text-primary">{srv.name}</h3>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold bg-accent-secondary/15 text-accent-secondary rounded px-2 py-0.5 whitespace-nowrap">
                          {CATEGORY_LABELS[srv.categories[0]] || srv.categories[0]}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed">{srv.description}</p>
                      {srv.address && (
                        <p className="text-[11px] text-text-muted mt-2">📍 {srv.address}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-2">
                      <span className="text-xs font-bold text-text-secondary">
                        {srv.contact.includes('@') ? '✉️ ' : '📞 '}
                        {srv.contact}
                      </span>
                      <div className="flex gap-2">
                        {srv.contact && !srv.contact.includes('@') && (
                          <a 
                            href={`tel:${srv.contact.replace(/[^0-9]/g, '')}`}
                            className="text-xs font-semibold text-accent-secondary hover:underline"
                          >
                            Call
                          </a>
                        )}
                        {srv.url && (
                          <a 
                            href={srv.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-accent-secondary hover:underline"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Care Timers */}
          {activeTab === 'timers' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <CareTimers />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
