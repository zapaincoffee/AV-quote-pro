'use client';

import * as React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import theme from '../theme'; // We'll create this next

// This is a basic Emotion cache that will be used to inject CSS.
const cache = createCache({ key: 'mui' });
cache.compat = true;

export default function ThemeRegistry(props: { children: React.ReactNode }) {
  const { children } = props;

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(' '),
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
