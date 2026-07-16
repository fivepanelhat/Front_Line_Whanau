/**
 * Generates docs/TARANAKI-DIRECTORY.md from the canonical data in
 * src/data/directory. The markdown becomes a read-only VIEW of the data -
 * it can no longer drift from what the app uses.
 *
 * Run: npx tsx scripts/generate-directory-doc.ts
 * Add to package.json: "docs:directory": "tsx scripts/generate-directory-doc.ts"
 * Optionally enforce in CI so a hand-edited doc fails the build.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { groupByCategory } from '../src/data/directory';
import type { Service } from '../src/data/directory';

function renderService(s: Service, label: string): string {
 const lines = [`### ${s.name} (${label})`, ''];
 lines.push(`- **Region**: ${s.region}`);
 if (s.address) lines.push(`- **Address**: ${s.address}`);
 lines.push(`- **Contact**: \`${s.contact}\`${s.altContact ? ` or \`${s.altContact}\`` : ''}`);
 if (s.hours) lines.push(`- **Hours**: ${s.hours}`);
 if (s.url) lines.push(`- **URL**: <${s.url}>`);
 if (s.crisis) lines.push(`- **Crisis line**: yes`);
 lines.push(`- **Description**: ${s.description}`);
 lines.push(`- **Last verified**: ${s.lastVerified}`);
 lines.push('');
 return lines.join('\n');
}

function build(): string {
 const groups = groupByCategory();
 const today = new Date().toISOString().slice(0, 10);

 const parts: string[] = [
 '<!-- GENERATED FILE - do not edit by hand.',
 ' Edit `src/data/services.ts` and run: `npx tsx scripts/generate-directory-doc.ts` -->',
 '',
 '# Taranaki Services Directory',
 '',
 'Services for whanau of preterm babies in Taranaki and nationally. This page is',
 'generated from the app's canonical data, so it always matches what families see.',
 '',
 '> Benefit and payment amounts are intentionally **not** listed here. For current',
 '> figures see the in-app entitlements or the official IRD / Work and Income sites.',
 '',
 '---',
 '',
 ];

 for (const [label, services] of Object.entries(groups)) {
 parts.push(`## ${label}`, '');
 for (const s of services) parts.push(renderService(s, label));
 parts.push('---', '');
 }

 parts.push(
 '*Maintained by the Front Line Whanau project team. To fix or add a service,',
 'edit `src/data/services.ts` and open a pull request - do not edit this',
 'file directly.*',
 '',
 `**Generated**: ${today}`,
 '',
 );
 return parts.join('\n');
}

const target = join(process.cwd(), 'docs', 'TARANAKI-DIRECTORY.md');
writeFileSync(target, build(), 'utf8');
console.log(`Wrote ${target}`);
