import type { AppProps } from 'next/app';
import Head from 'next/head';
import ThemeProvider from '../theme';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
