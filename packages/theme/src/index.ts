export const tokens = {
  color: {
    background: '#f8fafc',
    foreground: '#0f172a',
    surface: '#ffffff',
    border: '#e2e8f0',
    brand: '#0f766e',
    brandForeground: '#f8fafc',
    danger: '#b91c1c',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

export function toCssVariables() {
  return {
    '--background': tokens.color.background,
    '--foreground': tokens.color.foreground,
    '--surface': tokens.color.surface,
    '--surface-border': tokens.color.border,
    '--brand': tokens.color.brand,
    '--brand-foreground': tokens.color.brandForeground,
  };
}