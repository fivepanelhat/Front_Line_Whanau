import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // -- Color Palette ---------------------------------
      // Warm coastal forest palette: deep bush greens, driftwood amber,
      // seafoam teal, warm sand neutrals. Dark surfaces (header, Whānau Hub)
      // use these directly; page-level theming lives in globals.css vars.
      colors: {
        bg: {
          primary: '#101a15',
          secondary: '#182420',
          card: '#1b2620',
          glass: 'rgba(27, 38, 32, 0.65)',
        },
        surface: '#2a3a31',
        text: {
          primary: '#f2ede2',
          secondary: '#a9b8ab',
          muted: '#819187',
        },
        accent: {
          primary: '#d4a373',
          secondary: '#63ab97',
          warm: '#e0a458',
          success: '#7cb385',
          danger: '#d0645f',
          // Text colour for solid accent-primary surfaces. White on the tan
          // is 2.26:1 (fails WCAG AA); this dark driftwood ink is ~7.9:1.
          ink: '#231a10',
        },
      },

      // -- Typography -----------------------------------
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        'heading-1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['1.875rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
      },

      // -- Layout ---------------------------------------
      maxWidth: {
        site: '1200px',
      },

      // -- Borders & Radius -----------------------------
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        pill: '9999px',
      },

      // -- Shadows (liquid glass) -----------------------
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.12)',
        md: '0 8px 28px rgba(0, 0, 0, 0.18)',
        lg: '0 20px 50px rgba(0, 0, 0, 0.28)',
        glow: '0 8px 40px rgba(53, 128, 108, 0.22)',
        'glow-lg': '0 16px 56px rgba(53, 128, 108, 0.32)',
        'btn-primary':
          '0 8px 28px rgba(47, 117, 102, 0.35), 0 1px 0 rgba(255, 255, 255, 0.25) inset',
        'btn-primary-hover':
          '0 14px 36px rgba(47, 117, 102, 0.4), 0 1px 0 rgba(255, 255, 255, 0.3) inset',
        glass: '0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255, 255, 255, 0.12) inset',
        'glass-lg': '0 24px 64px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.14) inset',
      },

      // -- Transitions ----------------------------------
      transitionDuration: {
        '250': '250ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // -- Animations -----------------------------------
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
          '0%, 100%': { boxShadow: '0 8px 28px rgba(47, 117, 102, 0.28)' },
          '50%': { boxShadow: '0 12px 40px rgba(47, 117, 102, 0.45)' },
        },
        'liquid-float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.02)' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'liquid-float': 'liquid-float 6s ease-in-out infinite',
        sheen: 'sheen 2.8s ease-in-out infinite',
        'hero-fade-1': 'fade-in-up 0.6s ease-out both',
        'hero-fade-2': 'fade-in-up 0.6s ease-out 0.1s both',
        'hero-fade-3': 'fade-in-up 0.6s ease-out 0.2s both',
        'hero-fade-4': 'fade-in-up 0.6s ease-out 0.3s both',
      },

      // -- Background Gradients -------------------------
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #35806c 0%, #d4a373 100%)',
        'gradient-warm': 'linear-gradient(135deg, #e0a458 0%, #d0645f 100%)',
        'gradient-subtle': 'linear-gradient(180deg, rgba(53,128,108,0.1) 0%, transparent 100%)',
        'hero-radial':
          'radial-gradient(ellipse at 30% 20%, rgba(53, 128, 108, 0.14) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(212, 163, 115, 0.1) 0%, transparent 50%)',
        'liquid-sheen':
          'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 48%, transparent 65%)',
      },
    },
  },
  plugins: [forms],
};

export default config;
