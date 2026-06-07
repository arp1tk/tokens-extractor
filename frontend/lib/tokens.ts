export interface TextStyle {
  family: string;
  size: string;
  weight: number;
  lineHeight?: number;
  letterSpacing?: string;
}

export interface FontEntry {
  family: string;
  source: string | null;
  role: string | null;
  usage: number;
}

export interface StyleProfile {
  brandColor?: string;
  isDark: boolean;
  cornerStyle: string;
  density: string;
  elevation: string;
  hasGradients: boolean;
  vibe: string[];
}

export interface Tokens {
  meta: { sourceUrl: string; scrapedAt: string };
  styleProfile?: StyleProfile;
  colorRoles?: Record<string, string>;
  colors?: Record<string, string>;
  typography?: {
    fontFamilies?: Record<string, string>;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string>;
    lineHeights?: Record<string, string>;
    letterSpacing?: Record<string, string>;
  };
  textStyles?: Record<string, TextStyle>;
  spacing?: Record<string, string>;
  radii?: Record<string, string>;
  shadows?: Record<string, string>;
  gradients?: string[];
  fonts?: FontEntry[];
  warning?: string;
}

export interface ApiError {
  error: { code: string; message: string };
}
