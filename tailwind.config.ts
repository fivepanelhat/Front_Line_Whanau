import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Colour Palette ─────────────────────────────────
         Calming, trustworthy, grounded — ported from the
         original design system CSS custom properties.
         ─────────────────────────────────────────────────── */
      colors: {
        bg: {
          primary: '#0f172a',
          secondary: '#1e293b',
          card: '#1e293b',
          glass: 'rgba(30, 41, 59, 0.65)',
        },
        surface: '#334155',
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        accent: {
          primary: '#6366f1',
          secondary: '#06b6d4',
          warm: '#f59e0b',
          success: '#10b981',
          danger: '#ef4444',
        },
      },

      /* ── Typography ──────────────────────────────────── */
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        'heading-1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['1.875rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
      },

      /* ── Spacing & Layout ────────────────────────────── */
      maxWidth: {
        'site': '1200px',
      },

      /* ── Borders ─────────────────────────────────────── */
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },

      /* ── Shadows ─────────────────────────────────────── */
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 14px rgba(0, 0, 0, 0.35)',
        'lg': '0 10px 40px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 30px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.3)',
        'btn-primary': '0 4px 14px rgba(0, 0, 0, 0.35), 0 0 20px rgba(99, 102, 241, 0.2)',
        'btn-primary-hover': '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(99, 102, 241, 0.3)',
      },

      /* ── Transitions ─────────────────────────────────── */
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      /* ── Animations ──────────────────────────────────── */
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'hero-fade-1': 'fade-in-up 0.6s ease-out both',
        'hero-fade-2': 'fade-in-up 0.6s ease-out 0.1s both',
        'hero-fade-3': 'fade-in-up 0.6s ease-out 0.2s both',
        'hero-fade-4': 'fade-in-up 0.6s ease-out 0.3s both',
      },

      /* ── Background Image (Gradients) ────────────────── */
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'gradient-subtle': 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
        'hero-radial': 'radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
