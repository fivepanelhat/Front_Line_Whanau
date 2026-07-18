/**
 * Consent Manager - Granular Data Consent
 *
 * Manages informed consent for all data operations.
 * Consent is granular (per scope), auditable, and revocable.
 *
 * Persists to localStorage with a key-chained verifiable audit trail.
 */

import { bufferToHex } from './encryption';

// -- Types ----------------------------------------------------

export type ConsentScope =
  | 'journal.read'
  | 'journal.write'
  | 'journal.sync'
  | 'vault.store'
  | 'vault.sync'
  | 'ai.process'
  | 'ai.execute'
  | 'directory.share';

export interface ConsentRecord {
  scope: ConsentScope;
  granted: boolean;
  timestamp: string;
  prevHash: string;
  /** HMAC of prevHash + scope + granted + timestamp */
  hash: string;
}

export interface ConsentState {
  version: number;
  consents: Record<ConsentScope, boolean>;
  auditTrail: ConsentRecord[];
}

// -- Default State --------------------------------------------

const DEFAULT_CONSENTS: Record<ConsentScope, boolean> = {
  'journal.read': true, // Local-only, granted by default
  'journal.write': true, // Local-only, granted by default
  'journal.sync': false, // Server sync - requires explicit consent
  'vault.store': true, // Local-only, granted by default
  'vault.sync': false, // Server sync - requires explicit consent
  'ai.process': false, // AI analysis - requires explicit consent
  'ai.execute': false, // AI actions - requires explicit consent
  'directory.share': false, // Sharing - requires explicit consent
};

const STORAGE_KEY = 'flw-consent-state';

// -- Consent Scope Metadata -----------------------------------

export const CONSENT_DESCRIPTIONS: Record<
  ConsentScope,
  {
    title: string;
    description: string;
    dataAccessed: string;
    riskLevel: 'low' | 'medium' | 'high';
  }
> = {
  'journal.read': {
    title: 'Read Your Journal',
    description: 'View your private journal entries stored on this device.',
    dataAccessed: 'Journal entries (local only)',
    riskLevel: 'low',
  },
  'journal.write': {
    title: 'Write to Your Journal',
    description: 'Create and edit journal entries, stored encrypted on this device.',
    dataAccessed: 'Journal content you create',
    riskLevel: 'low',
  },
  'journal.sync': {
    title: 'Sync Journal to Server',
    description:
      'Back up your encrypted journal entries to the server. Data remains encrypted - the server cannot read your entries.',
    dataAccessed: 'Encrypted journal data',
    riskLevel: 'medium',
  },
  'vault.store': {
    title: 'Store Documents Locally',
    description: 'Save documents encrypted on this device in your Taonga Vault.',
    dataAccessed: 'Documents you upload',
    riskLevel: 'low',
  },
  'vault.sync': {
    title: 'Sync Vault to Server',
    description: 'Back up your encrypted documents to the server for access on other devices.',
    dataAccessed: 'Encrypted document data',
    riskLevel: 'medium',
  },
  'ai.process': {
    title: 'AI Analysis',
    description:
      'Allow the AI assistant to analyse information you share to provide personalised guidance. Your data is processed locally where possible.',
    dataAccessed: 'Conversation content and context',
    riskLevel: 'medium',
  },
  'ai.execute': {
    title: 'AI-Assisted Actions',
    description:
      'Allow the AI to prepare forms, draft documents, and suggest actions on your behalf. You always review before anything is finalised.',
    dataAccessed: 'Personal details you provide for forms',
    riskLevel: 'high',
  },
  'directory.share': {
    title: 'Share Directory Bookmarks',
    description: 'Share your saved services and bookmarks with whanau members.',
    dataAccessed: 'Your directory bookmarks',
    riskLevel: 'low',
  },
};

// -- HMAC Helpers ---------------------------------------------

async function hmac(key: CryptoKey, msg: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return bufferToHex(sig);
}

/** Each record commits to the previous one -> tampering breaks the chain. */
async function createAuditRecord(
  hmacKey: CryptoKey,
  scope: ConsentScope,
  granted: boolean,
  prevHash: string,
): Promise<ConsentRecord> {
  const timestamp = new Date().toISOString();
  const hash = await hmac(hmacKey, `${prevHash}:${scope}:${granted}:${timestamp}`);
  return { scope, granted, timestamp, prevHash, hash };
}

/** Verify the whole chain. Honest guarantee: detects edits to anyone holding the key. */
export async function verifyAuditTrail(
  hmacKey: CryptoKey,
  trail: ConsentRecord[],
): Promise<boolean> {
  let prev = 'GENESIS';
  for (const r of trail) {
    const expect = await hmac(hmacKey, `${prev}:${r.scope}:${r.granted}:${r.timestamp}`);
    if (expect !== r.hash || r.prevHash !== prev) return false;
    prev = r.hash;
  }
  return true;
}

// -- Consent Manager ------------------------------------------

export class ConsentManager {
  private state: ConsentState;

  constructor() {
    this.state = this.loadState();
  }

  /**
   * Check if consent has been granted for a scope.
   */
  hasConsent(scope: ConsentScope): boolean {
    return this.state.consents[scope] ?? false;
  }

  /**
   * Get all currently granted scopes.
   */
  getGrantedScopes(): ConsentScope[] {
    return Object.entries(this.state.consents)
      .filter(([, granted]) => granted)
      .map(([scope]) => scope as ConsentScope);
  }

  /**
   * Grant consent for a scope and record in audit trail.
   */
  async grantConsent(scope: ConsentScope, hmacKey?: CryptoKey): Promise<void> {
    this.state.consents[scope] = true;

    const prev = this.state.auditTrail[this.state.auditTrail.length - 1]?.hash ?? 'GENESIS';
    const record = hmacKey
      ? await createAuditRecord(hmacKey, scope, true, prev)
      : {
          scope,
          granted: true,
          timestamp: new Date().toISOString(),
          prevHash: prev,
          hash: 'UNVERIFIED',
        };

    this.state.auditTrail.push(record);
    this.saveState();
  }

  /**
   * Revoke consent for a scope and record in audit trail.
   */
  async revokeConsent(scope: ConsentScope, hmacKey?: CryptoKey): Promise<void> {
    this.state.consents[scope] = false;

    const prev = this.state.auditTrail[this.state.auditTrail.length - 1]?.hash ?? 'GENESIS';
    const record = hmacKey
      ? await createAuditRecord(hmacKey, scope, false, prev)
      : {
          scope,
          granted: false,
          timestamp: new Date().toISOString(),
          prevHash: prev,
          hash: 'UNVERIFIED',
        };

    this.state.auditTrail.push(record);
    this.saveState();
  }

  /**
   * Get the full audit trail for transparency.
   */
  getAuditTrail(): ConsentRecord[] {
    return [...this.state.auditTrail];
  }

  /**
   * Get the audit trail for a specific scope.
   */
  getScopeHistory(scope: ConsentScope): ConsentRecord[] {
    return this.state.auditTrail.filter((r) => r.scope === scope);
  }

  /**
   * Reset all consents to defaults. Records the reset in audit trail.
   */
  async resetToDefaults(hmacKey?: CryptoKey): Promise<void> {
    for (const scope of Object.keys(this.state.consents) as ConsentScope[]) {
      if (this.state.consents[scope] !== DEFAULT_CONSENTS[scope]) {
        const prev = this.state.auditTrail[this.state.auditTrail.length - 1]?.hash ?? 'GENESIS';
        const record = hmacKey
          ? await createAuditRecord(hmacKey, scope, DEFAULT_CONSENTS[scope], prev)
          : {
              scope,
              granted: DEFAULT_CONSENTS[scope],
              timestamp: new Date().toISOString(),
              prevHash: prev,
              hash: 'UNVERIFIED',
            };
        this.state.auditTrail.push(record);
      }
    }

    this.state.consents = { ...DEFAULT_CONSENTS };
    this.saveState();
  }

  /**
   * Export consent state for portability.
   */
  exportState(): string {
    return JSON.stringify(this.state, null, 2);
  }

  // -- Private Helpers --------------------------------------

  private loadState(): ConsentState {
    if (typeof window === 'undefined') {
      return this.defaultState();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ConsentState;
      }
    } catch {
      // localStorage unavailable or corrupted - use defaults
    }

    return this.defaultState();
  }

  private saveState(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // localStorage full or unavailable
    }
  }

  private defaultState(): ConsentState {
    return {
      version: 1,
      consents: { ...DEFAULT_CONSENTS },
      auditTrail: [],
    };
  }
}
