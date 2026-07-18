export const PATHWAY_DATA = {
  financial: {
    title: '💰 Financial Support Pathway',
    steps: [
      {
        id: 'fin-1',
        title: 'Apply for Preterm Baby Payment',
        desc: 'Contact WINZ (0800 559 009) to apply for Preterm Baby Payment. Need proof of gestational age and bank details.',
      },
      {
        id: 'fin-2',
        title: 'Register Birth & Apply for Best Start',
        desc: 'Register twins births with DIA. Apply for Best Start tax credit ($73.86/week per child) via IRD.',
      },
      {
        id: 'fin-3',
        title: 'Request Needs Assessment at WINZ',
        desc: 'Ask for a full needs assessment. Covers Accommodation Supplement, Childcare assistance, and Disability allowance.',
      },
      {
        id: 'fin-4',
        title: 'Apply for Working for Families',
        desc: 'Contact IRD for Working for Families credits. Twin rates are substantially higher.',
      },
    ],
  },
  housing: {
    title: '🏠 Housing & Tenancy Pathway',
    steps: [
      {
        id: 'h-1',
        title: 'Assess Home for Preterm Baby Safety',
        desc: 'Check if house meets Healthy Homes standards. Preterm babies are highly vulnerable to cold/damp.',
      },
      {
        id: 'h-2',
        title: 'Request Repairs from Landlord',
        desc: 'Submit a 14-day notice to remedy in writing for any broken heating, dampness, or drafty windows.',
      },
      {
        id: 'h-3',
        title: 'Apply for Accommodation Supplement',
        desc: 'If renting or board is high, request Accommodation Supplement via MyMSD.',
      },
    ],
  },
  mental: {
    title: '💚 Perinatal Wellbeing Pathway',
    steps: [
      {
        id: 'mh-1',
        title: 'Set Up Immediate Support Resources',
        desc: 'Save 1737 (counselling) and 0800 933 922 (PlunketLine) to your mobile contacts.',
      },
      {
        id: 'mh-2',
        title: 'Start a Privacy-First Journal',
        desc: 'Write down thoughts in the Independent Journal tab to process stress and NICU stay emotions.',
      },
      {
        id: 'mh-3',
        title: 'Connect with Twin Peer Networks',
        desc: 'Join NZ Multiple Birth Association local parent support network.',
      },
    ],
  },
} as const;

export type PathwayKey = keyof typeof PATHWAY_DATA;
