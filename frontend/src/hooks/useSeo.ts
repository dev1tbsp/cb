import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useSeo(opts: { title: string; description?: string }) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof document === 'undefined') return;
    document.title = opts.title;
    if (opts.description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = opts.description;
    }
  }, [opts.title, opts.description]);
}
