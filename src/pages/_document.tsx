import palette from '@/theme/palette';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        <meta charSet="utf-8" />

        <meta name="theme-color" content={palette.primary.main} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
