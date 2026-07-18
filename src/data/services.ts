import type { Service } from './types';

/**
 * Canonical services list - migrated from the previous
 * docs/TARANAKI-DIRECTORY.md and src/data/support-directory.json (now merged).
 *
 * Contact details are copied verbatim from those two files. The only content
 * edits made during migration:
 * - "Taranaki DHB" -> "Health New Zealand | Te Whatu Ora Taranaki"
 * (DHBs were disestablished on 1 July 2022).
 * - Removed the inline Best Start figure ("$73.86/week") - entitlement amounts
 * live in entitlements.ts with effective dates, never inline here.
 *
 * TODO(maintainer): walk this list and set lastVerified per entry after
 * confirming each phone/URL against the official source.
 */
export const SERVICES: Service[] = [
  // -- Neonatal & Health ---------------------------------------
  {
    id: 'taranaki-base-neonatal',
    name: 'Taranaki Base Hospital - Neonatal Unit',
    categories: ['neonatal', 'health'],
    region: 'Taranaki',
    contact: '(06) 753 6139',
    address: 'David Street, New Plymouth 4310',
    description:
      'Level 2 neonatal unit for preterm and unwell newborns. Neonatal social work, discharge planning, and support during NICU stay.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'health-nz-taranaki-maternity',
    name: 'Health New Zealand | Te Whatu Ora Taranaki - Maternity',
    categories: ['neonatal', 'health'],
    region: 'Taranaki',
    contact: '(06) 753 6139',
    url: 'https://www.tewhatuora.govt.nz/',
    description:
      'Maternity, postnatal and neonatal services including home visits, lactation support, and discharge planning.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'healthline',
    name: 'Healthline',
    categories: ['health'],
    region: 'National',
    contact: '0800 611 116',
    hours: '24/7',
    availability: '24/7',
    description:
      'Free health advice from registered nurses, 24 hours a day. Guidance on baby health concerns.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'little-miracles-trust',
    name: 'Little Miracles Trust',
    categories: ['neonatal', 'community'],
    region: 'National',
    contact: 'info@littlemiraclestrust.org.nz',
    url: 'https://www.littlemiraclestrust.org.nz/',
    description:
      'National neonatal charity. Emotional support, care packs, peer support, and playgroups for NICU families.',
    lastVerified: '2026-06-21',
  },

  // -- Well Child & Parenting ----------------------------------
  {
    id: 'plunketline',
    name: 'PlunketLine',
    categories: ['parenting', 'mental-health', 'health'],
    region: 'National',
    contact: '0800 933 922',
    url: 'https://www.plunket.org.nz/',
    hours: '24/7',
    availability: '24/7',
    description:
      'Free 24/7 parenting advice and support - feeding, sleep, development, and postnatal mental health.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'taranaki-plunket',
    name: 'Taranaki Plunket - Whanau Awhina',
    categories: ['parenting'],
    region: 'Taranaki',
    contact: '0800 184 803',
    description: 'Local Well Child clinics and home visits across Taranaki.',
    lastVerified: '2026-06-21',
  },

  // -- Mental Health & Wellbeing -------------------------------
  {
    id: '1737',
    name: '1737 - Need to Talk?',
    categories: ['mental-health'],
    region: 'National',
    contact: '1737 (call or text)',
    url: 'https://1737.org.nz/',
    hours: '24/7',
    availability: '24/7',
    crisis: true,
    description:
      'Free counselling. Call or text 1737 to talk with a trained counsellor about anything - stress, anxiety, grief, or just needing someone to listen.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'pada',
    name: 'Perinatal Anxiety & Depression Aotearoa (PADA)',
    categories: ['mental-health'],
    region: 'National',
    contact: '(04) 461 6318',
    url: 'https://www.pada.nz/',
    description:
      'Resources and directories for perinatal mental health. Not a crisis line - for immediate support use 1737 or PlunketLine.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'taranaki-retreat',
    name: 'Taranaki Retreat',
    categories: ['mental-health', 'community'],
    region: 'Taranaki',
    contact: '(06) 215 0993',
    url: 'https://taranakiretreat.org.nz/',
    address:
      '35 Octavius Place, New Plymouth (Waimanako Hub) / 517 Hurford Road, Omata (Residential)',
    crisis: true,
    description:
      'Free community-based mental health support, peer support, walk-in services, and residential retreat stays.',
    lastVerified: '2026-06-21',
  },

  // -- Financial Support ---------------------------------------
  {
    id: 'winz-new-plymouth',
    name: 'Work and Income (WINZ) - New Plymouth',
    categories: ['financial'],
    region: 'Taranaki',
    contact: '0800 559 009',
    url: 'https://www.workandincome.govt.nz/',
    address: '31-39 Hurlstone Drive, New Plymouth 4312',
    hours: 'Mon-Fri 8:30am-5:00pm',
    availability: 'business-hours',
    description:
      'Government financial assistance: Preterm Baby Payment, Home Help, Childcare Assistance, Accommodation Supplement, Recoverable Assistance, and emergency grants. Offices in New Plymouth and Hawera.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'ird-wff',
    name: 'Inland Revenue (IRD) - Best Start / Working for Families',
    categories: ['financial'],
    region: 'National',
    contact: '0800 227 774',
    url: 'https://www.ird.govt.nz/',
    hours: 'Mon-Fri 8:00am-8:00pm',
    availability: 'business-hours',
    // No dollar figures here - see entitlements.ts for dated, sourced amounts.
    description:
      'Best Start tax credit, Working for Families tax credits, and Paid Parental Leave / Preterm Baby Payments. Current amounts: see in-app entitlements or ird.govt.nz.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'cab-new-plymouth',
    name: 'Citizens Advice Bureau - New Plymouth',
    categories: ['financial', 'legal', 'community'],
    region: 'Taranaki',
    contact: '(06) 758 9542',
    url: 'https://www.cab.org.nz/',
    address: '32 Leach Street (Community House), New Plymouth',
    description:
      'Free, confidential advice on financial entitlements, tenancy rights, employment, and government services.',
    lastVerified: '2026-06-21',
  },

  // -- Housing & Tenancy ---------------------------------------
  {
    id: 'tenancy-services',
    name: 'Tenancy Services (MBIE)',
    categories: ['housing'],
    region: 'National',
    contact: '0800 836 262',
    url: 'https://www.tenancy.govt.nz/',
    description:
      'Government tenancy advice: repairs, bond disputes, rent increases, tenant rights, and free dispute resolution.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'kainga-ora',
    name: 'Kainga Ora - Homes and Communities',
    categories: ['housing'],
    region: 'National',
    contact: '0800 801 601',
    url: 'https://kaingaora.govt.nz/',
    description:
      'Public housing provider. Manages the Housing Register and provides emergency housing referrals.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'npdc-housing',
    name: 'New Plymouth District Council - Housing Support',
    categories: ['housing'],
    region: 'Taranaki',
    contact: '(06) 759 6060',
    url: 'https://www.npdc.govt.nz/',
    description:
      'Local council housing assistance, healthy homes assessments, and community services.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'community-law-taranaki',
    name: 'Community Law Taranaki',
    categories: ['legal', 'housing'],
    region: 'Taranaki',
    contact: '(06) 759 1492',
    altContact: '0800 529 878',
    url: 'https://www.taranakicommunitylaw.org.nz/',
    address: 'Level 1, Vero House, 10-12 Devon Street East, New Plymouth 4310',
    description:
      'Free legal advice and advocacy - tenancy, welfare benefits, and general legal matters.',
    lastVerified: '2026-06-21',
  },

  // -- Community & Whanau --------------------------------------
  {
    id: 'multiples-nz',
    name: 'Multiple Birth Association NZ (Multiples NZ)',
    categories: ['community', 'neonatal'],
    region: 'National',
    contact: '0800 489 467',
    url: 'https://www.multiples.org.nz/',
    description:
      'Support network for families with twins, triplets and higher-order multiples. Peer support, practical advice, and equipment hire via local groups (incl. Multiples Taranaki).',
    lastVerified: '2026-06-21',
  },
  {
    id: 'parents-centre-nz',
    name: 'Parents Centre New Zealand',
    categories: ['community', 'parenting'],
    region: 'National',
    contact: '(04) 476 6950',
    url: 'https://www.parentscentre.org.nz/',
    description:
      'Antenatal education, parenting support groups, and community connections for new parents.',
    lastVerified: '2026-06-21',
  },

  // -- Child Protection & Emergency ----------------------------
  {
    id: 'oranga-tamariki',
    name: 'Oranga Tamariki - Ministry for Children',
    categories: ['child-protection', 'community'],
    region: 'National',
    contact: '0508 326 459 (0508 FAMILY)',
    url: 'https://www.orangatamariki.govt.nz/',
    hours: '24/7',
    availability: '24/7',
    crisis: true,
    description:
      "Child protection and family support. 24/7 contact for concerns about a child's safety; also family support services.",
    lastVerified: '2026-06-21',
  },
  {
    id: 'emergency-111',
    name: 'Police, Fire, Ambulance',
    categories: ['emergency'],
    region: 'National',
    contact: '111',
    hours: '24/7',
    availability: '24/7',
    crisis: true,
    description: 'Emergency services for immediate danger to life or property.',
    lastVerified: '2026-06-21',
  },
  {
    id: 'poison-centre',
    name: 'National Poisons Centre',
    categories: ['emergency', 'health'],
    region: 'National',
    contact: '0800 764 766 (0800 POISON)',
    hours: '24/7',
    availability: '24/7',
    crisis: true,
    description: 'Urgent advice on poisoning or toxic exposure for children and adults.',
    lastVerified: '2026-06-21',
  },

  // -- Doctors & GPs -------------------------------------------
  {
    id: 'carefirst-medical',
    name: 'Carefirst Medical Centre',
    categories: ['doctors', 'health'],
    region: 'Taranaki',
    contact: '(06) 753 9505',
    url: 'https://carefirst.co.nz/',
    address: '99 Tukapa Street, Westown, New Plymouth',
    description:
      'Local General Practice offering family medicine, immunisations, and maternal care.',
    lastVerified: '2026-06-30',
  },
  {
    id: 'taranaki-pinnacle-health',
    name: 'Pinnacle Midlands Health Network',
    categories: ['doctors', 'health'],
    region: 'Taranaki',
    contact: '(06) 759 4322',
    description:
      'Network of local GPs. Can assist whanau in finding and enrolling with a doctor in the Taranaki region.',
    lastVerified: '2026-06-30',
  },

  // -- Wellness Centres ----------------------------------------
  {
    id: 'taranaki-womens-centre',
    name: "Taranaki Women's Centre",
    categories: ['wellness', 'community'],
    region: 'Taranaki',
    contact: '(06) 751 1618',
    url: 'https://taranakiwomenscentre.co.nz/',
    address: '69 Powderham Street, New Plymouth',
    description:
      "Support network focusing on women's holistic wellness, offering low-cost counselling, massage, and support groups.",
    lastVerified: '2026-06-30',
  },

  // -- Local Facilities ----------------------------------------
  {
    id: 'hospital-atm-base',
    name: 'TSB ATM - Taranaki Base Hospital',
    categories: ['facilities'],
    region: 'Taranaki',
    contact: 'On-site',
    address: 'David Street, New Plymouth (Hospital Main Entrance)',
    hours: '24/7',
    description:
      'Cash machine located near the main entrance of Taranaki Base Hospital. Useful for cafeteria or parking.',
    lastVerified: '2026-06-30',
  },
  {
    id: 'woolworths-np',
    name: 'Woolworths New Plymouth',
    categories: ['facilities'],
    region: 'Taranaki',
    contact: '(06) 758 0644',
    address: 'Corner of Leach and Eliot Street, New Plymouth',
    hours: '7:00am - 10:00pm daily',
    description:
      'Closest major supermarket to the hospital for purchasing groceries, nappies, and supplies.',
    lastVerified: '2026-06-30',
  },
];
