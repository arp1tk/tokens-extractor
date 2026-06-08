import Results from '@/components/tool/Results';
import type { Tokens } from '@/lib/tokens';

const mock: Tokens = {
  meta: { sourceUrl: 'https://stripe.com', scrapedAt: '2026-06-08T00:00:00Z' },
  styleProfile: {
    brandColor: '#635bff',
    isDark: false,
    cornerStyle: 'rounded',
    density: 'comfortable',
    elevation: 'soft',
    hasGradients: true,
    vibe: ['modern', 'trustworthy', 'minimal'],
  },
  colorRoles: {
    primary: '#635bff',
    secondary: '#0a2540',
    accent: '#00d4ff',
    background: '#ffffff',
    surface: '#f6f9fc',
    text: '#0a2540',
  },
  colors: {
    'indigo-600': '#635bff',
    'navy-900': '#0a2540',
    'sky-400': '#00d4ff',
    'slate-50': '#f6f9fc',
    'slate-100': '#e6ebf1',
    'slate-400': '#8898aa',
    'green-500': '#3ecf8e',
    'red-500': '#ed5f74',
    'amber-400': '#f5be58',
    'white': '#ffffff',
    'black': '#0a0a0a',
    'violet-300': '#a3a0fb',
  },
  textStyles: {
    'Display': { family: 'Söhne, sans-serif', size: '56px', weight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' },
    'Heading': { family: 'Söhne, sans-serif', size: '32px', weight: 600, lineHeight: 1.2 },
    'Body': { family: 'Inter, sans-serif', size: '16px', weight: 400, lineHeight: 1.6 },
    'Caption': { family: 'Inter, sans-serif', size: '13px', weight: 500, lineHeight: 1.4, letterSpacing: '0.01em' },
  },
  fonts: [
    { family: 'Söhne', source: 'self-hosted', role: 'heading', usage: 64 },
    { family: 'Inter', source: 'Google Fonts', role: 'body', usage: 30 },
    { family: 'JetBrains Mono', source: 'self-hosted', role: 'mono', usage: 6 },
  ],
  shadows: {
    sm: '0 1px 2px rgba(10,37,64,0.08)',
    md: '0 4px 12px rgba(10,37,64,0.12)',
    lg: '0 12px 32px rgba(10,37,64,0.16)',
  },
  gradients: [
    'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
    'linear-gradient(90deg, #0a2540 0%, #635bff 100%)',
  ],
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px', '2xl': '64px' },
  radii: { sm: '4px', md: '8px', lg: '16px', full: '9999px' },
};

export default function PreviewPage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <Results data={mock} />
    </div>
  );
}
