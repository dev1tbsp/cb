import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Cosmic Bites — Pure Vegetarian Catering</title>
        <meta name="description" content="Premium pure-vegetarian catering for birthdays, corporate, weddings & festive events. Live counters, 10+ cuisines, 20–500 guests." />
        <meta name="theme-color" content="#0B1511" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: BASE_CSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const BASE_CSS = `
html, body { background-color: #0B1511; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
* { box-sizing: border-box; }
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-track { background: #11201B; }
*::-webkit-scrollbar-thumb { background: #1F3A2E; border-radius: 4px; }
*::-webkit-scrollbar-thumb:hover { background: #E6B04D; }
`;
