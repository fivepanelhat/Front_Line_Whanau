/**
 * Seed the live database with demo-ready content:
 * 1. Directory listings from the canonical src/data/services.ts
 * 2. A demo parent account (login for pitches/testing)
 * 3. A few approved peer stories authored by the demo account
 *
 * Idempotent: safe to re-run - existing rows are skipped, not duplicated.
 *
 * Run: npx tsx scripts/seed-demo.ts
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (from .env.local)
 */
import { createClient } from '@supabase/supabase-js';
import { SERVICES } from '../src/data/services';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
 console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
 process.exit(1);
}

const supabase = createClient(url, serviceKey);

const DEMO_EMAIL = 'demo-whanau@frontlinewhanau.nz';
const DEMO_PASSWORD = 'DemoWhanau2026!';

function titleCase(s: string) {
 return s.charAt(0).toUpperCase() + s.slice(1);
}

async function seedDirectory() {
 const { data: existing, error } = await supabase
 .from('directory_listings')
 .select('organisation');
 if (error) throw error;

 const have = new Set((existing || []).map((r) => r.organisation));
 const rows = SERVICES.filter((s) => !have.has(s.name)).map((s) => {
 const contact = s.contact || '';
 const isEmail = contact.includes('@');
 return {
 organisation: s.name,
 service_type: titleCase(s.categories?.[0] || 'support'),
 region: s.region || 'National',
 description: [s.description, s.address ? `Address: ${s.address}` : null, s.hours ? `Hours: ${s.hours}` : null]
 .filter(Boolean)
 .join(' '),
 contact_email: isEmail ? contact : null,
 contact_phone: isEmail ? null : contact || null,
 website_url: s.url || null,
 is_verified: true,
 is_active: true,
 };
 });

 if (rows.length === 0) {
 console.log(`Directory: all ${SERVICES.length} services already present, nothing to do.`);
 return;
 }
 const { error: insErr } = await supabase.from('directory_listings').insert(rows);
 if (insErr) throw insErr;
 console.log(`Directory: inserted ${rows.length} listings (${have.size} already existed).`);
}

async function ensureDemoUser(): Promise<string> {
 // listUsers pagination is fine here - tiny beta user base
 const { data: list, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
 if (error) throw error;
 const found = list.users.find((u) => u.email === DEMO_EMAIL);
 if (found) {
 console.log(`Demo user: already exists (${DEMO_EMAIL}).`);
 return found.id;
 }
 const { data: created, error: createErr } = await supabase.auth.admin.createUser({
 email: DEMO_EMAIL,
 password: DEMO_PASSWORD,
 email_confirm: true,
 user_metadata: { role: 'parent', display_name: 'Demo Whanau' },
 });
 if (createErr) throw createErr;
 console.log(`Demo user: created ${DEMO_EMAIL} (password: ${DEMO_PASSWORD}).`);
 return created.user.id;
}

const STORIES = [
 {
 title: 'Sixty-three days in NICU - what I wish someone had told me',
 content:
 'Our girls arrived at 28 weeks. The first week was a blur of machines and acronyms nobody explained. What got us through: writing one question down every night to ask the morning round, saying yes every single time someone offered a meal, and the Little Miracles care pack that showed up on day three. If you are at the start of this road - the unit becomes less frightening. You learn the alarms. You learn your babies. Kia kaha.',
 tags: ['nicu', 'twins', '28-weeks'],
 },
 {
 title: 'Getting the financial support we did not know existed',
 content:
 'Nobody at the hospital mentioned we could apply for financial help while our son was in the neonatal unit. A social worker finally pointed us to Work and Income three weeks in. If your pepi arrived early: ask about Best Start, ask about the Disability Allowance for travel costs, and keep every parking receipt. The whanau in the ward next to us drove 90 minutes each way for five weeks - those costs count.',
 tags: ['financial', 'winz', 'best-start'],
 },
 {
 title: 'Coming home on oxygen - our first month',
 content:
 'Bringing our daughter home with an oxygen cylinder was terrifying and wonderful at the same time. Our Plunket nurse visited weekly and never made us feel like we were overreacting. Practical things that helped: a whiteboard on the fridge tracking feeds and sats, a group chat with two other NICU mums from our cohort, and giving ourselves permission to say no to visitors. Six months on she is thriving.',
 tags: ['home-oxygen', 'plunket', 'transition-home'],
 },
];

async function seedStories(authorId: string) {
 const { data: existing, error } = await supabase.from('peer_stories').select('title');
 if (error) throw error;
 const have = new Set((existing || []).map((r) => r.title));

 const rows = STORIES.filter((s) => !have.has(s.title)).map((s) => ({
 author_id: authorId,
 title: s.title,
 content: s.content,
 tags: s.tags,
 is_approved: true,
 cultural_safety_approved: true,
 }));

 if (rows.length === 0) {
 console.log('Stories: all demo stories already present, nothing to do.');
 return;
 }
 const { error: insErr } = await supabase.from('peer_stories').insert(rows);
 if (insErr) throw insErr;
 console.log(`Stories: inserted ${rows.length} approved peer stories.`);
}

async function main() {
 await seedDirectory();
 const authorId = await ensureDemoUser();
 await seedStories(authorId);
 console.log('Seed complete.');
}

main().catch((e) => {
 console.error('Seed failed:', e);
 process.exit(1);
});
