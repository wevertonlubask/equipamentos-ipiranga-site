'use client';

import { useEffect, useState } from 'react';
import { getUploadUrl } from '@/utils';

export default function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/settings/public`);
        const data = await res.json();
        if (data.success && data.data?.site_favicon) {
          setFaviconUrl(getUploadUrl(data.data.site_favicon));
        }
      } catch (error) {
        console.error('Erro ao carregar favicon:', error);
      }
    };
    loadFavicon();
  }, []);

  useEffect(() => {
    if (!faviconUrl) return;

    // Atualizar favicon no documento
    const updateFavicon = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (link) {
        link.href = href;
      } else {
        link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        document.head.appendChild(link);
      }
    };

    // Atualizar todos os tipos de favicon
    updateFavicon('icon', faviconUrl);
    updateFavicon('shortcut icon', faviconUrl);
    updateFavicon('apple-touch-icon', faviconUrl);

  }, [faviconUrl]);

  return null;
}
