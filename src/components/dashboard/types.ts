export type DashboardTab = 'ai' | 'pathways' | 'vault' | 'journal' | 'directory' | 'timers';

export const NAV_TABS: Array<{ id: DashboardTab; label: string }> = [
 { id: 'ai', label: '💬 AI Assistant' },
 { id: 'pathways', label: '📋 Support Pathways' },
 { id: 'vault', label: '🔒 Taonga Vault' },
 { id: 'journal', label: '📝 Private Journal' },
 { id: 'directory', label: '🗺️ Services Directory' },
 { id: 'timers', label: '⏱️ Care Timers' },
];

export function cleanAsterisks(text: string): string {
 if (!text) return '';
 let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1');
 cleaned = cleaned.replace(/^(\s*)\*\s+/gm, '$1- ');
 cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
 return cleaned;
}
