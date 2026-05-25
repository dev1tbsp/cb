// Simple SEO helper — only sets document title + description on web.
// On native this is a no-op (React Native has no head).

import { useEffect } from 'react';
import { Platform } from 'react-native';

interface Props {
  title: string;
  description?: string;
}

export function useSeo({ title, description }: Props) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;

      // Open Graph
      const setOg = (property: string, content: string) => {
        let m = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
        if (!m) {
          m = document.createElement('meta');
          m.setAttribute('property', property);
          document.head.appendChild(m);
        }
        m.content = content;
      };
      setOg('og:title', title);
      setOg('og:description', description);
      setOg('og:type', 'website');
    }
  }, [title, description]);
}
