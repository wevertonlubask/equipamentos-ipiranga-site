'use client';

import { useEffect, useState } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

// Funcao para converter hex para RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Funcao para escurecer uma cor
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Funcao para clarear uma cor
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#c02c2a',
    secondary: '#1f2937',
    accent: '#eab308',
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Carregar cores do backend
    const loadColors = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/settings/public`);
        const data = await res.json();

        if (data.success && data.data) {
          const newColors: ThemeColors = {
            primary: data.data.theme_primary || '#c02c2a',
            secondary: data.data.theme_secondary || '#1f2937',
            accent: data.data.theme_accent || '#eab308',
          };
          setColors(newColors);
        }
      } catch (error) {
        console.error('Erro ao carregar cores do tema:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadColors();
  }, []);

  useEffect(() => {
    // Aplicar variaveis CSS
    const root = document.documentElement;

    // Cor primaria e variacoes
    const primaryRgb = hexToRgb(colors.primary);
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-50', lightenColor(colors.primary, 95));
    root.style.setProperty('--color-primary-100', lightenColor(colors.primary, 85));
    root.style.setProperty('--color-primary-200', lightenColor(colors.primary, 70));
    root.style.setProperty('--color-primary-300', lightenColor(colors.primary, 50));
    root.style.setProperty('--color-primary-400', lightenColor(colors.primary, 25));
    root.style.setProperty('--color-primary-500', colors.primary);
    root.style.setProperty('--color-primary-600', darkenColor(colors.primary, 10));
    root.style.setProperty('--color-primary-700', darkenColor(colors.primary, 25));
    root.style.setProperty('--color-primary-800', darkenColor(colors.primary, 40));
    root.style.setProperty('--color-primary-900', darkenColor(colors.primary, 55));
    if (primaryRgb) {
      root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    }

    // Cor secundaria
    const secondaryRgb = hexToRgb(colors.secondary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-secondary-dark', darkenColor(colors.secondary, 20));
    root.style.setProperty('--color-secondary-light', lightenColor(colors.secondary, 20));
    if (secondaryRgb) {
      root.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
    }

    // Cor de destaque (accent)
    const accentRgb = hexToRgb(colors.accent);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-dark', darkenColor(colors.accent, 15));
    root.style.setProperty('--color-accent-light', lightenColor(colors.accent, 30));
    if (accentRgb) {
      root.style.setProperty('--color-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    }

  }, [colors]);

  return <>{children}</>;
}
